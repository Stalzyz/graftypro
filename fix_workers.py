import re

with open("worker.ts", "r") as f:
    content = f.read()

# The bug: campaignWorker and campaignBatchWorker are two separate Worker instances
# listening on the same "campaign-queue". We need to merge them into one.

# Let's extract the body of campaignBatchWorker
batch_worker_match = re.search(r'export const campaignBatchWorker = new Worker\(\s*"campaign-queue",\s*async \(job\) => \{(.*?)\},\s*\{ connection: REDIS_CONNECTION, concurrency: 5 \}\s*\);', content, re.DOTALL)

if not batch_worker_match:
    print("Could not find campaignBatchWorker")
    exit(1)

batch_worker_body = batch_worker_match.group(1)
# Remove the 'if (job.name !== "dispatch-batch") return;' line since we will wrap it
batch_worker_body = batch_worker_body.replace('if (job.name !== "dispatch-batch") return;', '')

# Remove the entire campaignBatchWorker definition from content
content = content.replace(batch_worker_match.group(0), '')

# Now wrap the existing campaignWorker body
# We find export const campaignWorker = new Worker("campaign-queue", async (job) => { ... }, { connection: REDIS_CONNECTION, concurrency: 5 });
campaign_worker_match = re.search(r'export const campaignWorker = new Worker\(\s*"campaign-queue",\s*async \(job\) => \{(.*?)\},\s*\{ connection: REDIS_CONNECTION, concurrency: 5 \}\s*\);', content, re.DOTALL)

if not campaign_worker_match:
    print("Could not find campaignWorker")
    exit(1)

campaign_worker_body = campaign_worker_match.group(1)

# Now we construct the new body
new_body = f"""
        if (job.name === "dispatch-batch") {{
{batch_worker_body}
        }} else {{
{campaign_worker_body}
        }}
"""

new_campaign_worker = f"""export const campaignWorker = new Worker(
    "campaign-queue",
    async (job) => {{{new_body}}},
    {{ connection: REDIS_CONNECTION, concurrency: 5 }}
);"""

content = content.replace(campaign_worker_match.group(0), new_campaign_worker)

with open("worker.ts", "w") as f:
    f.write(content)

print("worker.ts patched successfully.")

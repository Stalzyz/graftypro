import os
import re

directory = "/Users/stalinkumar/Downloads/Wabot_BSP/app/super-admin/dashboard/"

# Targeted replacements to avoid breaking dark mode containers
def fix_classes(match):
    original = match.group(0)
    # Replace the text-slate-* inside the match
    updated = original.replace("text-white", "text-slate-700")
    updated = updated.replace("text-slate-100", "text-slate-500")
    updated = updated.replace("text-slate-200", "text-slate-400")
    updated = updated.replace("text-slate-300", "text-slate-500")
    return updated

# Regex means: find bg-slate-50 or bg-slate-100 or bg-white, 
# then any characters within the same quotes, then a text element that is too light.
pattern1 = re.compile(r'class(?:Name)?=[\'"][^\'"]*?\bbg-(?:slate-50|slate-100|white|zinc-50)\b[^\'"]*?\btext-(?:slate-200|slate-300|white|zinc-300)\b[^\'"]*?[\'"]')

# Another case: text-slate-300 followed by hover:text-slate-900 (nav links)
def fix_nav(match):
    original = match.group(0)
    return original.replace("text-slate-300", "text-slate-500")

pattern2 = re.compile(r'class(?:Name)?=[\'"][^\'"]*?\btext-slate-300\b[^\'"]*?(?:hover|group-hover):text-(?:slate-700|slate-800|slate-900|blue-600|indigo-600)[^\'"]*?[\'"]')

# Edge cases where text-slate-300 is used standalone in a text component we know is light
# For example, placeholders or icons next to text slate-900.
def fix_inputs(match):
    return match.group(0).replace("placeholder:text-slate-300", "placeholder:text-slate-400")

pattern_placeholder = re.compile(r'class(?:Name)?=[\'"][^\'"]*?\bplaceholder:text-(?:slate-200|slate-300)\b[^\'"]*?[\'"]')

count = 0
for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith(".tsx"):
            filepath = os.path.join(root, file)
            with open(filepath, "r") as f:
                content = f.read()
            
            new_content = pattern1.sub(fix_classes, content)
            new_content = pattern2.sub(fix_nav, new_content)
            new_content = pattern_placeholder.sub(fix_inputs, new_content)
            
            if new_content != content:
                with open(filepath, "w") as f:
                    f.write(new_content)
                count += 1
                print(f"Updated {file}")

print(f"Fixed CSS contrast in {count} files.")

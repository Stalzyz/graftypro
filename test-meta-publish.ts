import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { decrypt } from './lib/security/encryption';

const prisma = new PrismaClient();
const META_VERSION = "v21.0";
const BASE_URL = `https://graph.facebook.com/${META_VERSION}`;

async function run() {
    const account = await prisma.whatsAppAccount.findFirst();
    const token = decrypt(account.access_token);
    // Find the flow that failed
    const flow = await prisma.flow.findFirst({ where: { meta_flow_status: { not: "PUBLISHED" }, meta_flow_id: { not: null } }, orderBy: { updated_at: 'desc' } });
    if (!flow || !flow.meta_flow_id) return console.log("No flow found");
    console.log("Trying to publish flow:", flow.meta_flow_id);
    
    try {
        await axios.post(`${BASE_URL}/${flow.meta_flow_id}/publish`, null, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Success!");
    } catch (e: any) {
        console.log(JSON.stringify(e.response?.data, null, 2));
    }
}
run().catch(console.error);

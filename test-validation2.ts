import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { decrypt } from './lib/security/encryption';

const prisma = new PrismaClient();
const META_VERSION = 'v21.0';
const BASE_URL = `https://graph.facebook.com/${META_VERSION}`;

async function run() {
    const account = await prisma.whatsAppAccount.findFirst();
    const token = decrypt(account.access_token);
    
    // Check if we can find the flow id directly
    try {
        const res = await axios.get(`${BASE_URL}/${account.waba_id}/flows`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        // Find the most recently updated flow
        const sortedFlows = res.data.data;
        const targetId = sortedFlows[0].id;
        
        console.log('Fetching assets for flow:', targetId, sortedFlows[0].name);
        
        const detailsRes = await axios.get(`${BASE_URL}/${targetId}/assets`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log(JSON.stringify(detailsRes.data, null, 2));
    } catch (e: any) {
        console.log(JSON.stringify(e.response?.data, null, 2));
    }
}
run().catch(console.error);

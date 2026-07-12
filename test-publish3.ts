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
        const flow = res.data.data.find((f: any) => f.name === 'meta_flow_mraxsg6w' || f.id === 'meta_flow_mraxsg6w');
        const targetId = flow ? flow.id : '27387501587525199'; // I saw 27387501587525199 in the DB earlier for flow_id!
        
        console.log('Trying to publish flow:', targetId);
        await axios.post(`${BASE_URL}/${targetId}/publish`, null, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Success!');
    } catch (e: any) {
        console.log(JSON.stringify(e.response?.data, null, 2));
    }
}
run().catch(console.error);

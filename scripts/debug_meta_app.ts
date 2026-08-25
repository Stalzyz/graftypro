import axios from 'axios';
import { prisma } from '../lib/db';

async function debugMetaApp() {
    const appId = '1183066783900270';
    const appSecret = '5db51ac570b334b41c759fa1df5bda02';
    
    const wsId = '89b6c788-d842-4bf6-8af9-bc02e84e76d2';
    const integration = await (prisma as any).integration.findFirst({
        where: { workspace_id: wsId, type: 'INSTAGRAM' }
    });

    if (!integration) {
        console.log('❌ No INSTAGRAM integration found in DB');
        return;
    }

    const token = integration.credentials?.access_token;
    if (!token) {
        console.log('❌ No access token found in integration credentials');
        return;
    }

    try {
        console.log('Querying debug_token...');
        const res = await axios.get(
            `https://graph.facebook.com/debug_token?input_token=${token}&access_token=${appId}|${appSecret}`
        );
        console.log('Debug Token Info:', JSON.stringify(res.data, null, 2));
    } catch (err: any) {
        console.error('Error debugging token with app credentials:', err.response?.data || err.message);
    }
}

debugMetaApp()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });

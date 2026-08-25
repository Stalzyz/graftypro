import axios from 'axios';
import { prisma } from '../lib/db';

async function debugTokenApp() {
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
        console.log('Querying app details using the token...');
        const res = await axios.get(`https://graph.facebook.com/v21.0/app?access_token=${token}`);
        console.log('App Details associated with this token:', JSON.stringify(res.data, null, 2));
    } catch (err: any) {
        console.error('Error querying app details:', err.response?.data || err.message);
    }
}

debugTokenApp()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });

import axios from 'axios';
import { prisma } from '../lib/db';

async function testAccountsQuery() {
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
        console.log('❌ No access token found');
        return;
    }

    try {
        console.log('Querying me/accounts with fields...');
        const res = await axios.get(
            `https://graph.facebook.com/v21.0/me/accounts?fields=name,access_token,instagram_business_account&access_token=${token}`
        );
        console.log('Accounts Response:', JSON.stringify(res.data, null, 2));
    } catch (err: any) {
        console.error('Error:', err.response?.data || err.message);
    }
}

testAccountsQuery()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });

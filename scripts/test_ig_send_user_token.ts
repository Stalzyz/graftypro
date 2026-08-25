import axios from 'axios';
import { prisma } from '../lib/db';

async function testIGSendUserToken() {
    const wsId = '89b6c788-d842-4bf6-8af9-bc02e84e76d2';
    const recipientId = '3849444891888008';
    const pageId = '991852124008126'; // Grekam Visuals Facebook Page ID

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

    console.log('\n--- Attempting with PAGE_ID in URL + USER Access Token ---');
    try {
        const res = await axios.post(
            `https://graph.facebook.com/v21.0/${pageId}/messages`,
            {
                recipient: { id: recipientId },
                message: { text: 'Hello from correct Page ID endpoint and User Access Token!' }
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log('✅ SUCCESS!', res.data);
    } catch (err: any) {
        console.error('❌ FAILED:', err.response?.data || err.message);
    }
}

testIGSendUserToken()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });

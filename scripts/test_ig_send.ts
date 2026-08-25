import axios from 'axios';
import { prisma } from '../lib/db';

async function testIGSendCorrectEndpoint() {
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

    // Get the page access token of Grekam Visuals (page ID: 991852124008126) from the user access token
    let pageAccessToken = '';
    try {
        const pagesRes = await axios.get(`https://graph.facebook.com/v21.0/me/accounts?access_token=${token}`);
        const grekamVisualsPage = pagesRes.data.data.find((p: any) => p.id === pageId);
        if (grekamVisualsPage) {
            pageAccessToken = grekamVisualsPage.access_token;
            console.log('✅ Found page access token starting with:', pageAccessToken.substring(0, 15));
        } else {
            console.log('❌ Grekam Visuals page not found in accounts');
        }
    } catch (e: any) {
        console.error('Error fetching page access token:', e.response?.data || e.message);
    }

    if (!pageAccessToken) {
        console.log('❌ Cannot proceed without page access token');
        return;
    }

    console.log('\n--- Attempting with PAGE_ID in URL + Page Access Token ---');
    try {
        const res = await axios.post(
            `https://graph.facebook.com/v21.0/${pageId}/messages`,
            {
                recipient: { id: recipientId },
                message: { text: 'Hello from correct Page ID endpoint and Page Access Token!' }
            },
            {
                headers: {
                    Authorization: `Bearer ${pageAccessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log('✅ SUCCESS!', res.data);
    } catch (err: any) {
        console.error('❌ FAILED:', err.response?.data || err.message);
    }
}

testIGSendCorrectEndpoint()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });

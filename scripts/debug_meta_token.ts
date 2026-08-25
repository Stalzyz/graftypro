import axios from 'axios';
import { prisma } from '../lib/db';

async function debugToken() {
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

    console.log('Token starts with:', token.substring(0, 15) + '...');

    try {
        // Query /me/accounts (Facebook Pages this token has access to)
        console.log('\nQuerying /me/accounts...');
        const pagesRes = await axios.get(`https://graph.facebook.com/v21.0/me/accounts?access_token=${token}`);
        console.log('Pages:', JSON.stringify(pagesRes.data, null, 2));

        // For each page, query instagram_business_account
        for (const page of pagesRes.data.data || []) {
            console.log(`\nQuerying Instagram Business Account for Page "${page.name}" (${page.id})...`);
            try {
                const igRes = await axios.get(
                    `https://graph.facebook.com/v21.0/${page.id}?fields=instagram_business_account&access_token=${token}`
                );
                console.log('Result:', JSON.stringify(igRes.data, null, 2));
            } catch (err: any) {
                console.error('Error querying IG account for page:', err.response?.data || err.message);
            }
        }

        // Query permissions of the token
        console.log('\nQuerying /me/permissions...');
        const permRes = await axios.get(`https://graph.facebook.com/v21.0/me/permissions?access_token=${token}`);
        console.log('Permissions:', JSON.stringify(permRes.data, null, 2));

    } catch (err: any) {
        console.error('Error debugging token:', err.response?.data || err.message);
    }
}

debugToken()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });

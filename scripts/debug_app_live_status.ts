import axios from 'axios';

async function debugVpsAppStatus() {
    const appId = '1183066783900270';
    const appSecret = '5db51ac570b334b41c759fa1df5bda02';
    
    try {
        console.log('Querying app status fields...');
        // Query app fields
        const res = await axios.get(
            `https://graph.facebook.com/v21.0/${appId}?fields=id,name,link,development_mode,auth_dialog_headline,company,creator_uid,logo_url,privacy_policy_url,terms_of_service_url,user_support_email,user_support_url&access_token=${appId}|${appSecret}`
        );
        console.log('App Status & Details:', JSON.stringify(res.data, null, 2));
    } catch (err: any) {
        console.error('Error querying app status:', err.response?.data || err.message);
    }
}

debugVpsAppStatus();

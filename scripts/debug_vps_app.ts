import axios from 'axios';

async function debugVpsApp() {
    const appId = '1183066783900270';
    const appSecret = '5db51ac570b334b41c759fa1df5bda02';
    
    try {
        console.log('Querying VPS app details...');
        const res = await axios.get(`https://graph.facebook.com/v21.0/${appId}?access_token=${appId}|${appSecret}`);
        console.log('VPS App Details:', JSON.stringify(res.data, null, 2));
    } catch (err: any) {
        console.error('Error querying VPS app:', err.response?.data || err.message);
    }
}

debugVpsApp();

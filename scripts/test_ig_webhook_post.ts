import axios from 'axios';

async function testWebhook() {
    const payload = {
        object: 'instagram',
        entry: [
            {
                time: Date.now(),
                id: '17841472999755924',
                messaging: [
                    {
                        sender: { id: '3849444891888008' },
                        recipient: { id: '17841472999755924' },
                        timestamp: Date.now(),
                        message: {
                            mid: 'test-mid-' + Math.random().toString(36).substring(7),
                            text: 'Ecommerce'
                        }
                    }
                ]
            }
        ]
    };

    console.log('Sending payload to local server...');
    try {
        const res = await axios.post('http://localhost:3000/api/webhooks/instagram', payload);
        console.log('Response Status:', res.status);
        console.log('Response Body:', res.data);
    } catch (err: any) {
        console.error('Error sending request:', err.response?.data || err.message);
    }
}

testWebhook();

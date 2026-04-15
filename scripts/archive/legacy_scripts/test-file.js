
const http = require('http');
const url = '/uploads/vendor/56180d30-e7bb-4410-92f1-3b721545bd12/general/general_72eb0a46_1771919911730.jpg';

http.get('http://localhost:3000' + url, (res) => {
    console.log('Status Code:', res.statusCode);
    console.log('Headers:', res.headers);
}).on('error', (err) => {
    console.error('Error:', err.message);
});

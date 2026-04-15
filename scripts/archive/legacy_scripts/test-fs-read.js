
const fs = require('fs');
const path = '/app/public/uploads/vendor/56180d30-e7bb-4410-92f1-3b721545bd12/general/general_72eb0a46_1771919911730.jpg';

try {
    const stats = fs.statSync(path);
    console.log('File Stats:', stats);
    const buf = fs.readFileSync(path);
    console.log('Read Success! Size:', buf.length);
} catch (e) {
    console.error('Read Failed:', e.message);
}

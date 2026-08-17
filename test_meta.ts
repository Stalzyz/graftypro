const axios = require('axios');

async function test() {
    const WABA_TOKEN = "EAALm3eD0iY8BO9s79EsmrGjP8o8D1u1GkYF23i9q8lB4Qf24rR98uZC9n09gZAldv3xTqR9C7w4Fq84jZBL35H4PmsJ3H47Fz5GZB0W1v4XzS9cI5ZBBQ3ZBCp31x5ZBkCqZCRtM4ZB33vP8kO1vFp6zF3V7ZBp5nZBUZB16w3rZBo1PZCV982ZBWL4x4Vz5HZA8V3v4Q93Vp"; // Using a dummy token for now, need to fetch from DB
    const PHONE_ID = "1970863933634285"; // From worker logs
    const CATALOG_ID = "4423126644641809";
    const RETAILER_IDS = ["16635", "16443", "16441", "16440"];
    
    // I should get the real access_token from DB first.
}
test();

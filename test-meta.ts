import { PrismaClient } from '@prisma/client';
import * as crypto from "crypto";
import axios from 'axios';

const prisma = new PrismaClient();
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "";

function decrypt(cipherText: string): string {
    const ALGORITHM = "aes-256-gcm";
    const key = Buffer.from(ENCRYPTION_KEY, "hex");
    const [ivHex, tagHex, encryptedData] = cipherText.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const tag = Buffer.from(tagHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    let decrypted = decipher.update(encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
}

async function test() {
    try {
        const waba = await prisma.whatsAppAccount.findFirst({
            where: { workspace_id: { startsWith: '3b04fc39' } }
        });
        if (!waba) {
            console.log('No WABA found');
            return;
        }
        
        const token = decrypt(waba.access_token);
        console.log('Phone ID:', waba.phone_number_id);
        
        const payload = {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: "918667634636", // Must use a real test number
            type: "interactive",
            interactive: {
                type: "product_list",
                header: { type: "text", text: "Catalog" },
                body: { text: "Browse products" },
                footer: { text: "Footer" },
                action: {
                    catalog_id: "4423126644641809",
                    sections: [
                        {
                            title: "Selected Products",
                            product_items: [
                                { product_retailer_id: "16635" },
                                { product_retailer_id: "16443" },
                                { product_retailer_id: "16441" },
                                { product_retailer_id: "16440" }
                            ]
                        }
                    ]
                }
            }
        };

        try {
            const res = await axios.post(
                `https://graph.facebook.com/v19.0/${waba.phone_number_id}/messages`,
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log("Success!", res.data);
        } catch (e: any) {
            console.log("Meta API Error:", JSON.stringify(e.response?.data, null, 2));
        }
    } catch (e) {
        console.error("Script error:", e);
    }
}
test();

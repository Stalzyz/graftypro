import axios from "axios";
import { decrypt } from "../security/encryption";

export class ShiprocketService {
    private static BASE_URL = "https://apiv2.shiprocket.in/v1/external";

    /**
     * Authenticate with Shiprocket and get a token.
     * Shiprocket tokens are valid for 24 hours.
     */
    static async login(email: string, password_encrypted: string): Promise<string> {
        try {
            const password = decrypt(password_encrypted);
            const response = await axios.post(`${this.BASE_URL}/auth/login`, {
                email,
                password
            });
            return response.data.token;
        } catch (error: any) {
            console.error("[Shiprocket] Login Error:", error.response?.data || error.message);
            throw new Error("Shiprocket Authentication Failed");
        }
    }

    /**
     * Track a shipment using AWB (Air Waybill) number.
     */
    static async trackAWB(awb: string, token: string) {
        try {
            const response = await axios.get(`${this.BASE_URL}/courier/track/awb/${awb}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            // Shiprocket returns tracking data in tracking_data.data
            return response.data.tracking_data?.data || null;
        } catch (error: any) {
            console.error("[Shiprocket] Track Error:", error.response?.data || error.message);
            return null;
        }
    }

    /**
     * Get tracking details for a specific order.
     */
    static async trackOrder(orderId: string, token: string) {
        try {
            const response = await axios.get(`${this.BASE_URL}/courier/track/order/${orderId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error: any) {
            console.error("[Shiprocket] Track Order Error:", error.response?.data || error.message);
            return null;
        }
    }

    /**
     * Map Shiprocket status to our internal OrderStatus.
     */
    static mapStatus(shiprocketStatus: string): string {
        const status = shiprocketStatus.toUpperCase();
        if (["PICKED UP", "IN TRANSIT", "SHIPPED"].includes(status)) return "SHIPPED";
        if (["DELIVERED"].includes(status)) return "DELIVERED";
        if (["CANCELLED"].includes(status)) return "CANCELLED";
        if (["RETURNED", "RTO"].includes(status)) return "RETURNED";
        return "PROCESSING";
    }
}

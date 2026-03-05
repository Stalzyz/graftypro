
export interface TrackingInfo {
    orderId: string;
    status: 'PENDING' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
    carrier: string;
    lastLocation: string;
    estimatedDelivery: string;
}

export class LogisticsService {
    static async getTrackingInfo(orderId: string): Promise<TrackingInfo | null> {
        // Simulate API Delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Mock Logic: If ID starts with 'WB', it's valid
        if (!orderId.toUpperCase().startsWith('WB')) {
            return null;
        }

        const statuses: TrackingInfo['status'][] = ['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

        return {
            orderId: orderId.toUpperCase(),
            status: randomStatus,
            carrier: 'Global Logistics',
            lastLocation: 'Mumbai Sorting Hub',
            estimatedDelivery: 'Feb 10, 2026'
        };
    }

    static getStatusEmoji(status: TrackingInfo['status']) {
        switch (status) {
            case 'PENDING': return '⏳';
            case 'IN_TRANSIT': return '🚚';
            case 'OUT_FOR_DELIVERY': return '🛵';
            case 'DELIVERED': return '✅';
            case 'CANCELLED': return '❌';
            default: return '📍';
        }
    }
}

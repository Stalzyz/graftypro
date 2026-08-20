import { prisma } from '../db';
import { WhatsAppService } from '../whatsapp/service';
import { decrypt } from '../security/encryption';

export class LocationRouter {
    /**
     * Calculates the distance between two coordinates in kilometers using the Haversine formula.
     */
    private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // Radius of the earth in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        const d = R * c; // Distance in km
        return d;
    }

    /**
     * Routes a conversation to the nearest branch based on user's location.
     */
    static async routeByLocation(
        workspaceId: string,
        contactPhone: string,
        userLat: number,
        userLon: number
    ): Promise<any> {
        console.log(`[LocationRouter] Routing for workspace ${workspaceId} based on location: ${userLat}, ${userLon}`);

        // Fetch all branches/stores for this workspace that have coordinates
        // Assuming a 'Branch' or 'StoreLocation' model exists. Adjust based on actual schema.
        // We'll use a hypothetical 'StoreLocation' for demonstration.
        const branches = await (prisma as any).storeLocation.findMany({
            where: { workspaceId: workspaceId, latitude: { not: null }, longitude: { not: null } }
        });

        if (!branches || branches.length === 0) {
            console.log(`[LocationRouter] No branches found for workspace ${workspaceId}`);
            return null;
        }

        // Find the nearest branch
        let nearestBranch = branches[0];
        let minDistance = this.calculateDistance(userLat, userLon, nearestBranch.latitude, nearestBranch.longitude);

        for (let i = 1; i < branches.length; i++) {
            const branch = branches[i];
            const distance = this.calculateDistance(userLat, userLon, branch.latitude, branch.longitude);
            if (distance < minDistance) {
                minDistance = distance;
                nearestBranch = branch;
            }
        }

        console.log(`[LocationRouter] Nearest branch is ${nearestBranch.name} at ${minDistance.toFixed(2)} km.`);

        // Here we would typically update the conversation assignment in the database.
        // For example:
        // await prisma.conversation.update({
        //     where: { /* find active conversation */ },
        //     data: { assignedBranchId: nearestBranch.id }
        // });

        // And optionally notify the user:
        const waAccount = await (prisma as any).whatsAppAccount.findUnique({
            where: { workspace_id: workspaceId }
        });

        if (waAccount) {
            const token = decrypt(waAccount.access_token);
            await WhatsAppService.sendText(
                waAccount.phone_number_id,
                token,
                contactPhone,
                `Thanks! Your nearest store is *${nearestBranch.name}* (approx. ${minDistance.toFixed(1)} km away).\nAddress: ${nearestBranch.address}\n\nAn agent from this branch will assist you shortly.`,
                workspaceId,
                "SERVICE",
                "Location Routing"
            );
        }

        return nearestBranch;
    }
}

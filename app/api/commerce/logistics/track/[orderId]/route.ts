import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/db";
import { getCurrentUser } from "../../../../../../lib/auth";
import { ShiprocketService } from "../../../../../../lib/logistics/shiprocket-service";
import { CommerceService } from "../../../../../../lib/commerce/service";
import { encrypt } from "../../../../../../lib/security/encryption";
import { LogisticsAutomationService } from "../../../../../../lib/logistics/automation-service";

export const dynamic = 'force-dynamic';

export async function GET(
    req: Request,
    { params }: { params: { orderId: string } }
) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // 1. Fetch the Order (Polymorphic check)
        let order: any = await prisma.commerceOrder.findUnique({
            where: { id: params.orderId },
            include: { store: true }
        });

        let isCommerceOrder = true;
        if (!order) {
            order = await prisma.order.findUnique({
                where: { id: params.orderId },
                include: { workspace: true }
            });
            isCommerceOrder = false;
        }

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        const workspaceId = isCommerceOrder ? order.store.workspace_id : order.workspace_id;
        if (workspaceId !== user.workspaceId) {
            return NextResponse.json({ error: "Unauthorized access to this order" }, { status: 403 });
        }

        if (!order.tracking_id) {
            return NextResponse.json({ error: "No tracking ID found for this order" }, { status: 400 });
        }

        // 2. Get Shiprocket Credentials from Store Config
        // For fallback, we'll try to find the NATIVE store logistics config
        let storeId = isCommerceOrder ? order.store.id : null;
        if (!storeId) {
            const nativeStore = await prisma.commerceStore.findFirst({
                where: { workspace_id: workspaceId, platform: 'NATIVE' }
            });
            if (nativeStore) storeId = nativeStore.id;
        }

        if (!storeId) {
            return NextResponse.json({ error: "Logistics not configured for this workspace" }, { status: 400 });
        }

        const config = await CommerceService.getLogisticsCredentials(storeId);
        const { email, password } = config;

        if (!email || !password) {
            return NextResponse.json({ error: "Shiprocket credentials missing in store configuration" }, { status: 400 });
        }

        // 3. Authenticate and Track
        console.log(`[Logistics] Tracking AWB: ${order.tracking_id} for Order: ${order.order_number || order.id}`);
        const token = await ShiprocketService.login(email, encrypt(password));
        const trackingData = await ShiprocketService.trackAWB(order.tracking_id, token);

        if (!trackingData) {
            return NextResponse.json({ error: "Failed to fetch tracking data from Shiprocket" }, { status: 500 });
        }

        // 4. Update Order Status in Database if changed
        const latestStatus = trackingData.status;
        const normalizedStatus = ShiprocketService.mapStatus(latestStatus);

        if (order.tracking_status !== latestStatus) {
            if (isCommerceOrder) {
                await prisma.commerceOrder.update({
                    where: { id: order.id },
                    data: {
                        tracking_status: latestStatus,
                        status: normalizedStatus as any,
                        tracking_last_check: new Date()
                    }
                });
            } else {
                await prisma.order.update({
                    where: { id: order.id },
                    data: {
                        tracking_status: latestStatus,
                        status: normalizedStatus as any,
                        tracking_last_check: new Date()
                    }
                });
            }
            
            // Trigger WhatsApp Notification
            await LogisticsAutomationService.notifyCustomer(order.id, latestStatus, trackingData);
            
            console.log(`[Logistics] Order ${order.order_number || order.id} status updated to: ${latestStatus} and customer notified.`);
        }

        return NextResponse.json({
            success: true,
            tracking: trackingData,
            orderStatus: normalizedStatus
        });

    } catch (error: any) {
        console.error("[Logistics API] Error:", error.message);
        return NextResponse.json({ error: error.message || "Logistics tracking failed" }, { status: 500 });
    }
}

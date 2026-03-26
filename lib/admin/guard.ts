
import { prisma } from "../db";
import { AdminSession } from "../admin-auth";

/**
 * Ensures an admin operation is safely targeting a valid vendor workspace.
 * Prevents "Ghost Updates" and cross-tenant leakage during admin mutations.
 */
export async function validateAdminVendorMutation(admin: AdminSession, workspaceId: string) {
    if (!admin || admin.role !== 'SUPER_ADMIN') {
        throw new Error("Unauthorized: Super Admin access required");
    }

    const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        include: {
            reseller: true // Useful for auditing/attribution
        }
    });

    if (!workspace) {
        throw new Error(`Critical Error: Workspace ${workspaceId} not found. Administrative mutation rejected.`);
    }

    return workspace;
}

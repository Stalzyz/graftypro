import { prisma } from "@/lib/db";
import { CreditService } from "../credits/service";

/**
 * 🧩 ADDON SERVICE
 * Central authority for modular feature access control.
 */
export const AddonService = {
  /**
   * Check if a workspace has a specific addon active.
   */
  async hasAddon(workspaceId: string, addonName: string): Promise<boolean> {
    const activation = await (prisma as any).workspaceAddon.findUnique({
      where: {
        workspace_id_addon_id: {
          workspace_id: workspaceId,
          addon_id: addonName // We use the name as a lookup or handle specific mapping
        }
      },
      include: { addon: true }
    });

    if (!activation) {
      // Fallback: Check if the addon name matches a global addon name
      const addonByRef = await (prisma as any).workspaceAddon.findFirst({
        where: {
          workspace_id: workspaceId,
          addon: { name: addonName },
          status: "ACTIVE"
        }
      });
      return !!addonByRef;
    }

    return activation.status === "ACTIVE";
  },

  /**
   * Get all active addons for a workspace.
   */
  async getActiveAddons(workspaceId: string) {
    return await (prisma as any).workspaceAddon.findMany({
      where: {
        workspace_id: workspaceId,
        status: "ACTIVE"
      },
      include: { addon: true }
    });
  },

  /**
   * Activate an addon for a workspace (Deduct credits and link).
   * @param skipCredits - If true, bypasses credit check (Super Admin override)
   */
  async activateAddon(workspaceId: string, addonId: string, creditCost?: number, skipCredits: boolean = false) {
    return await prisma.$transaction(async (tx) => {
      // 1. Double check balance & Deduct Credits (unless skipped)
      const addon = await (tx as any).addon.findUnique({ where: { id: addonId } });
      if (!addon) throw new Error("Addon not found.");

      if (!skipCredits) {
        await CreditService.deductCreditsForAddon(
          tx,
          workspaceId,
          creditCost || addon.price,
          addon.title,
          `Unlocked Marketplace Addon: ${addon.title}`
        );
      }
      
      // 2. Create Activation
      const activation = await (tx as any).workspaceAddon.upsert({
        where: {
          workspace_id_addon_id: {
            workspace_id: workspaceId,
            addon_id: addonId
          }
        },
        update: {
          status: "ACTIVE",
          activated_at: new Date()
        },
        create: {
          workspace_id: workspaceId,
          addon_id: addonId,
          status: "ACTIVE"
        }
      });

      // 🎯 Trigger Email Notification (Non-blocking)
      try {
        const workspace = await (tx as any).workspace.findUnique({
          where: { id: workspaceId },
          include: { users: { where: { role: 'OWNER' } } }
        });
        const ownerEmail = workspace?.users[0]?.email;
        if (ownerEmail) {
          const { EmailService } = await import("../email/service");
          EmailService.sendAddonActivationEmail(workspaceId, ownerEmail, addon.name).catch(e => {
            console.error("[Addon Email] Failed:", e.message);
          });
        }
      } catch (e) {
        console.warn("[Addon Service] Email hook error:", e);
      }

      return activation;
    });
  },

  /**
   * Deactivate/Revoke an addon for a workspace.
   */
  async deactivateAddon(workspaceId: string, addonId: string) {
    return await (prisma as any).workspaceAddon.update({
      where: {
        workspace_id_addon_id: {
          workspace_id: workspaceId,
          addon_id: addonId
        }
      },
      data: {
        status: "REVOKED"
      }
    });
  }
};

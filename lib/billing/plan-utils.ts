
import { prisma } from "../db";

export type FeatureKey = 
  | 'module_crm' 
  | 'module_ecommerce' 
  | 'module_academy' 
  | 'module_drip' 
  | 'module_integration' 
  | 'api_access'
  | 'flow_logic';

export interface PlanEntitlements {
    name: string;
    features: FeatureKey[];
}

export const PLAN_FEATURES: Record<string, FeatureKey[]> = {
    "FREE": [],
    "STARTER": [],
    "GROWTH": [
        'module_crm',
        'module_ecommerce',
        'module_academy'
    ],
    "ENTERPRISE": [
        'module_crm',
        'module_ecommerce',
        'module_academy',
        'module_drip',
        'module_integration',
        'api_access',
        'flow_logic'
    ]
};

export async function getWorkspaceEntitlements(workspaceId: string) {
    const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: {
            plan: true,
            current_plan_id: true,
            subscription_status: true,
        }
    });

    if (!workspace) return PLAN_FEATURES["FREE"];

    // If they have a custom plan ID, we might need to fetch its specific features from DB
    // But for the standard tiers:
    const planName = workspace.plan?.toUpperCase() || "FREE";
    return PLAN_FEATURES[planName] || PLAN_FEATURES["FREE"];
}

export function hasFeature(planName: string, feature: FeatureKey): boolean {
    const features = PLAN_FEATURES[planName.toUpperCase()] || [];
    return features.includes(feature);
}

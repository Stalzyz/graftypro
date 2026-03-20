/**
 * PHASE 0: FINANCIAL RULES & MARGIN LOCK
 * Centralized financial safety for the Hybrid Reseller Engine.
 * 
 * "We build safety -> structure -> automation -> intelligence -> control."
 */

export const FINANCIAL_RULES = {
    // Platform Safety
    MARGIN_FLOOR_PERCENT: 15.0, // Platform must keep at least 15% revenue
    MAX_RESELLER_COMMISSION: 40.0, // Hard cap on reseller share

    // Payout Rules
    MINIMUM_PAYOUT_AMOUNT: 2000, // INR (or currency unit)
    PAYOUT_PROCESSING_DAYS: 7,   // Cycle duration

    // Fraud Risk (Phase 7)
    RISK_THRESHOLD_HIGH: 80,
    RAPID_SIGNUP_WINDOW_MINS: 60,
    DAILY_PAYOUT_VELOCITY_LIMIT: 50000, // INR
};

/**
 * Calculates the available commission for a transaction.
 * Ensures the margin floor rule is NEVER violated.
 */
export function calculateResellerCommission(
    paymentAmount: number,
    resellerRate: number, // e.g. 20.0
    customMarkup: number = 0 // e.g. 5.0
): { resellerShare: number; platformShare: number; totalMarkup: number } {

    // Base calculation
    const baseRate = Math.min(resellerRate, FINANCIAL_RULES.MAX_RESELLER_COMMISSION);
    const totalRate = baseRate + customMarkup;

    // Enforce Margin Floor
    // If platform share would drop below floor, we trim the commission.
    const platformRate = 100 - totalRate;

    let finalTotalRate = totalRate;
    if (platformRate < FINANCIAL_RULES.MARGIN_FLOOR_PERCENT) {
        console.warn("⚠️ FINANCIAL PROTECTION: Margin floor violation avoided.");
        finalTotalRate = 100 - FINANCIAL_RULES.MARGIN_FLOOR_PERCENT;
    }

    const resellerShare = (paymentAmount * finalTotalRate) / 100;
    const platformShare = paymentAmount - resellerShare;

    return {
        resellerShare,
        platformShare,
        totalMarkup: customMarkup
    };
}

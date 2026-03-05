"use client";

/**
 * Client-side safe number polyfill
 * Use this in client components that need extra protection
 */

if (typeof window !== "undefined") {
    // Store original toLocaleString
    const originalToLocaleString = Number.prototype.toLocaleString;

    // Only override if not already overridden
    if (!Number.prototype.toLocaleString.toString().includes("isNaN")) {
        Number.prototype.toLocaleString = function (...args: any[]) {
            // Handle NaN and Infinity
            if (isNaN(this.valueOf()) || !isFinite(this.valueOf())) {
                return "0";
            }
            return originalToLocaleString.apply(this, args as any);
        };
    }

    // Add global safe formatter
    (window as any).safeFormat = function (value: any, defaultValue: number = 0) {
        if (value == null || value === "" || (typeof value === "number" && isNaN(value))) {
            return Number(defaultValue).toLocaleString();
        }
        const num = Number(value);
        return isNaN(num) ? Number(defaultValue).toLocaleString() : num.toLocaleString();
    };
}

export { };

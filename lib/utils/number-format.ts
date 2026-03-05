/**
 * Safe number formatting utilities
 * Prevents "Cannot read properties of undefined (reading 'toLocaleString')" errors
 */

/**
 * Safely format a number with locale string
 * @param value - The value to format (can be null, undefined, number, string, or Decimal)
 * @param defaultValue - Default value if input is invalid (default: 0)
 * @param locale - Locale string (default: 'en-IN')
 * @param options - Intl.NumberFormatOptions
 */
export function safeToLocaleString(
    value: any,
    defaultValue: number = 0,
    locale: string = 'en-IN',
    options?: Intl.NumberFormatOptions
): string {
    // Handle null, undefined, NaN
    if (value == null || value === '' || (typeof value === 'number' && isNaN(value))) {
        return defaultValue.toLocaleString(locale, options);
    }

    // Convert to number
    const numValue = Number(value);

    // Check if conversion was successful
    if (isNaN(numValue)) {
        return defaultValue.toLocaleString(locale, options);
    }

    return numValue.toLocaleString(locale, options);
}

/**
 * Format currency (Indian Rupees)
 */
export function formatCurrency(value: any, defaultValue: number = 0): string {
    return '₹' + safeToLocaleString(value, defaultValue);
}

/**
 * Format percentage
 */
export function formatPercentage(value: any, defaultValue: number = 0): string {
    return safeToLocaleString(value, defaultValue) + '%';
}

/**
 * Ensure a value is a valid number
 */
export function ensureNumber(value: any, defaultValue: number = 0): number {
    if (value == null || value === '' || (typeof value === 'number' && isNaN(value))) {
        return defaultValue;
    }

    const numValue = Number(value);
    return isNaN(numValue) ? defaultValue : numValue;
}

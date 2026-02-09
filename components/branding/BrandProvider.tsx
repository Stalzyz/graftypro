'use client';

import { useEffect } from 'react';

interface BrandProviderProps {
    colors?: {
        primary: string;
        secondary: string;
    };
    brandName?: string;
    logoUrl?: string;
    children: React.ReactNode;
}

/**
 * PHASE 2: DYNAMIC CSS INJECTOR
 * Overrides platform variables with Reseller branding.
 */
export function BrandProvider({ colors, children }: BrandProviderProps) {
    useEffect(() => {
        if (colors) {
            const root = document.documentElement;

            // Inject Primary Color
            root.style.setProperty('--wa-green-500', colors.primary);
            root.style.setProperty('--wa-green-600', colors.primary); // Simplified override

            // Inject Secondary/Info Color
            root.style.setProperty('--info', colors.secondary);

            // Re-calculate some gradients/shadows if needed
            root.style.setProperty('--btn-primary-bg', `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primary} 100%)`);
        }
    }, [colors]);

    return <>{children}</>;
}

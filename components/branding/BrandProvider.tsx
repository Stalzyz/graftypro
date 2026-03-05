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
 * Forced LIGHT mode only.
 */
export function BrandProvider({ colors, children }: BrandProviderProps) {
    useEffect(() => {
        const root = document.documentElement;

        if (colors) {
            root.style.setProperty('--wa-green-500', colors.primary);
            root.style.setProperty('--wa-green-600', colors.primary);
            root.style.setProperty('--wa-brand', colors.primary);
            root.style.setProperty('--info', colors.secondary);
            root.style.setProperty('--wa-secondary', colors.secondary);
            root.style.setProperty('--btn-primary-bg', `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primary} 100%)`);
        }

        // FORCE LIGHT MODE
        root.classList.add('light');
        root.classList.remove('dark');
        root.style.colorScheme = 'light';
        localStorage.setItem("theme", "light");

    }, [colors]);

    return <>{children}</>;
}

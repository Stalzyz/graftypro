
'use client';

import { Logo } from "../ui/Logo";

interface DynamicLogoProps {
    logoUrl?: string;
    brandName?: string;
    className?: string;
    size?: number;
    showText?: boolean;
    variant?: "light" | "dark" | "color";
}

/**
 * PHASE 2: WHITE-LABEL LOGO
 * Renders either the system default or the Reseller/Enterprise logo dynamically.
 */
export function DynamicLogo({
    logoUrl,
    brandName,
    className = "",
    size = 40,
    showText = false,
    variant = "color"
}: DynamicLogoProps) {
    if (logoUrl && logoUrl !== "/grafty.svg" && logoUrl !== "/grafty_fav.png" && logoUrl !== "/grafty_brand.svg") {
        return (
            <div className={`flex items-center gap-3 ${className}`}>
                <div
                    className="flex items-center justify-center shrink-0"
                    style={{ height: size }}
                >
                    <img
                        src={logoUrl}
                        alt={brandName || "Logo"}
                        style={{ height: '100%', width: 'auto' }}
                        className="object-contain"
                    />
                </div>
                {showText && brandName && (
                    <span
                        className={`font-black tracking-tighter whitespace-nowrap
                            ${size > 40 ? 'text-2xl' : 'text-xl'}
                            ${variant === 'light' ? 'text-white' : 'text-slate-900 dark:text-white'}
                        `}
                        style={{ lineHeight: 1 }}
                    >
                        {brandName}
                    </span>
                )}
            </div>
        );
    }

    // Default to the optimized System Logo
    return (
        <Logo
            className={className}
            size={size}
            showText={showText}
            variant={variant}
            brandName={brandName}
            logoUrl={logoUrl}
        />
    );
}

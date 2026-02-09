'use client';

interface DynamicLogoProps {
    logoUrl?: string;
    brandName?: string;
    className?: string;
}

/**
 * PHASE 2: WHITE-LABEL LOGO
 * Renders either the system logo or the Reseller's own logo.
 */
import { Logo } from "@/components/ui/Logo";

export function DynamicLogo({ logoUrl, brandName, className = "h-8" }: DynamicLogoProps) {
    if (logoUrl) {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                <img
                    src={logoUrl}
                    alt={brandName || "Logo"}
                    className="h-full object-contain"
                />
                {brandName && <span className="font-bold text-gray-900">{brandName}</span>}
            </div>
        );
    }

    // System Default Logo (Wavo)
    return <Logo className={className} variant="color" size={48} />;
}

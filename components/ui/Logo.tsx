
"use client";

import React, { useState } from "react";
import Link from "next/link";

interface LogoProps {
    className?: string;
    size?: number;
    variant?: "light" | "dark" | "color";
    showText?: boolean;
    brandName?: string;
    logoUrl?: string | null;
    href?: string;
}

export const Logo: React.FC<LogoProps> = ({
    className = "",
    size = 40,
    variant = "color",
    showText = true,
    brandName = "Grafty",
    logoUrl,
    href = "/"
}) => {
    const [imgError, setImgError] = useState(false);
    const finalLogoUrl = logoUrl || "/grafty.svg";

    // Letter avatar fallback — no Grafty SVG
    const LetterAvatar = (
        <div
            className="rounded-xl flex items-center justify-center font-black text-white shadow-sm flex-shrink-0"
            style={{
                width: size,
                height: size,
                backgroundColor: variant === 'light' ? 'rgba(255,255,255,0.15)' : '#0F172A',
                fontSize: Math.round(size * 0.45),
                lineHeight: 1,
            }}
        >
            {(brandName || "P").charAt(0).toUpperCase()}
        </div>
    );

    const showImage = finalLogoUrl && !imgError;

    return (
        <Link href={href || "/"} className={`group flex items-center gap-3 outline-none ${className}`}>
            <div
                className="relative flex-shrink-0 flex items-center justify-center"
                style={{ height: size, width: showImage ? 'auto' : size }}
            >
                {showImage ? (
                    <img
                        src={finalLogoUrl}
                        alt={brandName || "Logo"}
                        className={`h-full w-auto object-contain transition-all ${variant === 'light' ? 'brightness-0 invert' : ''}`}
                        style={{ height: size, maxWidth: size * 3 }}
                        onError={() => setImgError(true)}
                    />
                ) : (
                    LetterAvatar
                )}
            </div>

            {showText && (
                <span
                    className={`font-black tracking-tighter select-none whitespace-nowrap ${size > 40 ? 'text-2xl' : 'text-xl'} ${variant === 'light' ? 'text-white' : 'text-slate-900'}`}
                    style={{ lineHeight: 1 }}
                >
                    {brandName?.trim() || "Grafty"}
                </span>
            )}
        </Link>
    );
};

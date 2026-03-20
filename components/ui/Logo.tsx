
"use client";

import React from "react";
import Link from "next/link";

interface LogoProps {
    className?: string;
    size?: number; // Height of the logo image
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
    logoUrl = null,
    href = "/"
}) => {
    // Versioned to force cache clear
    const logoSrc = logoUrl || "/grafty_brand.svg?v=4";

    const InlineLogo = (
        <svg
            width={size}
            height={(size * 740) / 960}
            viewBox="0 0 960 740"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            className={variant === 'light' ? 'brightness-0 invert' : ''}
            style={{ display: 'block' }}
        >
            <g transform="matrix(1,0,0,1,-4895.989453,-8178.900836)">
                <g id="Artboard2" transform="matrix(1.019108,0,0,0.785563,2245.288816,6872.510178)">
                    <rect x="2601" y="1663" width="942" height="942" style={{ fill: 'none' }} />
                    <g transform="matrix(10.333703,0,0,8.49944,-30764.868915,-16974.56842)">
                        <g>
                            <g transform="matrix(0.210085,0,0,0.355481,1759.860074,160.025134)">
                                <path d="M7253,5794.989L7253,5984.011C7253,5997.251 7241.468,6008 7227.264,6008L7030.736,6008C7016.532,6008 7005,5997.251 7005,5984.011L7005,5794.989C7005,5781.749 7016.532,5771 7030.736,5771L7227.264,5771C7241.468,5771 7253,5781.749 7253,5794.989Z" fill="url(#logo_grad_1)" />
                            </g>
                            <g transform="matrix(0.125273,0,0,0.211972,2408.812048,988.202993)">
                                <path d="M7253,5794.989L7253,5984.011C7253,5997.251 7241.468,6008 7227.264,6008L7030.736,6008C7016.532,6008 7005,5997.251 7005,5984.011L7005,5794.989C7005,5781.749 7016.532,5771 7030.736,5771L7227.264,5771C7241.468,5771 7253,5781.749 7253,5794.989Z" fill="url(#logo_grad_2)" />
                            </g>
                            <g transform="matrix(0.080922,0,0,0.136926,2730.491404,1473.090288)">
                                <path d="M7253,5794.989L7253,5984.011C7253,5997.251 7241.468,6008 7227.264,6008L7030.736,6008C7016.532,6008 7005,5997.251 7005,5984.011L7005,5794.989C7005,5781.749 7016.532,5771 7030.736,5771L7227.264,5771C7241.468,5771 7253,5781.749 7253,5794.989Z" fill="url(#logo_grad_3)" />
                            </g>
                            <g transform="matrix(0.037348,0,0,0.063197,3024.652752,1915.753948)">
                                <path d="M7253,5794.989L7253,5984.011C7253,5997.251 7241.468,6008 7227.264,6008L7030.736,6008C7016.532,6008 7005,5997.251 7005,5984.011L7005,5794.989C7005,5781.749 7016.532,5771 7030.736,5771L7227.264,5771C7241.468,5771 7253,5781.749 7253,5794.989Z" fill="url(#logo_grad_4)" />
                            </g>
                        </g>
                        <g transform="matrix(0.037348,0,0,0.063197,3015.595675,1831.827439)">
                            <path d="M7176.55,5771C7196.826,5771 7216.271,5778.508 7230.608,5791.872C7244.945,5805.237 7253,5823.363 7253,5842.263C7253,5912.06 7253,6008 7253,6008C7253,6008 7153.066,6008 7080.072,6008C7060.162,6008 7041.067,6000.627 7026.988,5987.504C7012.909,5974.38 7005,5956.581 7005,5938.022C7005,5868.124 7005,5771 7005,5771C7005,5771 7103.683,5771 7176.55,5771Z" fill="url(#logo_grad_5)" />
                        </g>
                    </g>
                </g>
            </g>
            <defs>
                <linearGradient id="logo_grad_1" x1="0" y1="0" x2="1" y2="0" gradientUnits="userSpaceOnUse" gradientTransform="matrix(-457.467313,174.293242,-186.980688,-426.426184,7378.961375,5804.939912)"><stop offset="0" stopColor="#248C53" /><stop offset="1" stopColor="#06368F" /></linearGradient>
                <linearGradient id="logo_grad_2" x1="0" y1="0" x2="1" y2="0" gradientUnits="userSpaceOnUse" gradientTransform="matrix(-767.181209,292.293015,-313.570097,-715.124657,7198.13513,5827.971972)"><stop offset="0" stopColor="#248C53" /><stop offset="1" stopColor="#06368F" /></linearGradient>
                <linearGradient id="logo_grad_3" x1="0" y1="0" x2="1" y2="0" gradientUnits="userSpaceOnUse" gradientTransform="matrix(-1187.655525,452.492071,-485.430631,-1107.067979,7162.193597,5480.908533)"><stop offset="0" stopColor="#248C53" /><stop offset="1" stopColor="#06368F" /></linearGradient>
                <linearGradient id="logo_grad_4" x1="0" y1="0" x2="1" y2="0" gradientUnits="userSpaceOnUse" gradientTransform="matrix(-2573.253638,980.399487,-1051.766368,-2398.647288,7641.940974,4870.746386)"><stop offset="0" stopColor="#248C53" /><stop offset="1" stopColor="#06368F" /></linearGradient>
                <linearGradient id="logo_grad_5" x1="0" y1="0" x2="1" y2="0" gradientUnits="userSpaceOnUse" gradientTransform="matrix(-2573.253638,980.399487,-1051.766368,-2398.647288,7884.443448,6198.770215)"><stop offset="0" stopColor="#248C53" /><stop offset="1" stopColor="#06368F" /></linearGradient>
            </defs>
        </svg>
    );

    return (
        <Link href={href || "/"} className={`group flex items-center gap-3 outline-none ${className}`}>
            <div
                className="relative flex-shrink-0 flex items-center justify-center"
                style={{ height: size, width: size }}
            >
                <img
                    src={logoSrc}
                    alt="Logo"
                    className={`h-full w-auto object-contain transition-all
                        ${variant === 'light' ? 'brightness-0 invert' : ''}
                    `}
                    style={{ height: size }}
                    onError={(e) => {
                        (e.target as any).style.display = 'none';
                        const fallbackContainer = e.currentTarget.parentElement?.querySelector('.inline-logo-fallback');
                        if (fallbackContainer) (fallbackContainer as any).style.display = 'block';
                    }}
                />

                <div className="inline-logo-fallback hidden h-full w-full">
                    {InlineLogo}
                </div>
            </div>

            {showText && (
                <span
                    className={`font-black tracking-tighter select-none whitespace-nowrap
                        ${size > 40 ? 'text-2xl' : 'text-xl'}
                        ${variant === 'light' ? 'text-white' : 'text-slate-900'}
                    `}
                    style={{ lineHeight: 1 }}
                >
                    {brandName}
                </span>
            )}
        </Link>
    );
};

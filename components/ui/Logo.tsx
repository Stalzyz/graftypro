
import React from "react";

interface LogoProps {
    className?: string;
    size?: number; // Height of the logo
    variant?: "light" | "dark" | "color";
}

export const Logo: React.FC<LogoProps> = ({
    className = "",
    size = 64, // Increased default size
    variant = "color"
}) => {
    // User requested:
    // 1. wavo_logo_green_blue.svg for color/default theme
    // 2. wavo_logo_white.svg for the dark theme
    // 3. Bigger related to the frame.

    const logoSrc = variant === "light" ? "/wavo_logo_white.svg" : "/wavo_logo_green_blue.svg";

    return (
        <div className={`flex items-center ${className}`}>
            <div
                className="relative flex-shrink-0"
                style={{ height: size, width: 'auto' }}
            >
                <img
                    src={logoSrc}
                    alt="WAVO Logo"
                    style={{ height: '100%', width: 'auto', minWidth: size * 1.5 }} // Added minWidth to ensure it takes space
                    className="block object-contain transition-transform hover:scale-105 duration-300"
                />
            </div>
        </div>
    );
};

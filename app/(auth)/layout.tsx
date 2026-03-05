"use client";
import { useBranding } from "../../hooks/use-branding";
import { BrandProvider } from "../../components/branding/BrandProvider";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { branding } = useBranding();

    return (
        <BrandProvider colors={branding?.colors}>
            {children}
        </BrandProvider>
    );
}

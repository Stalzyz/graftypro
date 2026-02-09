"use client";
import { useBranding } from "@/hooks/use-branding";
import { BrandProvider } from "@/components/branding/BrandProvider";
import { DynamicLogo } from "@/components/branding/DynamicLogo";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { branding } = useBranding();

    return (
        <BrandProvider colors={branding?.colors}>
            <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center p-6 relative overflow-hidden">
                {/* Background Decorative Elements */}
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#27954D]/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[100px]" />

                <div className="w-full max-w-md relative z-10 animate-fade-in">
                    {/* Logo Section (Dynamic Branding Phase 2) */}
                    <div className="text-center mb-10 flex flex-col items-center">
                        <div className="p-10 bg-white rounded-[3rem] shadow-2xl shadow-green-100 flex items-center justify-center mb-0">
                            <DynamicLogo
                                logoUrl={branding?.logo_url}
                                brandName={branding?.brand_name}
                                className="h-14"
                            />
                        </div>
                    </div>
                </div>

                {/* Auth Card */}
                <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-2xl shadow-green-200/20 border border-white/50">
                    {children}
                </div>

                {/* Footer Links */}
                <div className="mt-8 flex justify-center gap-6">
                    <a href="#" className="text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors">Privacy Policy</a>
                    <a href="#" className="text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors">Terms of Service</a>
                </div>
            </div>
        </BrandProvider>
    );
}

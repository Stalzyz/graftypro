import type { Metadata } from "next";
import { Inter, Noto_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const noto = Noto_Sans({
    subsets: ["latin"],
    weight: ['400', '700', '900'],
    variable: '--font-noto'
});

export const metadata: Metadata = {
    title: "WAVO | WhatsApp Marketing Platform",
    description: "The next generation of WhatsApp automation and business growth.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.className} ${noto.variable}`}>{children}</body>
        </html>
    );
}

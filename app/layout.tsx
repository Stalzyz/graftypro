import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Google Font: Inter
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Wabot BSP | Intelligent Automation",
    description: "The most intelligent WhatsApp automation & commerce platform.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>{children}</body>
        </html>
    );
}

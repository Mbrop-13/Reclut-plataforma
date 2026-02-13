import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({
    subsets: ["latin"],
    variable: "--font-jetbrains",
    display: "swap"
});

export const metadata: Metadata = {
    title: "Reclut | Plataforma de Reclutamiento con IA",
    description: "La plataforma más avanzada de reclutamiento con entrevistas por avatar de IA.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="h-full">
            <body className={cn(
                "min-h-screen bg-background font-sans antialiased",
                inter.variable,
                jetbrainsMono.variable
            )}>
                <Providers>
                    {children}
                    <Toaster position="top-right" />
                </Providers>
            </body>
        </html>
    );
}

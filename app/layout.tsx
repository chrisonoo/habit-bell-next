"use client";

import type React from "react";
import { Header, HeaderProvider } from "@/components/layout/Header";
import { ActiveConfigProvider } from "@/hooks/useActiveConfig";
import { ThemeProvider } from "next-themes";
import "../styles/animations.css";
import "../styles/globals.css";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="antialiased bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                >
                    <ActiveConfigProvider>
                        <HeaderProvider>
                            <div className="min-h-dvh flex flex-col">
                                <Header />
                                <main className="flex-1 flex flex-col m-4 lg:m-5">
                                    {children}
                                </main>
                            </div>
                        </HeaderProvider>
                    </ActiveConfigProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}

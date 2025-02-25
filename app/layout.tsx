"use client";

import type React from "react";
import { Header, HeaderProvider } from "@/components/layout/Header";
import { ActiveConfigProvider } from "@/hooks/useActiveConfig";
import { ThemeProvider } from "next-themes";
import "../styles/animations.css";
import "../styles/globals.css";

/**
 * Root layout component for the application
 * Provides the basic structure and context providers for all pages
 *
 * @param children - React components to be rendered inside the layout
 * @returns The complete application layout with theme support and header
 */
export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="antialiased bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
                {/* Theme provider enables light/dark mode support */}
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                >
                    {/* ActiveConfigProvider manages the active configuration (training or pomodoro) */}
                    <ActiveConfigProvider>
                        {/* HeaderProvider manages the header state and visibility */}
                        <HeaderProvider>
                            <div className="min-h-dvh flex flex-col">
                                {/* Application header with navigation */}
                                <Header />
                                {/* Main content area */}
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

import type React from "react";
import { Header } from "@/components/layout/Header";
import "../styles/animations.css";
import "../styles/globals.css";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <div className="min-h-dvh flex flex-col">
                    <Header />
                    <main className="flex-1 flex flex-col m-4 lg:m-5">
                        {children}
                    </main>
                </div>
            </body>
        </html>
    );
}

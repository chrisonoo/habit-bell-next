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
                <div className="min-h-screen">
                    <Header />
                    <main className="flex-1 p-4">{children}</main>
                </div>
            </body>
        </html>
    );
}

export const metadata = {
    generator: "v0.dev",
};

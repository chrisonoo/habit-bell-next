"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Menu, Bell, Dumbbell, Settings } from "lucide-react";
import Link from "next/link";
import { ConfigSelector } from "../settings/ConfigSelector";
import { useActiveConfig } from "@/hooks/useActiveConfig";

interface HeaderContextType {
    isHeaderVisible: boolean;
    toggleHeader: () => void;
}

export const HeaderContext = createContext<HeaderContextType>({
    isHeaderVisible: true,
    toggleHeader: () => {},
});

export const useHeader = () => useContext(HeaderContext);

export function HeaderProvider({ children }: { children: React.ReactNode }) {
    const [isHeaderVisible, setIsHeaderVisible] = useState(true);

    const toggleHeader = () => {
        setIsHeaderVisible((prev) => !prev);
    };

    return (
        <HeaderContext.Provider value={{ isHeaderVisible, toggleHeader }}>
            {children}
        </HeaderContext.Provider>
    );
}

export function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const [isRinging, setIsRinging] = useState(false);
    const { activeConfig, updateActiveConfig } = useActiveConfig();
    const { isHeaderVisible } = useHeader();

    useEffect(() => {
        const ringInterval = setInterval(() => {
            setIsRinging(true);
            setTimeout(() => setIsRinging(false), 1600); // Ring for 1.6 seconds
        }, 5000); // Ring every 5 seconds

        return () => clearInterval(ringInterval);
    }, []);

    if (!isHeaderVisible) return null;

    return (
        <header className="flex items-center justify-between p-4 border-b">
            <div className="w-10" />
            <Link href="/" className="flex items-center space-x-2">
                <Bell
                    className={`h-8 w-8 text-primary animate-bell ${
                        isRinging ? "ringing" : ""
                    }`}
                />
                <h1 className="text-lg font-medium text-primary">Habit Bell</h1>
            </Link>
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent className="flex flex-col w-[250px] sm:w-[300px]">
                    <div className="flex flex-col flex-1">
                        <SheetTitle>Menu</SheetTitle>
                        <SheetDescription>
                            Navigation and settings
                        </SheetDescription>
                        <nav className="flex flex-col space-y-2">
                            <Link href="/" passHref>
                                <Button
                                    variant="ghost"
                                    className="justify-start text-base py-3"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <Dumbbell className="mr-3 h-5 w-5" />
                                    Training
                                </Button>
                            </Link>
                            <Link href="/settings-training" passHref>
                                <Button
                                    variant="ghost"
                                    className="justify-start text-base py-3"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <Settings className="mr-3 h-5 w-5" />
                                    Settings (Training)
                                </Button>
                            </Link>
                            <Link href="/settings-pomodoro" passHref>
                                <Button
                                    variant="ghost"
                                    className="justify-start text-base py-3"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <Settings className="mr-3 h-5 w-5" />
                                    Settings (Pomodoro)
                                </Button>
                            </Link>
                        </nav>
                    </div>
                    <div className="mt-auto">
                        <ConfigSelector
                            activeConfig={activeConfig}
                            onConfigChange={updateActiveConfig}
                        />
                        <div className="border-t pt-4 text-center">
                            <p className="text-sm text-muted-foreground">
                                © {new Date().getFullYear()} Habit Bell
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Inspired by Pavlovian conditioning
                            </p>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </header>
    );
}

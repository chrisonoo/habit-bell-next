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
import { ThemeSwitcher } from "../theme/ThemeSwitcher";

/**
 * Interface defining the header context type
 * Contains properties and methods for controlling header visibility
 */
interface HeaderContextType {
    isHeaderVisible: boolean;
    toggleHeader: () => void;
}

/**
 * Context for managing header visibility across the application
 * Provides a way to show/hide the header from any component
 */
export const HeaderContext = createContext<HeaderContextType>({
    isHeaderVisible: true,
    toggleHeader: () => {},
});

/**
 * Custom hook for accessing the header context
 * Makes it easy to control header visibility from any component
 */
export const useHeader = () => useContext(HeaderContext);

/**
 * Provider component for the header context
 * Wraps the application to provide header visibility state and toggle function
 *
 * @param children - React components to be rendered inside the provider
 */
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

/**
 * Main header component for the application
 * Displays the app title, navigation menu, and theme switcher
 * Includes an animated bell icon and a slide-out navigation drawer
 */
export function Header() {
    const [isOpen, setIsOpen] = useState(false); // Controls the navigation drawer state
    const [isRinging, setIsRinging] = useState(false); // Controls the bell animation
    const { activeConfig, updateActiveConfig } = useActiveConfig();
    const { isHeaderVisible } = useHeader();

    // Set up the bell animation to ring periodically
    useEffect(() => {
        const ringInterval = setInterval(() => {
            setIsRinging(true);
            setTimeout(() => setIsRinging(false), 1600); // Ring for 1.6 seconds
        }, 5000); // Ring every 5 seconds

        // Clean up the interval when component unmounts
        return () => clearInterval(ringInterval);
    }, []);

    // Don't render anything if header is set to be hidden
    if (!isHeaderVisible) return null;

    return (
        <header className="flex items-center justify-between p-4 border-b dark:border-gray-800">
            {/* Theme switcher on the left */}
            <div className="w-10">
                <ThemeSwitcher />
            </div>

            {/* App title and logo in the center */}
            <Link href="/" className="flex items-center space-x-2">
                <Bell
                    className={`h-8 w-8 text-primary animate-bell ${
                        isRinging ? "ringing" : ""
                    }`}
                />
                <h1 className="text-lg font-medium text-primary">Habit Bell</h1>
            </Link>

            {/* Navigation menu on the right */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                {/* Menu button that triggers the navigation drawer */}
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu className="h-6 w-6" />
                    </Button>
                </SheetTrigger>

                {/* Navigation drawer content */}
                <SheetContent className="flex flex-col w-[250px] sm:w-[300px] dark:border-gray-800 overflow-y-auto">
                    <div className="flex flex-col flex-1 min-h-min">
                        {/* Navigation links */}
                        <nav className="flex flex-col space-y-2 mt-3">
                            <Link href="/" passHref>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start text-base py-3"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <Dumbbell className="mr-3 h-5 w-5" />
                                    Training
                                </Button>
                            </Link>
                            <Link href="/settings-training" passHref>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start text-base py-3"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <Settings className="mr-3 h-5 w-5" />
                                    Settings (Training)
                                </Button>
                            </Link>
                            <Link href="/settings-pomodoro" passHref>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start text-base py-3"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <Settings className="mr-3 h-5 w-5" />
                                    Settings (Pomodoro)
                                </Button>
                            </Link>
                        </nav>
                    </div>

                    {/* Footer section with config selector and copyright */}
                    <div className="mt-auto">
                        <ConfigSelector
                            activeConfig={activeConfig}
                            onConfigChange={updateActiveConfig}
                        />
                        <div className="border-t dark:border-gray-800 pt-4 text-center mt-4">
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

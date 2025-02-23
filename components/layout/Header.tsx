"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Bell, Dumbbell, Settings } from "lucide-react";
import Link from "next/link";

export function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const [isRinging, setIsRinging] = useState(false);

    useEffect(() => {
        const ringInterval = setInterval(() => {
            setIsRinging(true);
            setTimeout(() => setIsRinging(false), 1400); // Ring for 1.4 seconds
        }, 10000); // Ring every 10 seconds

        return () => clearInterval(ringInterval);
    }, []);

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
                    <div className="pt-8 flex-grow">
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
                            <Link href="/settings" passHref>
                                <Button
                                    variant="ghost"
                                    className="justify-start text-base py-3"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <Settings className="mr-3 h-5 w-5" />
                                    Settings
                                </Button>
                            </Link>
                        </nav>
                    </div>
                    <div className="border-t pt-4 mt-auto text-center">
                        <p className="text-sm text-muted-foreground">
                            © {new Date().getFullYear()} Habit Bell
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Inspired by Pavlovian conditioning
                        </p>
                    </div>
                </SheetContent>
            </Sheet>
        </header>
    );
}

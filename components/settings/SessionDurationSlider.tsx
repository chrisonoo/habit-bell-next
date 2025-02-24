"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface SessionDurationSliderProps {
    sessionDuration: number;
    setSessionDuration: (value: number) => void;
    maxSessionDuration: number;
    stepSessionDuration: number;
    isTraining: boolean;
}

export function SessionDurationSlider({
    sessionDuration,
    setSessionDuration,
    maxSessionDuration,
    stepSessionDuration,
    isTraining,
}: SessionDurationSliderProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null; // or a placeholder/skeleton
    }

    return (
        <div className="space-y-4">
            <Label
                htmlFor="session-duration"
                className="text-base sm:text-lg flex justify-between"
            >
                <span>
                    Session: {sessionDuration} minute
                    {sessionDuration !== 1 ? "s" : ""}
                </span>
                <span className="text-xs sm:text-sm text-muted-foreground">
                    [step {stepSessionDuration} min]
                </span>
            </Label>
            <div className="flex items-center">
                <span className="text-sm text-muted-foreground mr-2">
                    {stepSessionDuration}
                </span>
                <Slider
                    id="session-duration"
                    min={stepSessionDuration}
                    max={maxSessionDuration}
                    step={stepSessionDuration}
                    value={[sessionDuration]}
                    onValueChange={(value) => setSessionDuration(value[0])}
                    disabled={isTraining}
                />
                <span className="text-sm text-muted-foreground ml-2">
                    {maxSessionDuration}
                </span>
            </div>
        </div>
    );
}

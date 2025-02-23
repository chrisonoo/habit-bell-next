"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { CONFIG } from "@/lib/config";

interface SessionDurationSliderProps {
    sessionDuration: number;
    setSessionDuration: (value: number) => void;
    isTraining: boolean;
}

export function SessionDurationSlider({
    sessionDuration,
    setSessionDuration,
    isTraining,
}: SessionDurationSliderProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null; // lub możesz zwrócić placeholder
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
                    [step {CONFIG.STEP_SESSION_DURATION} min]
                </span>
            </Label>
            <div className="flex items-center">
                <span className="text-sm text-muted-foreground mr-2">
                    {CONFIG.STEP_SESSION_DURATION}
                </span>
                <Slider
                    id="session-duration"
                    min={CONFIG.STEP_SESSION_DURATION}
                    max={CONFIG.MAX_SESSION_DURATION}
                    step={CONFIG.STEP_SESSION_DURATION}
                    value={[sessionDuration]}
                    onValueChange={(value) => setSessionDuration(value[0])}
                    disabled={isTraining}
                />
                <span className="text-sm text-muted-foreground ml-2">
                    {CONFIG.MAX_SESSION_DURATION}
                </span>
            </div>
        </div>
    );
}

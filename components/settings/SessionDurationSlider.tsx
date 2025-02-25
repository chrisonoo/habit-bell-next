"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

/**
 * Interface defining the props for the SessionDurationSlider component
 * Used to set the total duration of a training or pomodoro session
 */
interface SessionDurationSliderProps {
    sessionDuration: number; // Current session duration in minutes
    setSessionDuration: (value: number) => void; // Function to update session duration
    maxSessionDuration: number; // Maximum possible duration in minutes
    stepSessionDuration: number; // Step size for the slider in minutes
    isTraining: boolean; // Whether training is in progress (disables slider)
}

/**
 * SessionDurationSlider component
 * Provides a slider to set the total duration of a training or pomodoro session
 *
 * @param props - Component properties including current value and setter function
 */
export function SessionDurationSlider({
    sessionDuration,
    setSessionDuration,
    maxSessionDuration,
    stepSessionDuration,
    isTraining,
}: SessionDurationSliderProps) {
    // State to track if component has mounted (for client-side rendering)
    const [mounted, setMounted] = useState(false);

    // Set mounted to true after initial render
    useEffect(() => {
        setMounted(true);
    }, []);

    // Don't render anything during SSR to prevent hydration mismatch
    if (!mounted) {
        return null; // or a placeholder/skeleton
    }

    return (
        <div className="space-y-4">
            {/* Display label with current value and proper pluralization */}
            <Label htmlFor="session-duration" className="text-base sm:text-lg">
                <span>
                    Session: {sessionDuration} minute
                    {sessionDuration !== 1 ? "s" : ""}
                </span>
            </Label>
            {/* Slider for adjusting the session duration */}
            <Slider
                id="session-duration"
                min={stepSessionDuration}
                max={maxSessionDuration}
                step={stepSessionDuration}
                value={[sessionDuration]}
                onValueChange={(value) => setSessionDuration(value[0])}
                disabled={isTraining}
            />
            {/* Display min and max values below the slider */}
            <div className="flex items-center">
                <span className="text-sm text-muted-foreground mr-2">
                    {stepSessionDuration}
                </span>
                <div className="flex-1"></div>
                <span className="text-sm text-muted-foreground ml-2">
                    {maxSessionDuration}
                </span>
            </div>
        </div>
    );
}

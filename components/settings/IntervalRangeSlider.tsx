"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { DualRangeSlider } from "@/components/ui/dual-range-slider";

/**
 * Interface defining the props for the IntervalRangeSlider component
 * Used to set the minimum and maximum interval between gongs
 */
interface IntervalRangeSliderProps {
    minInterval: number; // Current minimum interval value in seconds
    maxInterval: number; // Current maximum interval value in seconds
    setMinInterval: (value: number) => void; // Function to update minimum interval
    setMaxInterval: (value: number) => void; // Function to update maximum interval
    stepInterval: number; // Step size for the slider
    defaultMinInterval: number; // Minimum possible value for the slider
    defaultMaxInterval: number; // Maximum possible value for the slider
    isTraining: boolean; // Whether training is in progress (disables slider)
}

/**
 * IntervalRangeSlider component
 * Provides a dual-handle slider to set the minimum and maximum interval between gongs
 *
 * @param props - Component properties including current values and setter functions
 */
export function IntervalRangeSlider({
    minInterval,
    maxInterval,
    setMinInterval,
    setMaxInterval,
    stepInterval,
    defaultMinInterval,
    defaultMaxInterval,
    isTraining,
}: IntervalRangeSliderProps) {
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
            <Label htmlFor="interval-range" className="text-base sm:text-lg">
                <span>
                    Interval Range: {minInterval}s - {maxInterval}s
                </span>
            </Label>
            {/* Dual range slider with two handles for min and max values */}
            <DualRangeSlider
                min={defaultMinInterval}
                max={defaultMaxInterval}
                step={stepInterval}
                defaultValue={[minInterval, maxInterval]}
                onValueChange={(value) => {
                    setMinInterval(value[0]);
                    setMaxInterval(value[1]);
                }}
                disabled={isTraining}
            />
            {/* Display min and max values below the slider */}
            <div className="flex items-center">
                <span className="text-sm text-muted-foreground mr-2">
                    {defaultMinInterval}
                </span>
                <div className="flex-1"></div>
                <span className="text-sm text-muted-foreground ml-2">
                    {defaultMaxInterval}
                </span>
            </div>
        </div>
    );
}

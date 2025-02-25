"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

/**
 * Interface defining the props for the PauseDurationSlider component
 * Used to set the duration of pauses between gong sounds
 */
interface PauseDurationSliderProps {
    id?: string; // Unique ID for the slider element (optional for backward compatibility)
    label: string; // Label text to display above the slider
    value?: number; // Current pause duration value in seconds (old prop name)
    setValue?: (value: number) => void; // Function to update the pause duration (old prop name)
    pauseDuration?: number; // Current pause duration value in seconds (new prop name)
    setPauseDuration?: (value: number) => void; // Function to update the pause duration (new prop name)
    min?: number; // Minimum possible value for the slider (old prop name)
    max?: number; // Maximum possible value for the slider (old prop name)
    step?: number; // Step size for the slider (old prop name)
    minPauseDuration?: number; // Minimum possible value for the slider (new prop name)
    maxPauseDuration?: number; // Maximum possible value for the slider (new prop name)
    stepPauseDuration?: number; // Step size for the slider (new prop name)
    isTraining: boolean; // Whether training is in progress (disables slider)
}

/**
 * PauseDurationSlider component
 * Provides a slider to set the duration of pauses between gong sounds
 * Can be used for both pause1 (after first gong) and pause2 (between second gongs)
 * Supports both old and new prop naming conventions for backward compatibility
 *
 * @param props - Component properties including current value and setter function
 */
export function PauseDurationSlider({
    id,
    label,
    value,
    setValue,
    pauseDuration,
    setPauseDuration,
    min,
    max,
    step,
    minPauseDuration,
    maxPauseDuration,
    stepPauseDuration,
    isTraining,
}: PauseDurationSliderProps) {
    // Use new prop names if provided, otherwise fall back to old prop names
    const actualValue = pauseDuration !== undefined ? pauseDuration : value;
    const actualSetValue = setPauseDuration || setValue;
    const actualMin = minPauseDuration !== undefined ? minPauseDuration : min;
    const actualMax = maxPauseDuration !== undefined ? maxPauseDuration : max;
    const actualStep =
        stepPauseDuration !== undefined ? stepPauseDuration : step;
    const sliderId =
        id || `pause-duration-${label.replace(/\s+/g, "-").toLowerCase()}`;

    if (
        actualValue === undefined ||
        actualSetValue === undefined ||
        actualMin === undefined ||
        actualMax === undefined ||
        actualStep === undefined
    ) {
        console.error("PauseDurationSlider: Missing required props");
        return null;
    }

    return (
        <div className="space-y-2">
            {/* Display label with current value */}
            <Label htmlFor={sliderId} className="text-base sm:text-lg">
                {label}: {actualValue} seconds
            </Label>
            {/* Slider for adjusting the pause duration */}
            <Slider
                id={sliderId}
                min={actualMin}
                max={actualMax}
                step={actualStep}
                value={[actualValue]}
                onValueChange={(value) => actualSetValue(value[0])}
                disabled={isTraining}
            />
            {/* Display min and max values below the slider */}
            <div className="flex items-center">
                <span className="text-sm text-muted-foreground mr-2">
                    {actualMin}
                </span>
                <div className="flex-1"></div>
                <span className="text-sm text-muted-foreground ml-2">
                    {actualMax}
                </span>
            </div>
        </div>
    );
}

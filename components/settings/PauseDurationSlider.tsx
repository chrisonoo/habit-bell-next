"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

/**
 * Interface defining the props for the PauseDurationSlider component
 * Used to set the duration of pauses between gong sounds
 */
interface PauseDurationSliderProps {
    id: string; // Unique ID for the slider element
    label: string; // Label text to display above the slider
    value: number; // Current pause duration value in seconds
    setValue: (value: number) => void; // Function to update the pause duration
    min: number; // Minimum possible value for the slider
    max: number; // Maximum possible value for the slider
    step: number; // Step size for the slider
    isTraining: boolean; // Whether training is in progress (disables slider)
}

/**
 * PauseDurationSlider component
 * Provides a slider to set the duration of pauses between gong sounds
 * Can be used for both pause1 (after first gong) and pause2 (between second gongs)
 *
 * @param props - Component properties including current value and setter function
 */
export function PauseDurationSlider({
    id,
    label,
    value,
    setValue,
    min,
    max,
    step,
    isTraining,
}: PauseDurationSliderProps) {
    return (
        <div className="space-y-2">
            {/* Display label with current value */}
            <Label htmlFor={id} className="text-base sm:text-lg">
                {label}: {value} seconds
            </Label>
            {/* Slider for adjusting the pause duration */}
            <Slider
                id={id}
                min={min}
                max={max}
                step={step}
                value={[value]}
                onValueChange={(value) => setValue(value[0])}
                disabled={isTraining}
            />
            {/* Display min and max values below the slider */}
            <div className="flex items-center">
                <span className="text-sm text-muted-foreground mr-2">
                    {min}
                </span>
                <div className="flex-1"></div>
                <span className="text-sm text-muted-foreground ml-2">
                    {max}
                </span>
            </div>
        </div>
    );
}

"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { formatTime } from "@/lib/utils/timeUtils";

/**
 * Interface defining the props for the IntervalSlider component
 * Used to set the interval between gongs
 */
interface IntervalSliderProps {
    interval: number; // Current interval value in seconds
    setInterval: (value: number) => void; // Function to update the interval
    minInterval: number; // Minimum possible value for the slider
    maxInterval: number; // Maximum possible value for the slider
    stepInterval: number; // Step size for the slider
    isTraining: boolean; // Whether training is in progress (disables slider)
}

/**
 * IntervalSlider component
 * Provides a slider to set the interval between gongs
 *
 * @param props - Component properties including current value and setter function
 */
export function IntervalSlider({
    interval,
    setInterval,
    minInterval,
    maxInterval,
    stepInterval,
    isTraining,
}: IntervalSliderProps) {
    return (
        <div className="space-y-2">
            {/* Display label with current value */}
            <Label htmlFor="interval-slider" className="text-base sm:text-lg">
                Interval between gongs: {formatTime(interval)}
            </Label>
            {/* Slider for adjusting the interval */}
            <Slider
                id="interval-slider"
                min={minInterval}
                max={maxInterval}
                step={stepInterval}
                value={[interval]}
                onValueChange={(value) => setInterval(value[0])}
                disabled={isTraining}
            />
            {/* Display min and max values below the slider */}
            <div className="flex items-center">
                <span className="text-sm text-muted-foreground mr-2">
                    {formatTime(minInterval)}
                </span>
                <div className="flex-1"></div>
                <span className="text-sm text-muted-foreground ml-2">
                    {formatTime(maxInterval)}
                </span>
            </div>
        </div>
    );
}

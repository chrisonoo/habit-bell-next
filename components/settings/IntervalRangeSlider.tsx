"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { DualRangeSlider } from "@/components/ui/dual-range-slider";
import { CONFIG } from "@/lib/config";

interface IntervalRangeSliderProps {
    minInterval: number;
    maxInterval: number;
    setMinInterval: (value: number) => void;
    setMaxInterval: (value: number) => void;
    isTraining: boolean;
}

export function IntervalRangeSlider({
    minInterval,
    maxInterval,
    setMinInterval,
    setMaxInterval,
    isTraining,
}: IntervalRangeSliderProps) {
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
                htmlFor="interval-range"
                className="text-base sm:text-lg flex justify-between"
            >
                <span>
                    Interval Range: {minInterval}s - {maxInterval}s
                </span>
                <span className="text-xs sm:text-sm text-muted-foreground">
                    [step {CONFIG.STEP_INTERVAL} s]
                </span>
            </Label>
            <div className="flex items-center">
                <span className="text-sm text-muted-foreground mr-2">
                    {CONFIG.MIN_INTERVAL}
                </span>
                <DualRangeSlider
                    min={CONFIG.MIN_INTERVAL}
                    max={CONFIG.MAX_INTERVAL}
                    step={CONFIG.STEP_INTERVAL}
                    defaultValue={[minInterval, maxInterval]}
                    onValueChange={(value) => {
                        setMinInterval(value[0]);
                        setMaxInterval(value[1]);
                    }}
                    disabled={isTraining}
                />
                <span className="text-sm text-muted-foreground ml-2">
                    {CONFIG.MAX_INTERVAL}
                </span>
            </div>
        </div>
    );
}

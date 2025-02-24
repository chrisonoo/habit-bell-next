"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface PauseDurationSliderProps {
    id: string;
    label: string;
    value: number;
    setValue: (value: number) => void;
    min: number;
    max: number;
    step: number;
    isTraining: boolean;
}

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
            <Label htmlFor={id}>{label} (seconds)</Label>
            <Slider
                id={id}
                min={min}
                max={max}
                step={step}
                value={[value]}
                onValueChange={(value) => setValue(value[0])}
                disabled={isTraining}
            />
            <div className="text-sm text-muted-foreground">{value} seconds</div>
        </div>
    );
}

"use client"

import React, { useState, useEffect, useCallback } from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "@/lib/utils"

interface DualRangeSliderProps {
  className?: string
  min: number
  max: number
  step: number
  defaultValue: [number, number]
  onValueChange: (value: [number, number]) => void
  disabled?: boolean
}

const DualRangeSlider = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, DualRangeSliderProps>(
  ({ className, min, max, step, defaultValue, onValueChange, disabled, ...props }, ref) => {
    const [value, setValue] = useState(defaultValue)

    const handleValueChange = useCallback(
      (newValue: number[]) => {
        setValue(newValue as [number, number])
        onValueChange(newValue as [number, number])
      },
      [onValueChange],
    )

    useEffect(() => {
      setValue(defaultValue)
    }, [defaultValue])

    return (
      <SliderPrimitive.Root
        ref={ref}
        className={cn("relative flex w-full touch-none select-none items-center", className)}
        min={min}
        max={max}
        step={step}
        value={value}
        onValueChange={handleValueChange}
        disabled={disabled}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
          <SliderPrimitive.Range className="absolute h-full bg-primary" />
        </SliderPrimitive.Track>
        {value.map((_, index) => (
          <SliderPrimitive.Thumb
            key={index}
            className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          />
        ))}
      </SliderPrimitive.Root>
    )
  },
)

DualRangeSlider.displayName = "DualRangeSlider"

export { DualRangeSlider }


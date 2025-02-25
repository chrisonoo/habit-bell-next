import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function for combining Tailwind CSS classes
 * Uses clsx for conditional class application and twMerge to handle class conflicts
 *
 * @param inputs - Array of class values, objects, or arrays to be combined
 * @returns Merged and deduplicated class string
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

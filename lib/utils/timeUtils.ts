/**
 * Utility functions for time formatting and manipulation
 */

/**
 * Formats a time in seconds to a human-readable string
 * For times less than a minute, shows only seconds
 * For times of a minute or more, shows minutes:seconds format
 *
 * @param seconds - The time in seconds to format
 * @returns Formatted time string (e.g., "45s" or "2:30")
 */
export function formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes === 0) {
        return `${remainingSeconds}s`;
    }

    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

/**
 * Converts minutes to seconds
 *
 * @param minutes - Time in minutes
 * @returns Time in seconds
 */
export function minutesToSeconds(minutes: number): number {
    return minutes * 60;
}

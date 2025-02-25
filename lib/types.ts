/**
 * Common types and interfaces used throughout the application
 */

/**
 * Interface defining the settings structure used for training and pomodoro modes
 */
export interface Settings {
    sessionDuration: number; // Duration of the session in minutes
    interval: number; // Interval between gongs in seconds
    minInterval: number; // Minimum allowed interval in seconds
    maxInterval: number; // Maximum allowed interval in seconds
    stepInterval: number; // Step size for interval adjustment in seconds
    pause1Duration: number; // Pause duration after first gong in seconds
    pause2Duration: number; // Pause duration between second gongs in seconds
    isThirdSoundEnabled: boolean; // Whether to play the third sound in the sequence
}

/**
 * Interface for audio configuration
 */
export interface AudioConfig {
    GONG1: string[];
    GONG2: string;
    GONG3: string;
    GONG4: string;
}

/**
 * Type guard to validate if an object conforms to the Settings interface
 * Checks that all required properties exist and have the correct types
 *
 * @param obj - The object to validate
 * @returns Boolean indicating whether the object is a valid Settings object
 */
export function isValidSettings(obj: any): obj is Settings {
    return (
        typeof obj === "object" &&
        obj !== null &&
        typeof obj.sessionDuration === "number" &&
        typeof obj.interval === "number" &&
        typeof obj.minInterval === "number" &&
        typeof obj.maxInterval === "number" &&
        typeof obj.stepInterval === "number" &&
        typeof obj.pause1Duration === "number" &&
        typeof obj.pause2Duration === "number" &&
        typeof obj.isThirdSoundEnabled === "boolean"
    );
}

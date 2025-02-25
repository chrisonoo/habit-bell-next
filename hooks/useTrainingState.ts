"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { CONFIG as TRAINING_CONFIG } from "@/lib/config";
import { CONFIG as POMODORO_CONFIG } from "@/lib/config-pomodoro";
import { useActiveConfig } from "@/hooks/useActiveConfig";
import { useGongSequence } from "@/hooks/useGongSequence";
import { useTrainingTimer } from "@/hooks/useTrainingTimer";

/**
 * Interface defining the settings structure used for training and pomodoro modes
 */
interface Settings {
    sessionDuration: number; // Duration of the session in minutes
    minInterval: number; // Minimum interval between gongs in seconds
    maxInterval: number; // Maximum interval between gongs in seconds
    pause1Duration: number; // Pause duration after first gong in seconds
    pause2Duration: number; // Pause duration between second gongs in seconds
    isThirdSoundEnabled: boolean; // Whether to play the third sound in the sequence
}

/**
 * Interface for the return value of the useTrainingState hook
 */
interface UseTrainingStateReturn {
    // State
    isLoading: boolean;
    isActive: boolean;
    isTraining: boolean;
    isGongPlaying: boolean;
    isGongSequencePlaying: boolean;
    waitingForConfirmation: boolean;
    countdown: number;
    sessionTimeLeft: number;
    isSessionEnded: boolean;

    // Functions
    startTraining: () => void;
    stopTraining: () => void;
    handleStoodUp: () => void;
    formatTime: (seconds: number) => string;

    // Type guard
    isValidSettings: (obj: any) => obj is Settings;
}

/**
 * Custom hook for managing training state
 * Handles initialization, state management, and training session control
 */
export function useTrainingState(): UseTrainingStateReturn {
    // Get configuration settings from the active config hook
    const { activeConfig, isPomodoroMode, currentSettings, loadSettings } =
        useActiveConfig();

    // State variables for managing the training session
    const [isLoading, setIsLoading] = useState(true); // Whether settings are still loading
    const [isActive, setIsActive] = useState(false); // Whether the session is active
    const [isTraining, setIsTraining] = useState(false); // Whether training is in progress

    // Create refs for functions that will be defined later
    const playGongSequenceRef = useRef<() => void>(() => {});
    const startGong4LoopRef = useRef<() => void>(() => {});

    // Create a state for isGongSequencePlaying to avoid circular dependencies
    const [isGongSequencePlayingState, setIsGongSequencePlayingState] =
        useState(false);

    // Callbacks for timer events that use the refs
    const handleCountdownZero = useCallback(() => {
        playGongSequenceRef.current();
    }, []);

    const handleSessionEnd = useCallback(() => {
        startGong4LoopRef.current();
    }, []);

    // Use the training timer hook to manage countdown and session time
    const {
        countdown,
        sessionTimeLeft,
        isSessionEnded,
        lastTickTimestamp,
        setCountdown,
        setSessionTimeLeft,
        setIsSessionEnded,
        setLastTickTimestamp,
        startTimer,
        stopTimer,
        resetTimers,
    } = useTrainingTimer(
        isActive,
        isTraining,
        isGongSequencePlayingState,
        handleCountdownZero,
        handleSessionEnd
    );

    // Use the gong sequence hook to manage audio playback
    const {
        isGongPlaying,
        isGongSequencePlaying,
        waitingForConfirmation,
        setWaitingForConfirmation,
        setIsGongSequencePlaying,
        initializeAudio,
        playGongSequence,
        stopGong4,
        startGong4Loop,
        resetGongState,
    } = useGongSequence(isPomodoroMode, isActive, isSessionEnded);

    // Update the refs with the actual functions
    useEffect(() => {
        playGongSequenceRef.current = playGongSequence;
        startGong4LoopRef.current = startGong4Loop;
    }, [playGongSequence, startGong4Loop]);

    // Update the isGongSequencePlayingState whenever isGongSequencePlaying changes
    useEffect(() => {
        setIsGongSequencePlayingState(isGongSequencePlaying);
    }, [isGongSequencePlaying]);

    // Log initial settings when hook initializes
    useEffect(() => {
        console.log("useTrainingState initialized");
        const trainingSettings = localStorage.getItem("trainingSettings");
        const pomodoroSettings = localStorage.getItem("pomodoroSettings");
        console.log("Storage content:", {
            trainingSettings: trainingSettings
                ? JSON.parse(trainingSettings)
                : null,
            pomodoroSettings: pomodoroSettings
                ? JSON.parse(pomodoroSettings)
                : null,
            activeConfig,
        });
    }, [activeConfig]);

    // Set loading state to false once settings are loaded
    useEffect(() => {
        if (currentSettings) {
            setIsLoading(false);
        }
    }, [currentSettings]);

    // Initialize audio elements when hook initializes
    useEffect(() => {
        initializeAudio();
    }, [initializeAudio]);

    /**
     * Starts a new training session
     * 1. Clears all timers and stops audio playback
     * 2. Loads the latest settings from localStorage
     * 3. Validates settings and initializes the session state
     * 4. Sets the first interval
     */
    const startTraining = useCallback(() => {
        // Reset gong state and stop all audio playback
        resetGongState();

        // Always load the latest settings from localStorage directly
        const settingsKey = isPomodoroMode
            ? "pomodoroSettings"
            : "trainingSettings";
        let settings;

        try {
            const savedSettings = localStorage.getItem(settingsKey);
            if (savedSettings) {
                settings = JSON.parse(savedSettings);
                console.log(
                    "Starting training with latest settings from localStorage:",
                    settings
                );
            } else {
                settings = currentSettings;
                console.log(
                    "No settings found in localStorage, using current settings:",
                    settings
                );
            }
        } catch (error) {
            console.error("Error loading settings from localStorage:", error);
            settings = currentSettings;
        }

        if (!settings) {
            console.error("No valid settings available");
            return;
        }

        if (
            settings.sessionDuration <= 0 ||
            settings.minInterval <= 0 ||
            settings.maxInterval <= 0
        ) {
            console.error("Invalid training values");
            return;
        }

        console.log("Active mode:", isPomodoroMode ? "pomodoro" : "training");

        // Update currentSettings in the hook to keep it in sync
        loadSettings(activeConfig);

        // Reset all training state
        setIsActive(true);
        setIsTraining(true);

        // Generate first interval immediately
        const firstInterval = Math.floor(
            Math.random() * (settings.maxInterval - settings.minInterval + 1) +
                settings.minInterval
        );
        console.log("Setting first interval:", firstInterval);

        // Start the timer with the session duration and first interval
        startTimer(settings.sessionDuration * 60, firstInterval);
    }, [
        isPomodoroMode,
        currentSettings,
        activeConfig,
        loadSettings,
        resetGongState,
        startTimer,
    ]);

    /**
     * Stops the current training session
     * 1. Clears all timers to prevent further state updates
     * 2. Stops all audio playback
     * 3. Resets all training state variables
     */
    const stopTraining = useCallback(() => {
        console.log("stopTraining called");

        // Reset gong state and stop all audio playback
        resetGongState();

        // Stop the timer
        stopTimer();

        // Reset training state
        setIsActive(false);
        setIsTraining(false);
    }, [resetGongState, stopTimer]);

    /**
     * Sets a new random interval for the next gong
     * 1. Checks if the session has ended before setting a new interval
     * 2. Loads the latest settings from localStorage
     * 3. Generates a random interval within the min/max range
     * 4. Updates the countdown and interval state
     */
    const setNewInterval = useCallback(() => {
        // Log when this function is called to help with debugging
        console.log("setNewInterval called with state:", {
            isSessionEnded,
            waitingForConfirmation,
            countdown,
        });

        // Early return if the session is ending or has ended
        // This is a critical check to prevent setting a new interval when the session is ending
        if (isSessionEnded) {
            console.log("Session ended, not setting new interval");
            return;
        }

        // Always load the latest settings from localStorage directly
        const settingsKey = isPomodoroMode
            ? "pomodoroSettings"
            : "trainingSettings";
        let settings;

        try {
            const savedSettings = localStorage.getItem(settingsKey);
            if (savedSettings) {
                settings = JSON.parse(savedSettings);
            } else {
                // If no settings found in localStorage, use currentSettings as fallback
                settings = currentSettings;
            }
        } catch (error) {
            console.error("Error loading settings from localStorage:", error);
            settings = currentSettings; // Fallback to currentSettings
        }

        if (!settings) {
            console.error("No valid settings available");
            return;
        }

        console.log("Setting new interval with:", {
            minInterval: settings.minInterval,
            maxInterval: settings.maxInterval,
        });

        if (
            settings.minInterval <= 0 ||
            settings.maxInterval <= 0 ||
            settings.maxInterval < settings.minInterval
        ) {
            console.error("Invalid interval values:", {
                minInterval: settings.minInterval,
                maxInterval: settings.maxInterval,
            });
            return;
        }

        // Final check before setting a new interval
        // This ensures we don't set a new interval if the session state changed
        // between the function call and this point
        if (isSessionEnded) {
            console.log("Session state changed, not setting new interval");
            return;
        }

        // Generate a random interval between min and max values
        const newInterval = Math.floor(
            Math.random() * (settings.maxInterval - settings.minInterval + 1) +
                settings.minInterval
        );
        console.log("Generated new interval:", newInterval);

        // Update state with the new interval
        setCountdown(newInterval);
    }, [
        isPomodoroMode,
        currentSettings,
        isSessionEnded,
        waitingForConfirmation,
        countdown,
        setCountdown,
    ]);

    /**
     * Handles the user's confirmation that they stood up
     * Called when the user clicks the "Let's Go!" or "Finish Training" button
     * 1. Stops the looping gong4 sound
     * 2. If session has ended, stops the training completely
     * 3. Otherwise, sets a new interval for the next gong
     */
    const handleStoodUp = useCallback(() => {
        // Log when this function is called to help with debugging
        console.log("handleStoodUp called with state:", {
            isTraining,
            waitingForConfirmation,
            isSessionEnded,
            countdown,
        });

        // This function is called when the user clicks the "Let's go!" or "Finish Training" button
        // The button is only active when waitingForConfirmation or isSessionEnded is true
        if (isTraining && (waitingForConfirmation || isSessionEnded)) {
            if (isSessionEnded) {
                setCountdown(0);
                stopGong4();
                setTimeout(() => {
                    stopTraining();
                }, 0);
            } else {
                stopGong4();
                // Najpierw ustawiamy nowy interwał
                setNewInterval();
                // Potem resetujemy flagi
                setWaitingForConfirmation(false);
                setIsGongSequencePlaying(false);
                // Na końcu resetujemy timestamp
                setLastTickTimestamp(null);
            }
        }
    }, [
        isTraining,
        waitingForConfirmation,
        isSessionEnded,
        countdown,
        stopTraining,
        setNewInterval,
        stopGong4,
        setWaitingForConfirmation,
        setIsGongSequencePlaying,
        setLastTickTimestamp,
        setCountdown,
    ]);

    /**
     * Formats a time in seconds to a human-readable string
     * For times less than a minute, shows only seconds
     * For times of a minute or more, shows minutes:seconds format
     *
     * @param seconds - The time in seconds to format
     * @returns Formatted time string (e.g., "45s" or "2:30")
     */
    const formatTime = useCallback((seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        if (minutes === 0) {
            return `${remainingSeconds}s`;
        }
        return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    }, []);

    /**
     * Type guard to validate if an object conforms to the Settings interface
     * Checks that all required properties exist and have the correct types
     *
     * @param obj - The object to validate
     * @returns Boolean indicating whether the object is a valid Settings object
     */
    function isValidSettings(obj: any): obj is Settings {
        return (
            typeof obj === "object" &&
            obj !== null &&
            typeof obj.sessionDuration === "number" &&
            typeof obj.minInterval === "number" &&
            typeof obj.maxInterval === "number" &&
            typeof obj.pause1Duration === "number" &&
            typeof obj.pause2Duration === "number" &&
            typeof obj.isThirdSoundEnabled === "boolean"
        );
    }

    return {
        // State
        isLoading,
        isActive,
        isTraining,
        isGongPlaying,
        isGongSequencePlaying,
        waitingForConfirmation,
        countdown,
        sessionTimeLeft,
        isSessionEnded,

        // Functions
        startTraining,
        stopTraining,
        handleStoodUp,
        formatTime,

        // Type guard
        isValidSettings,
    };
}

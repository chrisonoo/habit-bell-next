"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { CONFIG as TRAINING_CONFIG } from "@/lib/config";
import { CONFIG as POMODORO_CONFIG } from "@/lib/config-pomodoro";
import { useActiveConfig } from "@/hooks/useActiveConfig";
import { useGongSequence } from "@/hooks/useGongSequence";
import { useTrainingTimer } from "@/hooks/useTrainingTimer";
import { Settings, isValidSettings } from "@/lib/types";
import { formatTime, minutesToSeconds } from "@/lib/utils/timeUtils";

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
        // Don't start gong4 loop here - it will be started after the third gong
        // This prevents the gong4 from playing too early
        console.log("Session ended, gong4 will start after sequence completes");
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
     * Helper function to get the latest settings from localStorage
     * @returns The latest settings or null if not available
     */
    const getLatestSettings = useCallback((): Settings | null => {
        const settingsKey = isPomodoroMode
            ? "pomodoroSettings"
            : "trainingSettings";

        try {
            const savedSettings = localStorage.getItem(settingsKey);
            if (savedSettings) {
                const parsedSettings = JSON.parse(savedSettings);
                if (isValidSettings(parsedSettings)) {
                    console.log(
                        "Loaded settings from localStorage:",
                        parsedSettings
                    );
                    return parsedSettings;
                }
            }
        } catch (error) {
            console.error("Error loading settings from localStorage:", error);
        }

        return currentSettings;
    }, [isPomodoroMode, currentSettings]);

    /**
     * Starts a new training session
     * 1. Clears all timers and stops audio playback
     * 2. Loads the latest settings from localStorage
     * 3. Validates settings and initializes the session state
     * 4. Sets the interval based on settings
     */
    const startTraining = useCallback(() => {
        console.log("startTraining called");

        // Reset gong state and stop all audio playback
        resetGongState();

        // Get the latest settings
        const settings = getLatestSettings();

        if (!settings) {
            console.error("No valid settings available");
            return;
        }

        if (settings.sessionDuration <= 0 || settings.interval <= 0) {
            console.error("Invalid training values");
            return;
        }

        console.log("Active mode:", isPomodoroMode ? "pomodoro" : "training");

        // Update currentSettings in the hook to keep it in sync
        loadSettings(activeConfig);

        // Reset all training state
        setIsActive(true);
        setIsTraining(true);

        // Use the interval from settings
        const intervalInSeconds = settings.interval;
        console.log("Setting interval:", intervalInSeconds);

        // Start the timer with the session duration and interval
        startTimer(
            minutesToSeconds(settings.sessionDuration),
            intervalInSeconds
        );
    }, [
        isPomodoroMode,
        activeConfig,
        loadSettings,
        resetGongState,
        startTimer,
        getLatestSettings,
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
     * Sets the interval for the next gong
     * 1. Checks if the session has ended before setting a new interval
     * 2. Loads the latest settings from localStorage
     * 3. Uses the interval from settings
     * 4. Updates the countdown state
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

        // Get the latest settings
        const settings = getLatestSettings();

        if (!settings) {
            console.error("No valid settings available");
            return;
        }

        console.log("Setting new interval with:", {
            interval: settings.interval,
        });

        if (settings.interval <= 0) {
            console.error("Invalid interval value:", {
                interval: settings.interval,
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

        // Use the interval from settings
        const newInterval = settings.interval;
        console.log("Using interval:", newInterval);

        // Final check to ensure session hasn't ended
        if (isSessionEnded) {
            console.log("Session has ended during interval setup, aborting");
            return;
        }

        // Update state with the new interval
        setCountdown(newInterval);
    }, [
        isSessionEnded,
        waitingForConfirmation,
        countdown,
        setCountdown,
        getLatestSettings,
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

        // Stop the gong4 sound first in all cases
        stopGong4();

        // This function is called when the user clicks the "Let's go!" or "Finish Training" button
        if (isTraining) {
            if (isSessionEnded) {
                console.log("Session has ended, stopping training");
                // Use immediate execution to avoid race conditions
                stopTraining();
            } else if (waitingForConfirmation) {
                console.log("Setting new interval and resetting state");
                // Set new interval first
                setNewInterval();
                // Then reset flags
                setWaitingForConfirmation(false);
                setIsGongSequencePlaying(false);
                // Finally reset timestamp
                setLastTickTimestamp(null);
            }
        }
    }, [
        isTraining,
        waitingForConfirmation,
        isSessionEnded,
        stopTraining,
        setNewInterval,
        stopGong4,
        setWaitingForConfirmation,
        setIsGongSequencePlaying,
        setLastTickTimestamp,
    ]);

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
    };
}

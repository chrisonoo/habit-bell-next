"use client";

import React, {
    useState,
    useEffect,
    createContext,
    useContext,
    ReactNode,
    useCallback,
} from "react";
import { CONFIG as TRAINING_CONFIG } from "../lib/config";
import { CONFIG as POMODORO_CONFIG } from "../lib/config-pomodoro";

/**
 * Settings interface defines all configuration parameters for both training and pomodoro modes
 * Contains session duration, interval settings, pause durations, and other settings
 */
interface Settings {
    // Session settings
    sessionDuration: number;
    maxSessionDuration: number;
    stepSessionDuration: number;

    // Interval settings
    interval: number;
    minInterval: number;
    maxInterval: number;
    stepInterval: number;

    // Pause durations
    pause1Duration: number;
    maxPause1Duration: number;
    minPause1Duration: number;
    stepPause1Duration: number;
    pause2Duration: number;
    maxPause2Duration: number;
    minPause2Duration: number;
    stepPause2Duration: number;

    // Other settings
    isThirdSoundEnabled: boolean;
}

/**
 * Context type definition for the active configuration
 * Provides methods and state for managing the active configuration mode and settings
 */
interface ActiveConfigContextType {
    activeConfig: string; // Current active configuration mode ("training" or "pomodoro")
    updateActiveConfig: (newConfig: string) => void; // Function to update the active configuration
    isPomodoroMode: boolean; // Whether pomodoro mode is active
    isTrainingMode: boolean; // Whether training mode is active
    isReady: boolean; // Whether the configuration is ready to use
    currentSettings: Settings | null; // Current settings for the active mode
    loadSettings: (mode: string) => Promise<Settings>; // Function to load settings for a specific mode
}

// Create context with undefined default value
const ActiveConfigContext = createContext<ActiveConfigContextType | undefined>(
    undefined
);

/**
 * Provider component for the active configuration context
 * Manages the active configuration mode and settings
 */
export function ActiveConfigProvider({ children }: { children: ReactNode }) {
    const [isReady, setIsReady] = useState(false);
    const [currentSettings, setCurrentSettings] = useState<Settings | null>(
        null
    );

    /**
     * Creates default settings based on the provided configuration
     * @param config - The configuration object (TRAINING_CONFIG or POMODORO_CONFIG)
     * @param mode - The mode ("training" or "pomodoro")
     * @returns Default settings for the specified mode
     */
    const createDefaultSettings = (
        config: typeof TRAINING_CONFIG | typeof POMODORO_CONFIG,
        mode: "pomodoro" | "training"
    ): Settings => {
        console.log(
            `Creating default settings for ${mode} mode using config:`,
            config
        );
        return {
            // Session settings
            sessionDuration: config.DEFAULT_SESSION_DURATION,
            maxSessionDuration: config.MAX_SESSION_DURATION,
            stepSessionDuration: config.STEP_SESSION_DURATION,

            // Interval settings
            interval: config.DEFAULT_INTERVAL,
            minInterval: config.MIN_INTERVAL,
            maxInterval: config.MAX_INTERVAL,
            stepInterval: config.STEP_INTERVAL,

            // Pause durations
            pause1Duration: config.DEFAULT_PAUSE1_DURATION,
            maxPause1Duration: config.MAX_PAUSE1_DURATION,
            minPause1Duration: config.MIN_PAUSE1_DURATION,
            stepPause1Duration: config.STEP_PAUSE1_DURATION,
            pause2Duration: config.DEFAULT_PAUSE2_DURATION,
            maxPause2Duration: config.MAX_PAUSE2_DURATION,
            minPause2Duration: config.MIN_PAUSE2_DURATION,
            stepPause2Duration: config.STEP_PAUSE2_DURATION,

            // Other settings
            isThirdSoundEnabled: config.DEFAULT_THIRD_SOUND_ENABLED,
        };
    };

    /**
     * Loads settings for the specified mode from localStorage
     * If no settings are found, creates and saves default settings
     * @param mode - The mode to load settings for ("training" or "pomodoro")
     * @returns Promise resolving to the loaded settings
     */
    const loadSettings = useCallback((mode: string) => {
        return new Promise<Settings>((resolve) => {
            const settingsKey =
                mode === "pomodoro" ? "pomodoroSettings" : "trainingSettings";
            const CONFIG =
                mode === "pomodoro" ? POMODORO_CONFIG : TRAINING_CONFIG;

            try {
                // Try to load settings from localStorage
                const savedSettings = localStorage.getItem(settingsKey);
                if (savedSettings) {
                    const settings = JSON.parse(savedSettings);

                    // Check if we need to migrate from old format to new format
                    if (
                        settings.minInterval === undefined ||
                        settings.maxInterval === undefined ||
                        settings.stepInterval === undefined
                    ) {
                        // Add missing interval properties
                        settings.minInterval = CONFIG.MIN_INTERVAL;
                        settings.maxInterval = CONFIG.MAX_INTERVAL;
                        settings.stepInterval = CONFIG.STEP_INTERVAL;

                        // If interval is missing, set it to default
                        if (settings.interval === undefined) {
                            settings.interval = CONFIG.DEFAULT_INTERVAL;
                        }

                        // Save migrated settings
                        localStorage.setItem(
                            settingsKey,
                            JSON.stringify(settings)
                        );
                    }

                    setCurrentSettings(settings);
                    resolve(settings);
                    return;
                }
            } catch (error) {
                console.error("Error loading settings:", error);
            }

            // If no valid settings found, create and save defaults
            const defaultSettings = createDefaultSettings(
                CONFIG,
                mode as "pomodoro" | "training"
            );
            localStorage.setItem(settingsKey, JSON.stringify(defaultSettings));
            setCurrentSettings(defaultSettings);
            resolve(defaultSettings);
        });
    }, []);

    // Initialize activeConfig from localStorage or default to "training"
    const [activeConfig, setActiveConfig] = useState(() => {
        if (typeof window !== "undefined") {
            const savedConfig =
                localStorage.getItem("activeConfig") || "training";
            return savedConfig;
        }
        return "training";
    });

    // Initialize settings only once when component mounts
    useEffect(() => {
        if (typeof window !== "undefined") {
            setIsReady(false);
            loadSettings(activeConfig);
            setIsReady(true);
        }
    }, []); // Empty dependency array means this runs once on mount

    /**
     * Updates the active configuration mode and loads the corresponding settings
     * @param newConfig - The new configuration mode to set
     */
    const updateActiveConfig = useCallback(
        (newConfig: string) => {
            if (typeof window !== "undefined") {
                setIsReady(false);
                loadSettings(newConfig);
                localStorage.setItem("activeConfig", newConfig);
                setActiveConfig(newConfig);
                setIsReady(true);
            }
        },
        [loadSettings]
    );

    // Update settings only when activeConfig changes (mode switch)
    useEffect(() => {
        if (typeof window !== "undefined" && activeConfig) {
            loadSettings(activeConfig);
        }
    }, [activeConfig, loadSettings]);

    // Prepare context value
    const value = {
        activeConfig,
        updateActiveConfig,
        isPomodoroMode: activeConfig === "pomodoro",
        isTrainingMode: activeConfig === "training",
        isReady,
        currentSettings,
        loadSettings,
    };

    return (
        <ActiveConfigContext.Provider value={value}>
            {children}
        </ActiveConfigContext.Provider>
    );
}

/**
 * Custom hook to access the active configuration context
 * Must be used within an ActiveConfigProvider
 * @returns The active configuration context
 * @throws Error if used outside of an ActiveConfigProvider
 */
export function useActiveConfig() {
    const context = useContext(ActiveConfigContext);
    if (context === undefined) {
        throw new Error(
            "useActiveConfig must be used within an ActiveConfigProvider"
        );
    }
    return context;
}

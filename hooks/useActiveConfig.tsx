"use client";

import React, {
    useState,
    useEffect,
    createContext,
    useContext,
    ReactNode,
} from "react";
import { CONFIG as TRAINING_CONFIG } from "../lib/config";
import { CONFIG as POMODORO_CONFIG } from "../lib/config-pomodoro";

interface Settings {
    // Session settings
    sessionDuration: number;
    maxSessionDuration: number;
    stepSessionDuration: number;

    // Interval settings
    minInterval: number;
    maxInterval: number;
    stepInterval: number;
    defaultMinInterval: number;
    defaultMaxInterval: number;

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

interface ActiveConfigContextType {
    activeConfig: string;
    updateActiveConfig: (newConfig: string) => void;
    isPomodoroMode: boolean;
    isTrainingMode: boolean;
}

const ActiveConfigContext = createContext<ActiveConfigContextType | undefined>(
    undefined
);

export function ActiveConfigProvider({ children }: { children: ReactNode }) {
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
            minInterval: config.DEFAULT_MIN_INTERVAL,
            maxInterval: config.DEFAULT_MAX_INTERVAL,
            stepInterval: config.STEP_INTERVAL,
            defaultMinInterval: config.MIN_INTERVAL,
            defaultMaxInterval: config.MAX_INTERVAL,

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

    const [activeConfig, setActiveConfig] = useState(() => {
        if (typeof window !== "undefined") {
            const savedConfig = localStorage.getItem("activeConfig");
            if (!savedConfig) {
                // Initialize with training mode and settings if no configuration exists
                const defaultTrainingSettings = createDefaultSettings(
                    TRAINING_CONFIG,
                    "training"
                );
                console.log(
                    "Initial training settings:",
                    defaultTrainingSettings
                );

                // Save default settings and config
                localStorage.setItem(
                    "trainingSettings",
                    JSON.stringify(defaultTrainingSettings)
                );
                localStorage.setItem("activeConfig", "training");
                return "training";
            }
            return savedConfig;
        }
        return "training";
    });

    // Initialize settings for the current mode if they don't exist
    useEffect(() => {
        if (typeof window !== "undefined") {
            const currentMode = activeConfig;
            const settingsKey =
                currentMode === "pomodoro"
                    ? "pomodoroSettings"
                    : "trainingSettings";
            const savedSettings = localStorage.getItem(settingsKey);

            if (!savedSettings) {
                const CONFIG =
                    currentMode === "pomodoro"
                        ? POMODORO_CONFIG
                        : TRAINING_CONFIG;
                const defaultSettings = createDefaultSettings(
                    CONFIG,
                    currentMode as "pomodoro" | "training"
                );
                console.log(
                    `Creating default settings for ${currentMode} mode:`,
                    defaultSettings
                );

                localStorage.setItem(
                    settingsKey,
                    JSON.stringify(defaultSettings)
                );
            }
        }
    }, [activeConfig]);

    const updateActiveConfig = (newConfig: string) => {
        if (typeof window !== "undefined") {
            // Check if settings exist for the new mode
            const settingsKey =
                newConfig === "pomodoro"
                    ? "pomodoroSettings"
                    : "trainingSettings";
            const savedSettings = localStorage.getItem(settingsKey);

            // Always create and save default settings for the new mode
            const CONFIG =
                newConfig === "pomodoro" ? POMODORO_CONFIG : TRAINING_CONFIG;
            const defaultSettings = createDefaultSettings(
                CONFIG,
                newConfig as "pomodoro" | "training"
            );
            console.log(
                `Creating new settings for ${newConfig} mode:`,
                defaultSettings,
                CONFIG
            );

            // Save settings before updating active config
            localStorage.setItem(settingsKey, JSON.stringify(defaultSettings));

            // Verify settings were saved correctly
            const verifySettings = localStorage.getItem(settingsKey);
            if (verifySettings) {
                const parsedSettings = JSON.parse(verifySettings);
                console.log(
                    `Verified settings for ${newConfig} mode:`,
                    parsedSettings
                );

                // Only update active config if settings were saved successfully
                localStorage.setItem("activeConfig", newConfig);
                setActiveConfig(newConfig);
                console.log(`Switched to ${newConfig} mode`);
            } else {
                console.error(`Failed to save settings for ${newConfig} mode`);
            }
        }
    };

    const value = {
        activeConfig,
        updateActiveConfig,
        isPomodoroMode: activeConfig === "pomodoro",
        isTrainingMode: activeConfig === "training",
    };

    return (
        <ActiveConfigContext.Provider value={value}>
            {children}
        </ActiveConfigContext.Provider>
    );
}

export function useActiveConfig() {
    const context = useContext(ActiveConfigContext);
    if (context === undefined) {
        throw new Error(
            "useActiveConfig must be used within an ActiveConfigProvider"
        );
    }
    return context;
}

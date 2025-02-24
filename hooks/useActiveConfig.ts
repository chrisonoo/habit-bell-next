import { useState, useEffect } from "react";
import { CONFIG as TRAINING_CONFIG } from "@/lib/config";
import { CONFIG as POMODORO_CONFIG } from "@/lib/config-pomodoro";

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

export function useActiveConfig() {
    const [activeConfig, setActiveConfig] = useState(() => {
        if (typeof window !== "undefined") {
            const savedConfig = localStorage.getItem("activeConfig");
            if (!savedConfig) {
                // Initialize with training mode and settings if no configuration exists
                const defaultTrainingSettings: Settings = {
                    // Session settings
                    sessionDuration: TRAINING_CONFIG.DEFAULT_SESSION_DURATION,
                    maxSessionDuration: TRAINING_CONFIG.MAX_SESSION_DURATION,
                    stepSessionDuration: TRAINING_CONFIG.STEP_SESSION_DURATION,

                    // Interval settings
                    minInterval: TRAINING_CONFIG.DEFAULT_MIN_INTERVAL,
                    maxInterval: TRAINING_CONFIG.DEFAULT_MAX_INTERVAL,
                    stepInterval: TRAINING_CONFIG.STEP_INTERVAL,
                    defaultMinInterval: TRAINING_CONFIG.MIN_INTERVAL,
                    defaultMaxInterval: TRAINING_CONFIG.MAX_INTERVAL,

                    // Pause durations
                    pause1Duration: TRAINING_CONFIG.DEFAULT_PAUSE1_DURATION,
                    maxPause1Duration: TRAINING_CONFIG.MAX_PAUSE1_DURATION,
                    minPause1Duration: TRAINING_CONFIG.MIN_PAUSE1_DURATION,
                    stepPause1Duration: TRAINING_CONFIG.STEP_PAUSE1_DURATION,
                    pause2Duration: TRAINING_CONFIG.DEFAULT_PAUSE2_DURATION,
                    maxPause2Duration: TRAINING_CONFIG.MAX_PAUSE2_DURATION,
                    minPause2Duration: TRAINING_CONFIG.MIN_PAUSE2_DURATION,
                    stepPause2Duration: TRAINING_CONFIG.STEP_PAUSE2_DURATION,

                    // Other settings
                    isThirdSoundEnabled:
                        TRAINING_CONFIG.DEFAULT_THIRD_SOUND_ENABLED,
                };

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

    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("activeConfig", activeConfig);
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

            if (!savedSettings) {
                // Initialize default settings for the new mode
                const CONFIG =
                    newConfig === "pomodoro"
                        ? POMODORO_CONFIG
                        : TRAINING_CONFIG;
                const defaultSettings: Settings = {
                    // Session settings
                    sessionDuration: CONFIG.DEFAULT_SESSION_DURATION,
                    maxSessionDuration: CONFIG.MAX_SESSION_DURATION,
                    stepSessionDuration: CONFIG.STEP_SESSION_DURATION,

                    // Interval settings
                    minInterval: CONFIG.DEFAULT_MIN_INTERVAL,
                    maxInterval: CONFIG.DEFAULT_MAX_INTERVAL,
                    stepInterval: CONFIG.STEP_INTERVAL,
                    defaultMinInterval: CONFIG.MIN_INTERVAL,
                    defaultMaxInterval: CONFIG.MAX_INTERVAL,

                    // Pause durations
                    pause1Duration: CONFIG.DEFAULT_PAUSE1_DURATION,
                    maxPause1Duration: CONFIG.MAX_PAUSE1_DURATION,
                    minPause1Duration: CONFIG.MIN_PAUSE1_DURATION,
                    stepPause1Duration: CONFIG.STEP_PAUSE1_DURATION,
                    pause2Duration: CONFIG.DEFAULT_PAUSE2_DURATION,
                    maxPause2Duration: CONFIG.MAX_PAUSE2_DURATION,
                    minPause2Duration: CONFIG.MIN_PAUSE2_DURATION,
                    stepPause2Duration: CONFIG.STEP_PAUSE2_DURATION,

                    // Other settings
                    isThirdSoundEnabled: CONFIG.DEFAULT_THIRD_SOUND_ENABLED,
                };

                // Save default settings for the new mode
                localStorage.setItem(
                    settingsKey,
                    JSON.stringify(defaultSettings)
                );
            }
        }
        setActiveConfig(newConfig);
    };

    return {
        activeConfig,
        updateActiveConfig,
        isPomodoroMode: activeConfig === "pomodoro",
        isTrainingMode: activeConfig === "training",
    };
}

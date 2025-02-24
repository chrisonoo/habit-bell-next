import { useState, useEffect } from "react";
import { CONFIG as TRAINING_CONFIG } from "@/lib/config";

export function useActiveConfig() {
    const [activeConfig, setActiveConfig] = useState(() => {
        if (typeof window !== "undefined") {
            const savedConfig = localStorage.getItem("activeConfig");
            if (!savedConfig) {
                // Initialize with training mode and settings if no configuration exists
                const defaultTrainingSettings = {
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
        setActiveConfig(newConfig);
    };

    return {
        activeConfig,
        updateActiveConfig,
        isPomodoroMode: activeConfig === "pomodoro",
        isTrainingMode: activeConfig === "training",
    };
}

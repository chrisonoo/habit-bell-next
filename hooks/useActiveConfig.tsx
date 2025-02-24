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
    isReady: boolean;
    currentSettings: Settings | null;
}

const ActiveConfigContext = createContext<ActiveConfigContextType | undefined>(
    undefined
);

export function ActiveConfigProvider({ children }: { children: ReactNode }) {
    const [isReady, setIsReady] = useState(false);
    const [currentSettings, setCurrentSettings] = useState<Settings | null>(
        null
    );

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

    const loadSettings = useCallback((mode: string) => {
        const settingsKey =
            mode === "pomodoro" ? "pomodoroSettings" : "trainingSettings";
        const CONFIG = mode === "pomodoro" ? POMODORO_CONFIG : TRAINING_CONFIG;

        try {
            const savedSettings = localStorage.getItem(settingsKey);
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                setCurrentSettings(settings);
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
    }, []);

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

    const value = {
        activeConfig,
        updateActiveConfig,
        isPomodoroMode: activeConfig === "pomodoro",
        isTrainingMode: activeConfig === "training",
        isReady,
        currentSettings,
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

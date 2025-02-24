import { useState, useEffect } from "react";

export function useActiveConfig() {
    const [activeConfig, setActiveConfig] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("activeConfig") || "pomodoro";
        }
        return "pomodoro";
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

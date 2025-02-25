"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrainingStatus } from "@/components/training/TrainingStatus";
import { SessionTimeLeft } from "@/components/training/SessionTimeLeft";
import { TrainingButtons } from "@/components/training/TrainingButtons";
import { CONFIG as TRAINING_CONFIG } from "@/lib/config";
import { CONFIG as POMODORO_CONFIG } from "@/lib/config-pomodoro";
import { cn } from "@/lib/utils";
import { TrainingClockIcon } from "@/components/training/TrainingClockIcon";
import { useActiveConfig } from "@/hooks/useActiveConfig";
import { useHeader } from "@/components/layout/Header";

interface Settings {
    sessionDuration: number;
    minInterval: number;
    maxInterval: number;
    pause1Duration: number;
    pause2Duration: number;
    isThirdSoundEnabled: boolean;
}

export default function HomePage() {
    const {
        activeConfig,
        isPomodoroMode,
        isReady,
        currentSettings,
        loadSettings,
    } = useActiveConfig();
    const CONFIG = isPomodoroMode ? POMODORO_CONFIG : TRAINING_CONFIG;

    // Initialize with loading state
    const [isLoading, setIsLoading] = useState(true);
    const [isActive, setIsActive] = useState(false);
    const [isTraining, setIsTraining] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [currentInterval, setCurrentInterval] = useState(0);
    const [isGongPlaying, setIsGongPlaying] = useState(false);
    const [sessionTimeLeft, setSessionTimeLeft] = useState(0);
    const [isSessionEnded, setIsSessionEnded] = useState(false);
    const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);
    const [isLastInterval, setIsLastInterval] = useState(false);
    const [isGongSequencePlaying, setIsGongSequencePlaying] = useState(false);
    const [audioFailed, setAudioFailed] = useState(false);
    const [audioFailed2, setAudioFailed2] = useState(false);
    const [audioFailed3, setAudioFailed3] = useState(false);

    const audioRefs = useRef<HTMLAudioElement[]>([]);
    const audio2Ref = useRef<HTMLAudioElement | null>(null);
    const audio3Ref = useRef<HTMLAudioElement | null>(null);
    const audio4Ref = useRef<HTMLAudioElement | null>(null);
    const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
    const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
    const gongSequenceTimerRef = useRef<NodeJS.Timeout | null>(null);

    const isActiveRef = useRef(isActive);

    useEffect(() => {
        console.log("Page loaded - Home Page");
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
    }, []);

    useEffect(() => {
        isActiveRef.current = isActive;
    }, [isActive]);

    useEffect(() => {
        if (currentSettings) {
            setIsLoading(false);
        }
    }, [currentSettings]);

    useEffect(() => {
        const initAudio = async () => {
            try {
                audioRefs.current = TRAINING_CONFIG.AUDIO_URLS.GONG1.map(
                    (url) => new Audio(url)
                );
                audio2Ref.current = new Audio(TRAINING_CONFIG.AUDIO_URLS.GONG2);
                audio3Ref.current = new Audio(TRAINING_CONFIG.AUDIO_URLS.GONG3);
                audio4Ref.current = new Audio(TRAINING_CONFIG.AUDIO_URLS.GONG4);

                // Initialize all GONG1 sounds
                for (const audio of audioRefs.current) {
                    await audio.play();
                    audio.pause();
                    audio.currentTime = 0;
                }

                // Initialize GONG2, GONG3 and GONG4
                await audio2Ref.current.play();
                await audio3Ref.current.play();
                await audio4Ref.current.play();
                audio2Ref.current.pause();
                audio3Ref.current.pause();
                audio4Ref.current.pause();
                audio2Ref.current.currentTime = 0;
                audio3Ref.current.currentTime = 0;
                audio4Ref.current.currentTime = 0;

                setAudioFailed(false);
                setAudioFailed2(false);
                setAudioFailed3(false);
            } catch (error) {
                console.error("Audio initialization failed:", error);
                setAudioFailed(true);
                setAudioFailed2(true);
                setAudioFailed3(true);
            }
        };
        initAudio();
    }, []);

    useEffect(() => {
        // Ten useEffect odpowiada za odliczanie czasu do następnego gongu
        // Don't do anything if the session has ended or this is the last interval
        if (isSessionEnded || isLastInterval) {
            // Ensure countdown is reset to 0 when session is ending
            if (countdown > 0) {
                setCountdown(0);
            }
            return;
        }

        if (
            isActive &&
            isTraining &&
            countdown > 0 &&
            !isSessionEnded &&
            !isLastInterval
        ) {
            // Jeśli countdown > 0, odliczaj czas
            countdownTimerRef.current = setTimeout(() => {
                if (isActiveRef.current && !isSessionEnded && !isLastInterval) {
                    setCountdown(countdown - 1);
                }
            }, 1000);
        } else if (
            isActive &&
            isTraining &&
            countdown === 0 &&
            !isSessionEnded &&
            !isLastInterval
        ) {
            // Jeśli countdown = 0 i sesja nie zakończyła się i nie jest to ostatni interwał,
            // odtwórz sekwencję dźwiękową
            playGongSequence();
        } else if (
            isActive &&
            isTraining &&
            countdown === 0 &&
            (isSessionEnded || isLastInterval)
        ) {
            // Jeśli to ostatni interwał, ale sesja jeszcze nie jest oznaczona jako zakończona,
            // oznacz ją jako zakończoną
            if (isLastInterval && !isSessionEnded) {
                setIsSessionEnded(true);
            }

            // Jeśli sesja się zakończyła i odliczanie doszło do zera,
            // ustawiamy waitingForConfirmation na true, aby umożliwić kliknięcie Finish Training
            setWaitingForConfirmation(true);
            // Uruchamiamy dźwięk gong4 w pętli, aby zasygnalizować koniec treningu
            if (audio4Ref.current) {
                audio4Ref.current.loop = true;
                audio4Ref.current.currentTime = 0;
                audio4Ref.current.play().catch((error) => {
                    console.error("Gong4 playback failed:", error);
                });
            }
        }
        // Cleanup - zatrzymaj timer przy odmontowaniu komponentu lub zmianie zależności
        return () => {
            if (countdownTimerRef.current)
                clearTimeout(countdownTimerRef.current);
        };
    }, [isActive, isTraining, countdown, isSessionEnded, isLastInterval]);

    useEffect(() => {
        // Don't do anything if the session has already ended
        if (isSessionEnded) {
            return;
        }

        if (isActive && isTraining && !isGongSequencePlaying) {
            sessionTimerRef.current = setTimeout(() => {
                if (isActiveRef.current && !isSessionEnded) {
                    if (sessionTimeLeft > 0) {
                        setSessionTimeLeft(sessionTimeLeft - 1);
                    } else if (!isSessionEnded) {
                        // When the session time runs out:
                        // 1. Set isSessionEnded = true to indicate the session has ended
                        // 2. Set isLastInterval = true to indicate this is the last interval
                        // These two flags together ensure the training will end properly
                        setIsSessionEnded(true);
                        setIsLastInterval(true);

                        // If countdown is already at 0, enable the "Finish Training" button
                        // and play the end-of-training sound
                        if (countdown === 0) {
                            setWaitingForConfirmation(true);
                            if (audio4Ref.current) {
                                audio4Ref.current.loop = true;
                                audio4Ref.current.currentTime = 0;
                                audio4Ref.current.play().catch((error) => {
                                    console.error(
                                        "Gong4 playback failed:",
                                        error
                                    );
                                });
                            }
                        }
                    }
                }
            }, 1000);
        }
        return () => {
            if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current);
        };
    }, [
        isActive,
        isTraining,
        sessionTimeLeft,
        isSessionEnded,
        isGongSequencePlaying,
        countdown,
    ]);

    const startTraining = useCallback(() => {
        // First, clear all timers to prevent any further state updates
        if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current);
        if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current);
        if (gongSequenceTimerRef.current)
            clearTimeout(gongSequenceTimerRef.current);

        // Immediately stop all audio playback
        audioRefs.current.forEach((audio) => {
            audio.pause();
            audio.currentTime = 0;
        });
        if (audio2Ref.current) {
            audio2Ref.current.pause();
            audio2Ref.current.currentTime = 0;
        }
        if (audio3Ref.current) {
            audio3Ref.current.pause();
            audio3Ref.current.currentTime = 0;
        }
        if (audio4Ref.current) {
            audio4Ref.current.loop = false;
            audio4Ref.current.pause();
            audio4Ref.current.currentTime = 0;
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
                console.log(
                    "Starting training with latest settings from localStorage:",
                    settings
                );
            } else {
                // If no settings found in localStorage, use currentSettings as fallback
                settings = currentSettings;
                console.log(
                    "No settings found in localStorage, using current settings:",
                    settings
                );
            }
        } catch (error) {
            console.error("Error loading settings from localStorage:", error);
            settings = currentSettings; // Fallback to currentSettings
        }

        if (!settings) {
            console.error("No valid settings available");
            return;
        }

        // Validate values before starting
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
        setSessionTimeLeft(settings.sessionDuration * 60);
        setIsSessionEnded(false);
        setIsLastInterval(false);
        setWaitingForConfirmation(false);
        setIsGongSequencePlaying(false);
        setIsGongPlaying(false);
        setCountdown(0);
        setCurrentInterval(0);

        // Set new interval
        setNewInterval();
    }, [isPomodoroMode, currentSettings, activeConfig, loadSettings]);

    const stopTraining = useCallback(() => {
        console.log("stopTraining called");

        // First, clear all timers to prevent any further state updates
        if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current);
        if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current);
        if (gongSequenceTimerRef.current)
            clearTimeout(gongSequenceTimerRef.current);

        // Immediately stop all audio playback
        audioRefs.current.forEach((audio) => {
            audio.pause();
            audio.currentTime = 0;
        });
        if (audio2Ref.current) {
            audio2Ref.current.pause();
            audio2Ref.current.currentTime = 0;
        }
        if (audio3Ref.current) {
            audio3Ref.current.pause();
            audio3Ref.current.currentTime = 0;
        }
        if (audio4Ref.current) {
            audio4Ref.current.loop = false;
            audio4Ref.current.pause();
            audio4Ref.current.currentTime = 0;
        }

        // Then reset all training state in a single batch to prevent UI flicker
        // We use a function to ensure we get the latest state
        setIsActive(false);
        setIsTraining(false);
        setCountdown(0);
        setCurrentInterval(0);
        setSessionTimeLeft(0);
        setIsSessionEnded(false);
        setWaitingForConfirmation(false);
        setIsLastInterval(false);
        setIsGongPlaying(false);
        setIsGongSequencePlaying(false);
    }, []);

    const setNewInterval = useCallback(() => {
        // Log when this function is called to help with debugging
        console.log("setNewInterval called with state:", {
            isSessionEnded,
            isLastInterval,
            waitingForConfirmation,
            countdown,
        });

        // Early return if the session is ending or has ended
        // This is a critical check to prevent setting a new interval when the session is ending
        if (isSessionEnded || isLastInterval) {
            console.log(
                "Session ended or last interval, not setting new interval"
            );
            // Aktywuj przycisk "Finish Training"
            setWaitingForConfirmation(true);
            // Uruchamiamy dźwięk gong4 w pętli, aby zasygnalizować koniec treningu
            if (audio4Ref.current) {
                audio4Ref.current.loop = true;
                audio4Ref.current.currentTime = 0;
                audio4Ref.current.play().catch((error) => {
                    console.error("Gong4 playback failed:", error);
                });
            }
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
        if (isSessionEnded || isLastInterval) {
            console.log("Session state changed, not setting new interval");
            return;
        }

        const newInterval = Math.floor(
            Math.random() * (settings.maxInterval - settings.minInterval + 1) +
                settings.minInterval
        );
        console.log("Generated new interval:", newInterval);

        setCurrentInterval(newInterval);
        setCountdown(newInterval);
        setWaitingForConfirmation(false);
    }, [
        isPomodoroMode,
        currentSettings,
        isSessionEnded,
        isLastInterval,
        setWaitingForConfirmation,
        countdown,
    ]);

    const startGong4Loop = useCallback(() => {
        if (!isActiveRef.current || !audio4Ref.current) return;

        const playGong4 = () => {
            if (!isActiveRef.current || !audio4Ref.current) return;
            audio4Ref.current.currentTime = 0;
            audio4Ref.current.play().catch((error) => {
                console.error("Gong4 playback failed:", error);
            });
        };

        audio4Ref.current.loop = true;
        playGong4();
    }, []);

    const playThirdGong = useCallback(() => {
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

        if (!isActiveRef.current || !settings.isThirdSoundEnabled) {
            setWaitingForConfirmation(true);
            startGong4Loop();
            return;
        }
        if (audio3Ref.current) {
            gongSequenceTimerRef.current = setTimeout(() => {
                if (isActiveRef.current && settings.isThirdSoundEnabled) {
                    setIsGongPlaying(true);
                    audio3Ref
                        .current!.play()
                        .then(() => {
                            audio3Ref.current!.onended = () => {
                                if (isActiveRef.current) {
                                    setIsGongPlaying(false);
                                    setWaitingForConfirmation(true);
                                    startGong4Loop();
                                }
                            };
                        })
                        .catch((error) => {
                            console.error("Third gong playback failed:", error);
                            if (isActiveRef.current) {
                                setIsGongPlaying(false);
                                setWaitingForConfirmation(true);
                                startGong4Loop();
                            }
                        });
                } else {
                    setWaitingForConfirmation(true);
                    startGong4Loop();
                }
            }, (settings.pause1Duration || CONFIG.DEFAULT_PAUSE1_DURATION) * 1000);
        } else {
            setWaitingForConfirmation(true);
            startGong4Loop();
        }
    }, [
        isPomodoroMode,
        currentSettings,
        CONFIG,
        startGong4Loop,
        setWaitingForConfirmation,
    ]);

    const stopGong4 = useCallback(() => {
        if (audio4Ref.current) {
            audio4Ref.current.loop = false;
            audio4Ref.current.pause();
            audio4Ref.current.currentTime = 0;
        }
    }, []);

    const handleStoodUp = useCallback(() => {
        // Log when this function is called to help with debugging
        console.log("handleStoodUp called with state:", {
            isTraining,
            waitingForConfirmation,
            isSessionEnded,
            isLastInterval,
            countdown,
        });

        // This function is called when the user clicks the "Let's go!" or "Finish Training" button
        // The button is only active when waitingForConfirmation or isSessionEnded is true
        if (isTraining && (waitingForConfirmation || isSessionEnded)) {
            // Stop the gong4 sound (looping sound)
            stopGong4();
            setIsGongSequencePlaying(false);

            // If the session has ended or this is the last interval, end the training
            // This is the key fix: when isSessionEnded or isLastInterval is true,
            // we immediately stop the training without setting a new interval
            if (isSessionEnded || isLastInterval) {
                console.log(
                    "Session ended or last interval, stopping training"
                );

                // Immediately update ALL UI state variables to prevent any flicker
                // Set both flags to true to ensure consistent UI state
                setIsSessionEnded(true);
                setIsLastInterval(true);
                setCountdown(0);
                setCurrentInterval(0);
                setWaitingForConfirmation(false);

                // Use setTimeout to ensure the UI updates before stopping training
                setTimeout(() => {
                    // End the training - resets all states and stops all sounds
                    stopTraining();
                }, 0);
            } else {
                // Double-check that we're not in the process of ending the session
                // This prevents setting a new interval when the session is ending
                if (!isSessionEnded && !isLastInterval) {
                    console.log("Setting new interval");
                    // Otherwise, set a new interval
                    setNewInterval();
                } else {
                    console.log("Not setting new interval - session is ending");
                    // If we somehow got here with isSessionEnded or isLastInterval true,
                    // stop the training instead of setting a new interval
                    setTimeout(() => {
                        stopTraining();
                    }, 0);
                }
            }
        }
    }, [
        isTraining,
        waitingForConfirmation,
        isSessionEnded,
        isLastInterval,
        stopTraining,
        setNewInterval,
        stopGong4,
        setIsGongSequencePlaying,
        countdown,
    ]);

    const playGongSequence = useCallback(() => {
        // Log when this function is called to help with debugging
        console.log("playGongSequence called with state:", {
            isSessionEnded,
            isLastInterval,
        });

        // Funkcja odtwarzająca sekwencję dźwiękową (gong1, gong2, gong3, gong4)
        // Wywoływana, gdy countdown dojdzie do 0
        // Early return if the session is ending or has ended
        if (!isActiveRef.current || isSessionEnded || isLastInterval) {
            console.log(
                "Not playing gong sequence - session is ending or inactive"
            );
            return;
        }

        // Ustaw flagę, że sekwencja dźwiękowa jest odtwarzana
        setIsGongSequencePlaying(true);

        // Upewnij się, że countdown jest ustawiony na 0
        setCountdown(0);

        // Clear the session timer when gong sequence starts
        if (sessionTimerRef.current) {
            clearTimeout(sessionTimerRef.current);
        }

        // Final check before playing the gong sequence
        // This ensures we don't play the gong sequence if the session state changed
        if (isSessionEnded || isLastInterval) {
            console.log("Session state changed, not playing gong sequence");
            setIsGongSequencePlaying(false);
            return;
        }

        // Rozpocznij odtwarzanie sekwencji dźwiękowej
        playFirstGong();
    }, [setCountdown, isSessionEnded, isLastInterval]);

    const getRandomGong1 = useCallback(() => {
        const randomIndex = Math.floor(
            Math.random() * audioRefs.current.length
        );
        return audioRefs.current[randomIndex];
    }, []);

    const playFirstGong = useCallback(() => {
        if (!isActiveRef.current) return;

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

        const randomGong = getRandomGong1();
        if (randomGong) {
            setIsGongPlaying(true);
            randomGong
                .play()
                .then(() => {
                    randomGong.onended = () => {
                        if (isActiveRef.current) {
                            setIsGongPlaying(false);
                            gongSequenceTimerRef.current = setTimeout(
                                playSecondGongSequence,
                                (settings.pause1Duration ||
                                    CONFIG.DEFAULT_PAUSE1_DURATION) * 1000
                            );
                        }
                    };
                })
                .catch((error) => {
                    console.error("First gong playback failed:", error);
                    if (isActiveRef.current) {
                        setIsGongPlaying(false);
                        gongSequenceTimerRef.current = setTimeout(
                            playSecondGongSequence,
                            (settings.pause1Duration ||
                                CONFIG.DEFAULT_PAUSE1_DURATION) * 1000
                        );
                    }
                });
        } else {
            gongSequenceTimerRef.current = setTimeout(
                playSecondGongSequence,
                (settings.pause1Duration || CONFIG.DEFAULT_PAUSE1_DURATION) *
                    1000
            );
        }
    }, [isPomodoroMode, currentSettings, CONFIG, getRandomGong1]);

    const playSecondGongSequence = useCallback(() => {
        if (!isActiveRef.current) return;

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

        let count = 0;
        const playNextGong = () => {
            if (!isActiveRef.current) return;
            if (audio2Ref.current) {
                setIsGongPlaying(true);
                audio2Ref.current
                    .play()
                    .then(() => {
                        audio2Ref.current!.onended = () => {
                            if (isActiveRef.current) {
                                setIsGongPlaying(false);
                                count++;
                                if (count < 5) {
                                    gongSequenceTimerRef.current = setTimeout(
                                        playNextGong,
                                        (settings.pause2Duration ||
                                            CONFIG.DEFAULT_PAUSE2_DURATION) *
                                            1000
                                    );
                                } else {
                                    if (settings.isThirdSoundEnabled) {
                                        playThirdGong();
                                    } else {
                                        // Set waitingForConfirmation to true to enable the Let's Go button
                                        setWaitingForConfirmation(true);
                                        startGong4Loop();
                                    }
                                }
                            }
                        };
                    })
                    .catch((error) => {
                        console.error("Second gong playback failed:", error);
                        if (isActiveRef.current) {
                            setIsGongPlaying(false);
                            count++;
                            if (count < 5) {
                                gongSequenceTimerRef.current = setTimeout(
                                    playNextGong,
                                    (settings.pause2Duration ||
                                        CONFIG.DEFAULT_PAUSE2_DURATION) * 1000
                                );
                            } else {
                                if (settings.isThirdSoundEnabled) {
                                    playThirdGong();
                                } else {
                                    // Set waitingForConfirmation to true to enable the Let's Go button
                                    setWaitingForConfirmation(true);
                                    startGong4Loop();
                                }
                            }
                        }
                    });
            } else {
                count++;
                if (count < 5) {
                    gongSequenceTimerRef.current = setTimeout(
                        playNextGong,
                        (settings.pause2Duration ||
                            CONFIG.DEFAULT_PAUSE2_DURATION) * 1000
                    );
                } else {
                    if (settings.isThirdSoundEnabled) {
                        playThirdGong();
                    } else {
                        // Set waitingForConfirmation to true to enable the Let's Go button
                        setWaitingForConfirmation(true);
                        startGong4Loop();
                    }
                }
            }
        };
        playNextGong();
    }, [
        isPomodoroMode,
        currentSettings,
        CONFIG,
        playThirdGong,
        startGong4Loop,
        setWaitingForConfirmation,
    ]);

    const playTestGong = useCallback(
        (gongNumber: 1 | 2 | 3) => {
            const audio =
                gongNumber === 1
                    ? getRandomGong1()
                    : gongNumber === 2
                    ? audio2Ref.current
                    : audio3Ref.current;
            if (audio) {
                setIsGongPlaying(true);
                audio
                    .play()
                    .then(() => {
                        audio.onended = () => setIsGongPlaying(false);
                    })
                    .catch((error) => {
                        console.error(
                            `Test gong ${gongNumber} playback failed:`,
                            error
                        );
                        setIsGongPlaying(false);
                        if (gongNumber === 1) {
                            setAudioFailed(true);
                        } else if (gongNumber === 2) {
                            setAudioFailed2(true);
                        } else {
                            setAudioFailed3(true);
                        }
                    });
            }
        },
        [getRandomGong1]
    );

    const formatTime = useCallback((seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        if (minutes === 0) {
            return `${remainingSeconds}s`;
        }
        return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    }, []);

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

    if (isLoading) {
        return <div>Loading settings...</div>;
    }

    return (
        <div className="flex-1 flex items-center justify-center p-4">
            <Card
                className={cn(
                    "w-full max-w-[600px] transition-colors duration-200 border-2",
                    isGongPlaying ? "border-red-500" : "border-gray-200"
                )}
            >
                <CardContent className="space-y-6 p-6">
                    <div className="text-center flex flex-col justify-center min-h-[7rem]">
                        {!isTraining && (
                            <>
                                <TrainingClockIcon
                                    onClick={useHeader().toggleHeader}
                                />
                                <div className="text-sm text-muted-foreground mb-4">
                                    Active Mode:{" "}
                                    {isPomodoroMode ? "Pomodoro" : "Training"}
                                </div>
                            </>
                        )}
                        <div className="flex-1 flex items-center justify-center">
                            <TrainingStatus
                                isTraining={isTraining}
                                waitingForConfirmation={waitingForConfirmation}
                                isSessionEnded={isSessionEnded}
                                isLastInterval={isLastInterval}
                                countdown={countdown}
                                formatTime={formatTime}
                                isGongSequencePlaying={isGongSequencePlaying}
                            />
                        </div>
                        <div className="flex-1 flex items-center justify-center mt-2">
                            <SessionTimeLeft
                                isTraining={isTraining}
                                sessionTimeLeft={sessionTimeLeft}
                                formatTime={formatTime}
                            />
                        </div>
                    </div>
                    <TrainingButtons
                        isTraining={isTraining}
                        waitingForConfirmation={waitingForConfirmation}
                        isGongSequencePlaying={isGongSequencePlaying}
                        isSessionEnded={isSessionEnded}
                        isLastInterval={isLastInterval}
                        startTraining={startTraining}
                        stopTraining={stopTraining}
                        handleStoodUp={handleStoodUp}
                    />
                </CardContent>
            </Card>
        </div>
    );
}

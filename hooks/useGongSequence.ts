"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { CONFIG as TRAINING_CONFIG } from "@/lib/config";
import { CONFIG as POMODORO_CONFIG } from "@/lib/config-pomodoro";
import { audioService } from "@/services/audioService";

/**
 * Interface defining the settings structure used for gong sequence configuration
 */
interface GongSettings {
    pause1Duration: number; // Pause duration after first gong in seconds
    pause2Duration: number; // Pause duration between second gongs in seconds
    isThirdSoundEnabled: boolean; // Whether to play the third sound in the sequence
}

/**
 * Interface for the return value of the useGongSequence hook
 */
interface UseGongSequenceReturn {
    // State
    isGongPlaying: boolean;
    isGongSequencePlaying: boolean;
    waitingForConfirmation: boolean;
    setWaitingForConfirmation: (value: boolean) => void;
    setIsGongSequencePlaying: (value: boolean) => void;

    // Functions
    initializeAudio: () => Promise<void>;
    playGongSequence: () => void;
    stopGong4: () => void;
    startGong4Loop: () => void;
    resetGongState: () => void;
}

/**
 * Custom hook for managing gong sequence playback
 * Handles initialization, playback, and state management for all gong sounds
 */
export function useGongSequence(
    isPomodoroMode: boolean,
    isActive: boolean,
    isSessionEnded: boolean
): UseGongSequenceReturn {
    // State for gong playback
    const [isGongPlaying, setIsGongPlaying] = useState(false);
    const [isGongSequencePlaying, setIsGongSequencePlaying] = useState(false);
    const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);
    const [audioInitialized, setAudioInitialized] = useState(false);

    // Reference for sequence timers
    const gongSequenceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Reference to track active state for use in callbacks
    const isActiveRef = useRef(isActive);

    // Update the ref whenever isActive changes to ensure callbacks have access to latest value
    useEffect(() => {
        isActiveRef.current = isActive;
    }, [isActive]);

    /**
     * Initializes all audio elements needed for the application
     * Uses the audioService to initialize audio elements
     */
    const initializeAudio = useCallback(async () => {
        try {
            console.log("Initializing audio via audioService...");

            // Only initialize if not already initialized
            if (!audioService.isInitialized()) {
                const CONFIG = isPomodoroMode
                    ? POMODORO_CONFIG
                    : TRAINING_CONFIG;
                await audioService.initialize(CONFIG.AUDIO_URLS);
            }

            setAudioInitialized(true);
            console.log("Audio elements initialized successfully");
        } catch (error) {
            console.error("Audio initialization failed:", error);
        }
    }, [isPomodoroMode]);

    /**
     * Stops the fourth gong sound (end of session sound)
     */
    const stopGong4 = useCallback(() => {
        console.log("Stopping gong4 sound");

        const gong4 = audioService.getGong("gong4");
        if (gong4) {
            audioService.stopAudio(gong4);
        } else {
            console.warn("Cannot stop gong4 - audio not available");
        }
    }, []);

    /**
     * Starts playing the fourth gong sound in a loop
     * Used to signal the end of a session or when waiting for user confirmation
     */
    const startGong4Loop = useCallback(() => {
        // Only start gong4 loop if we're active
        if (!isActiveRef.current) {
            console.log("Cannot start gong4 loop - inactive session");
            return;
        }

        // Don't start gong4 loop if it's already playing
        const gong4 = audioService.getGong("gong4");
        if (gong4 && gong4.paused === false) {
            console.log("Gong4 already playing, not starting again");
            return;
        }

        console.log("Starting gong4 loop");

        if (gong4) {
            audioService.startAudioLoop(gong4);
        } else {
            console.warn("Cannot start gong4 loop - audio not available");
        }
    }, []);

    /**
     * Plays the third gong sound in the sequence
     * Only plays if third sound is enabled in settings
     */
    const playThirdGong = useCallback(() => {
        // Always load the latest settings from localStorage directly
        const settingsKey = isPomodoroMode
            ? "pomodoroSettings"
            : "trainingSettings";
        let settings: GongSettings | null = null;

        try {
            const savedSettings = localStorage.getItem(settingsKey);
            if (savedSettings) {
                settings = JSON.parse(savedSettings);
            }
        } catch (error) {
            console.error("Error loading settings from localStorage:", error);
        }

        if (!settings) {
            console.error("No valid settings available");
            return;
        }

        const CONFIG = isPomodoroMode ? POMODORO_CONFIG : TRAINING_CONFIG;

        // Skip third sound if disabled or session is inactive
        if (!isActiveRef.current || !settings.isThirdSoundEnabled) {
            console.log("Skipping third gong (disabled or inactive session)");
            setWaitingForConfirmation(true);
            // Only start gong4 loop if we're waiting for confirmation
            if (isActiveRef.current) {
                startGong4Loop();
            }
            return;
        }

        console.log("Playing third gong sound");

        // Play the third gong sound
        const gong3 = audioService.getGong("gong3");
        if (gong3) {
            setIsGongPlaying(true);

            audioService
                .playAudio(gong3)
                .then(() => {
                    gong3.onended = () => {
                        if (isActiveRef.current) {
                            setIsGongPlaying(false);
                            setWaitingForConfirmation(true);
                            // Only start gong4 loop if we're waiting for confirmation
                            startGong4Loop();
                        }
                    };
                })
                .catch((error) => {
                    console.error("Third gong playback failed:", error);
                    if (isActiveRef.current) {
                        setIsGongPlaying(false);
                        setWaitingForConfirmation(true);
                        // Only start gong4 loop if we're waiting for confirmation
                        startGong4Loop();
                    }
                });
        } else {
            console.warn("Third gong audio not available, continuing sequence");
            setWaitingForConfirmation(true);
            // Only start gong4 loop if we're waiting for confirmation
            if (isActiveRef.current) {
                startGong4Loop();
            }
        }
    }, [isPomodoroMode, startGong4Loop]);

    /**
     * Plays the second gong sequence (5 repetitions)
     */
    const playSecondGongSequence = useCallback(() => {
        if (!isActiveRef.current) return;

        // Always load the latest settings from localStorage directly
        const settingsKey = isPomodoroMode
            ? "pomodoroSettings"
            : "trainingSettings";
        let settings: GongSettings | null = null;

        try {
            const savedSettings = localStorage.getItem(settingsKey);
            if (savedSettings) {
                settings = JSON.parse(savedSettings);
            }
        } catch (error) {
            console.error("Error loading settings from localStorage:", error);
        }

        if (!settings) {
            console.error("No valid settings available");
            return;
        }

        const CONFIG = isPomodoroMode ? POMODORO_CONFIG : TRAINING_CONFIG;

        // Play 5 repetitions of the second gong sound
        let count = 0;
        const playNextGong = () => {
            if (!isActiveRef.current) return;

            console.log(`Playing second gong sound (${count + 1}/5)`);

            const gong2 = audioService.getGong("gong2");
            if (gong2) {
                setIsGongPlaying(true);

                audioService
                    .playAudio(gong2)
                    .then(() => {
                        gong2.onended = () => {
                            if (isActiveRef.current) {
                                setIsGongPlaying(false);
                                count++;
                                if (count < 5) {
                                    // Schedule the next gong in the sequence
                                    gongSequenceTimerRef.current = setTimeout(
                                        playNextGong,
                                        (settings?.pause2Duration ||
                                            CONFIG.DEFAULT_PAUSE2_DURATION) *
                                            1000
                                    );
                                } else {
                                    // After 5 repetitions, add a pause before continuing
                                    console.log(
                                        "Fifth gong2 completed, adding pause before continuing"
                                    );
                                    gongSequenceTimerRef.current = setTimeout(
                                        () => {
                                            // After the pause, either play third sound or activate confirmation
                                            if (settings?.isThirdSoundEnabled) {
                                                playThirdGong();
                                            } else {
                                                setWaitingForConfirmation(true);
                                                // Only start gong4 loop if we're waiting for confirmation
                                                if (isActiveRef.current) {
                                                    startGong4Loop();
                                                }
                                            }
                                        },
                                        (settings?.pause1Duration ||
                                            CONFIG.DEFAULT_PAUSE1_DURATION) *
                                            1000
                                    );
                                }
                            }
                        };
                    })
                    .catch((error) => {
                        console.error(
                            `Second gong playback failed (${count + 1}/5):`,
                            error
                        );
                        if (isActiveRef.current) {
                            setIsGongPlaying(false);
                            count++;
                            if (count < 5) {
                                gongSequenceTimerRef.current = setTimeout(
                                    playNextGong,
                                    (settings?.pause2Duration ||
                                        CONFIG.DEFAULT_PAUSE2_DURATION) * 1000
                                );
                            } else {
                                // After 5 repetitions, add a pause before continuing
                                console.log(
                                    "Fifth gong2 completed, adding pause before continuing"
                                );
                                gongSequenceTimerRef.current = setTimeout(
                                    () => {
                                        // After the pause, either play third sound or activate confirmation
                                        if (settings?.isThirdSoundEnabled) {
                                            playThirdGong();
                                        } else {
                                            setWaitingForConfirmation(true);
                                            // Only start gong4 loop if we're waiting for confirmation
                                            if (isActiveRef.current) {
                                                startGong4Loop();
                                            }
                                        }
                                    },
                                    (settings?.pause1Duration ||
                                        CONFIG.DEFAULT_PAUSE1_DURATION) * 1000
                                );
                            }
                        }
                    });
            } else {
                console.warn(
                    `Second gong audio not available (${
                        count + 1
                    }/5), continuing sequence`
                );
                count++;
                if (count < 5) {
                    gongSequenceTimerRef.current = setTimeout(
                        playNextGong,
                        (settings?.pause2Duration ||
                            CONFIG.DEFAULT_PAUSE2_DURATION) * 1000
                    );
                } else {
                    // After 5 repetitions, add a pause before continuing
                    console.log(
                        "Fifth gong2 completed, adding pause before continuing"
                    );
                    gongSequenceTimerRef.current = setTimeout(() => {
                        // After the pause, either play third sound or activate confirmation
                        if (settings?.isThirdSoundEnabled) {
                            playThirdGong();
                        } else {
                            setWaitingForConfirmation(true);
                            // Only start gong4 loop if we're waiting for confirmation
                            if (isActiveRef.current) {
                                startGong4Loop();
                            }
                        }
                    }, (settings?.pause1Duration || CONFIG.DEFAULT_PAUSE1_DURATION) * 1000);
                }
            }
        };
        playNextGong();
    }, [isPomodoroMode, playThirdGong, startGong4Loop]);

    /**
     * Plays the first gong sound in the sequence
     */
    const playFirstGong = useCallback(() => {
        if (!isActiveRef.current) return;

        // Always load the latest settings from localStorage directly
        const settingsKey = isPomodoroMode
            ? "pomodoroSettings"
            : "trainingSettings";
        let settings: GongSettings | null = null;

        try {
            const savedSettings = localStorage.getItem(settingsKey);
            if (savedSettings) {
                settings = JSON.parse(savedSettings);
            }
        } catch (error) {
            console.error("Error loading settings from localStorage:", error);
        }

        if (!settings) {
            console.error("No valid settings available");
            return;
        }

        const CONFIG = isPomodoroMode ? POMODORO_CONFIG : TRAINING_CONFIG;

        // Play a random gong sound from the available options
        const randomGong = audioService.getRandomGong1();
        if (randomGong) {
            setIsGongPlaying(true);
            console.log("Playing first gong sound");

            audioService
                .playAudio(randomGong)
                .then(() => {
                    randomGong.onended = () => {
                        if (isActiveRef.current) {
                            setIsGongPlaying(false);
                            gongSequenceTimerRef.current = setTimeout(
                                playSecondGongSequence,
                                (settings?.pause1Duration ||
                                    CONFIG.DEFAULT_PAUSE1_DURATION) * 1000
                            );
                        }
                    };
                })
                .catch((error) => {
                    console.error("First gong playback failed:", error);
                    if (isActiveRef.current) {
                        setIsGongPlaying(false);
                        // Even if playback fails, continue with the sequence
                        gongSequenceTimerRef.current = setTimeout(
                            playSecondGongSequence,
                            (settings?.pause1Duration ||
                                CONFIG.DEFAULT_PAUSE1_DURATION) * 1000
                        );
                    }
                });
        } else {
            console.warn("No gong sound available, continuing with sequence");
            gongSequenceTimerRef.current = setTimeout(
                playSecondGongSequence,
                (settings?.pause1Duration || CONFIG.DEFAULT_PAUSE1_DURATION) *
                    1000
            );
        }
    }, [isPomodoroMode, playSecondGongSequence]);

    /**
     * Starts playing the complete gong sequence
     */
    const playGongSequence = useCallback(() => {
        console.log("playGongSequence called with state:", {
            isSessionEnded,
            isGongSequencePlaying,
            audioInitialized,
        });

        // Don't start a new gong sequence if one is already playing
        if (isGongSequencePlaying) {
            console.log(
                "Gong sequence already playing, not starting a new one"
            );
            return;
        }

        // Don't play if session is inactive
        if (!isActiveRef.current) {
            console.log("Not playing gong sequence - session is inactive");
            return;
        }

        // Make sure audio is initialized before playing
        if (!audioInitialized) {
            console.log("Audio not initialized, initializing now");
            initializeAudio()
                .then(() => {
                    console.log("Audio initialized, starting gong sequence");
                    setIsGongSequencePlaying(true);
                    playFirstGong();
                })
                .catch((error) => {
                    console.error("Failed to initialize audio:", error);
                    // Continue with sequence even if initialization fails
                    setIsGongSequencePlaying(true);
                    playFirstGong();
                });
        } else {
            setIsGongSequencePlaying(true);
            playFirstGong();
        }
    }, [
        isGongSequencePlaying,
        playFirstGong,
        audioInitialized,
        initializeAudio,
    ]);

    // Add an effect to try to initialize audio after user interaction
    useEffect(() => {
        const handleUserInteraction = () => {
            if (!audioInitialized) {
                console.log("User interaction detected, initializing audio");
                initializeAudio();
            }
        };

        // Add event listeners for common user interactions
        window.addEventListener("click", handleUserInteraction);
        window.addEventListener("touchstart", handleUserInteraction);
        window.addEventListener("keydown", handleUserInteraction);

        return () => {
            // Clean up event listeners
            window.removeEventListener("click", handleUserInteraction);
            window.removeEventListener("touchstart", handleUserInteraction);
            window.removeEventListener("keydown", handleUserInteraction);
        };
    }, [audioInitialized, initializeAudio]);

    /**
     * Resets all gong-related state
     * Used when stopping training or starting a new session
     */
    const resetGongState = useCallback(() => {
        // Clear any pending timers
        if (gongSequenceTimerRef.current) {
            clearTimeout(gongSequenceTimerRef.current);
            gongSequenceTimerRef.current = null;
        }

        // Stop all audio playback
        audioService.stopAllAudio();

        // Reset state
        setIsGongPlaying(false);
        setIsGongSequencePlaying(false);
        setWaitingForConfirmation(false);
    }, []);

    // Clean up timers and audio when component unmounts
    useEffect(() => {
        return () => {
            if (gongSequenceTimerRef.current) {
                clearTimeout(gongSequenceTimerRef.current);
            }

            // Stop all audio playback
            audioService.stopAllAudio();
        };
    }, []);

    return {
        // State
        isGongPlaying,
        isGongSequencePlaying,
        waitingForConfirmation,
        setWaitingForConfirmation,
        setIsGongSequencePlaying,

        // Functions
        initializeAudio,
        playGongSequence,
        stopGong4,
        startGong4Loop,
        resetGongState,
    };
}

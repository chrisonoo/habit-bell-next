"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { CONFIG as TRAINING_CONFIG } from "@/lib/config";
import { CONFIG as POMODORO_CONFIG } from "@/lib/config-pomodoro";

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

    // Audio references
    audioRefs: React.MutableRefObject<HTMLAudioElement[]>;
    audio2Ref: React.MutableRefObject<HTMLAudioElement | null>;
    audio3Ref: React.MutableRefObject<HTMLAudioElement | null>;
    audio4Ref: React.MutableRefObject<HTMLAudioElement | null>;

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

    // References to audio elements for playing gong sounds
    const audioRefs = useRef<HTMLAudioElement[]>([]);
    const audio2Ref = useRef<HTMLAudioElement | null>(null);
    const audio3Ref = useRef<HTMLAudioElement | null>(null);
    const audio4Ref = useRef<HTMLAudioElement | null>(null);
    const gongSequenceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Reference to track active state for use in callbacks
    const isActiveRef = useRef(isActive);

    // Update the ref whenever isActive changes to ensure callbacks have access to latest value
    useEffect(() => {
        isActiveRef.current = isActive;
    }, [isActive]);

    /**
     * Initializes all audio elements needed for the application
     * Preloads all gong sounds to ensure they can be played immediately when needed
     */
    const initializeAudio = useCallback(async () => {
        try {
            // Create audio elements for all gong sounds
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
        } catch (error) {
            console.error("Audio initialization failed:", error);
        }
    }, []);

    /**
     * Gets a random gong sound from the available options
     */
    const getRandomGong1 = useCallback(() => {
        const randomIndex = Math.floor(
            Math.random() * audioRefs.current.length
        );
        return audioRefs.current[randomIndex];
    }, []);

    /**
     * Stops the fourth gong sound (end of session sound)
     */
    const stopGong4 = useCallback(() => {
        if (audio4Ref.current) {
            audio4Ref.current.loop = false;
            audio4Ref.current.pause();
            audio4Ref.current.currentTime = 0;
        }
    }, []);

    /**
     * Starts playing the fourth gong sound in a loop
     * Used to signal the end of a session or when waiting for user confirmation
     */
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
            setWaitingForConfirmation(true);
            startGong4Loop();
            return;
        }

        // Play the third gong sound
        if (audio3Ref.current) {
            gongSequenceTimerRef.current = setTimeout(() => {
                if (
                    isActiveRef.current &&
                    settings &&
                    settings.isThirdSoundEnabled
                ) {
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
                                    // Schedule the next gong in the sequence
                                    gongSequenceTimerRef.current = setTimeout(
                                        playNextGong,
                                        (settings?.pause2Duration ||
                                            CONFIG.DEFAULT_PAUSE2_DURATION) *
                                            1000
                                    );
                                } else {
                                    // After 5 repetitions, either play third sound or activate confirmation
                                    if (settings?.isThirdSoundEnabled) {
                                        playThirdGong();
                                    } else {
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
                                    (settings?.pause2Duration ||
                                        CONFIG.DEFAULT_PAUSE2_DURATION) * 1000
                                );
                            } else {
                                if (settings?.isThirdSoundEnabled) {
                                    playThirdGong();
                                } else {
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
                        (settings?.pause2Duration ||
                            CONFIG.DEFAULT_PAUSE2_DURATION) * 1000
                    );
                } else {
                    if (settings?.isThirdSoundEnabled) {
                        playThirdGong();
                    } else {
                        setWaitingForConfirmation(true);
                        startGong4Loop();
                    }
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
                        gongSequenceTimerRef.current = setTimeout(
                            playSecondGongSequence,
                            (settings?.pause1Duration ||
                                CONFIG.DEFAULT_PAUSE1_DURATION) * 1000
                        );
                    }
                });
        } else {
            gongSequenceTimerRef.current = setTimeout(
                playSecondGongSequence,
                (settings?.pause1Duration || CONFIG.DEFAULT_PAUSE1_DURATION) *
                    1000
            );
        }
    }, [isPomodoroMode, getRandomGong1, playSecondGongSequence]);

    /**
     * Starts playing the complete gong sequence
     */
    const playGongSequence = useCallback(() => {
        console.log("playGongSequence called with state:", {
            isSessionEnded,
            isGongSequencePlaying,
        });

        if (!isActiveRef.current || isSessionEnded) {
            console.log(
                "Not playing gong sequence - session is ending or inactive"
            );
            return;
        }

        setIsGongSequencePlaying(true);
        // Start playing the sound sequence
        playFirstGong();
    }, [isSessionEnded, playFirstGong]);

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
        };
    }, []);

    return {
        // State
        isGongPlaying,
        isGongSequencePlaying,
        waitingForConfirmation,
        setWaitingForConfirmation,
        setIsGongSequencePlaying,

        // Audio references
        audioRefs,
        audio2Ref,
        audio3Ref,
        audio4Ref,

        // Functions
        initializeAudio,
        playGongSequence,
        stopGong4,
        startGong4Loop,
        resetGongState,
    };
}

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
    const [audioInitialized, setAudioInitialized] = useState(false);

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
     * Creates audio elements and sets up event handlers without trying to play them
     */
    const initializeAudio = useCallback(async () => {
        try {
            console.log("Initializing audio elements...");

            // Create audio elements for all gong sounds if they don't exist yet
            if (audioRefs.current.length === 0) {
                audioRefs.current = TRAINING_CONFIG.AUDIO_URLS.GONG1.map(
                    (url) => {
                        const audio = new Audio(url);
                        audio.preload = "auto";
                        return audio;
                    }
                );
            }

            if (!audio2Ref.current) {
                audio2Ref.current = new Audio(TRAINING_CONFIG.AUDIO_URLS.GONG2);
                audio2Ref.current.preload = "auto";
            }

            if (!audio3Ref.current) {
                audio3Ref.current = new Audio(TRAINING_CONFIG.AUDIO_URLS.GONG3);
                audio3Ref.current.preload = "auto";
            }

            if (!audio4Ref.current) {
                audio4Ref.current = new Audio(TRAINING_CONFIG.AUDIO_URLS.GONG4);
                audio4Ref.current.preload = "auto";
            }

            setAudioInitialized(true);
            console.log("Audio elements initialized successfully");
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
        console.log("Stopping gong4 sound");

        if (audio4Ref.current) {
            try {
                audio4Ref.current.loop = false;
                audio4Ref.current.pause();
                audio4Ref.current.currentTime = 0;
            } catch (error) {
                console.error("Error stopping gong4:", error);
            }
        } else {
            console.warn("Cannot stop gong4 - audio not available");
        }
    }, []);

    /**
     * Starts playing the fourth gong sound in a loop
     * Used to signal the end of a session or when waiting for user confirmation
     */
    const startGong4Loop = useCallback(() => {
        if (!isActiveRef.current || !audio4Ref.current) {
            console.log(
                "Cannot start gong4 loop - inactive session or audio not available"
            );
            return;
        }

        console.log("Starting gong4 loop");

        const playGong4 = () => {
            if (!isActiveRef.current || !audio4Ref.current) return;

            // Reset the audio to ensure it plays from the beginning
            audio4Ref.current.currentTime = 0;

            audio4Ref.current.play().catch((error) => {
                console.error("Gong4 playback failed:", error);
                // Try again after a short delay if playback fails
                setTimeout(() => {
                    if (isActiveRef.current && audio4Ref.current) {
                        audio4Ref.current.play().catch((e) => {
                            console.error("Retry gong4 playback failed:", e);
                        });
                    }
                }, 1000);
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
            console.log("Skipping third gong (disabled or inactive session)");
            setWaitingForConfirmation(true);
            startGong4Loop();
            return;
        }

        console.log("Playing third gong sound");

        // Play the third gong sound
        if (audio3Ref.current) {
            gongSequenceTimerRef.current = setTimeout(() => {
                if (
                    isActiveRef.current &&
                    settings &&
                    settings.isThirdSoundEnabled
                ) {
                    setIsGongPlaying(true);

                    // Reset the audio to ensure it plays from the beginning
                    audio3Ref.current!.currentTime = 0;

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
                    console.log("Third gong conditions changed, skipping");
                    setWaitingForConfirmation(true);
                    startGong4Loop();
                }
            }, (settings.pause1Duration || CONFIG.DEFAULT_PAUSE1_DURATION) * 1000);
        } else {
            console.warn("Third gong audio not available, continuing sequence");
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

            console.log(`Playing second gong sound (${count + 1}/5)`);

            if (audio2Ref.current) {
                setIsGongPlaying(true);

                // Reset the audio to ensure it plays from the beginning
                audio2Ref.current.currentTime = 0;

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
            console.log("Playing first gong sound");

            // Reset the audio to ensure it plays from the beginning
            randomGong.currentTime = 0;

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
    }, [isPomodoroMode, getRandomGong1, playSecondGongSequence]);

    /**
     * Starts playing the complete gong sequence
     */
    const playGongSequence = useCallback(() => {
        console.log("playGongSequence called with state:", {
            isSessionEnded,
            isGongSequencePlaying,
            audioInitialized,
        });

        if (!isActiveRef.current || isSessionEnded) {
            console.log(
                "Not playing gong sequence - session is ending or inactive"
            );
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
    }, [isSessionEnded, playFirstGong, audioInitialized, initializeAudio]);

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

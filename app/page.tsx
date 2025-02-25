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

/**
 * Interface defining the settings structure used for training and pomodoro modes
 * Contains essential parameters for controlling the session behavior
 */
interface Settings {
    sessionDuration: number; // Duration of the session in minutes
    minInterval: number; // Minimum interval between gongs in seconds
    maxInterval: number; // Maximum interval between gongs in seconds
    pause1Duration: number; // Pause duration after first gong in seconds
    pause2Duration: number; // Pause duration between second gongs in seconds
    isThirdSoundEnabled: boolean; // Whether to play the third sound in the sequence
}

/**
 * Main HomePage component for the habit bell application
 * Manages the training session state, audio playback, and user interactions
 * Supports both training and pomodoro modes with different timing configurations
 */
export default function HomePage() {
    // Get configuration settings from the active config hook
    const {
        activeConfig,
        isPomodoroMode,
        isReady,
        currentSettings,
        loadSettings,
    } = useActiveConfig();
    const CONFIG = isPomodoroMode ? POMODORO_CONFIG : TRAINING_CONFIG;

    // State variables for managing the training session
    const [isLoading, setIsLoading] = useState(true); // Whether settings are still loading
    const [isActive, setIsActive] = useState(false); // Whether the session is active
    const [isTraining, setIsTraining] = useState(false); // Whether training is in progress
    const [countdown, setCountdown] = useState(0); // Countdown to next gong in seconds
    const [currentInterval, setCurrentInterval] = useState(0); // Current interval duration in seconds
    const [isGongPlaying, setIsGongPlaying] = useState(false); // Whether a gong sound is currently playing
    const [sessionTimeLeft, setSessionTimeLeft] = useState(0); // Time left in the session in seconds
    const [isSessionEnded, setIsSessionEnded] = useState(false); // Whether the session has ended
    const [waitingForConfirmation, setWaitingForConfirmation] = useState(false); // Whether waiting for user to confirm standing up
    const [isGongSequencePlaying, setIsGongSequencePlaying] = useState(false); // Whether the gong sequence is playing
    const [audioFailed, setAudioFailed] = useState(false); // Whether the first gong audio failed to load
    const [audioFailed2, setAudioFailed2] = useState(false); // Whether the second gong audio failed to load
    const [audioFailed3, setAudioFailed3] = useState(false); // Whether the third gong audio failed to load

    // References to audio elements for playing gong sounds
    const audioRefs = useRef<HTMLAudioElement[]>([]); // Array of first gong sound options
    const audio2Ref = useRef<HTMLAudioElement | null>(null); // Reference to second gong sound
    const audio3Ref = useRef<HTMLAudioElement | null>(null); // Reference to third gong sound
    const audio4Ref = useRef<HTMLAudioElement | null>(null); // Reference to fourth gong sound (end of session)
    const sessionTimerRef = useRef<NodeJS.Timeout | null>(null); // Timer for tracking session time
    const countdownTimerRef = useRef<NodeJS.Timeout | null>(null); // Timer for countdown to next gong
    const gongSequenceTimerRef = useRef<NodeJS.Timeout | null>(null); // Timer for gong sequence playback

    const isActiveRef = useRef(isActive); // Ref to track active state for use in callbacks

    // Log initial settings when page loads
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

    // Update the ref whenever isActive changes to ensure callbacks have access to latest value
    useEffect(() => {
        isActiveRef.current = isActive;
    }, [isActive]);

    // Set loading state to false once settings are loaded
    useEffect(() => {
        if (currentSettings) {
            setIsLoading(false);
        }
    }, [currentSettings]);

    // Initialize audio elements when component mounts
    useEffect(() => {
        /**
         * Initializes all audio elements needed for the application
         * Preloads all gong sounds to ensure they can be played immediately when needed
         * Sets error states if audio initialization fails
         */
        const initAudio = async () => {
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
        /**
         * This useEffect handles the countdown timer to the next gong
         * It manages the countdown logic and triggers the gong sequence when countdown reaches zero
         * Also handles the end-of-session behavior when the session time is up
         */

        // Don't do anything if the session has ended
        if (isSessionEnded) {
            // Ensure countdown is reset to 0 when session is ending
            if (countdown > 0) {
                setCountdown(0);
            }
            return;
        }

        if (isActive && isTraining && countdown > 0 && !isSessionEnded) {
            // If countdown > 0, continue counting down
            countdownTimerRef.current = setTimeout(() => {
                if (isActiveRef.current && !isSessionEnded) {
                    setCountdown(countdown - 1);
                }
            }, 1000);
        } else if (
            isActive &&
            isTraining &&
            countdown === 0 &&
            !isSessionEnded
        ) {
            // If countdown = 0 and session has not ended,
            // play the gong sequence
            playGongSequence();
        } else if (
            isActive &&
            isTraining &&
            countdown === 0 &&
            isSessionEnded
        ) {
            // If session has ended and countdown reached zero,
            // enable the "Finish Training" button and play the end-of-training sound
            setWaitingForConfirmation(true);
            // Start playing gong4 in a loop to signal the end of training
            if (audio4Ref.current) {
                audio4Ref.current.loop = true;
                audio4Ref.current.currentTime = 0;
                audio4Ref.current.play().catch((error) => {
                    console.error("Gong4 playback failed:", error);
                });
            }
        }

        // Cleanup - clear timer when component unmounts or dependencies change
        return () => {
            if (countdownTimerRef.current)
                clearTimeout(countdownTimerRef.current);
        };
    }, [isActive, isTraining, countdown, isSessionEnded]);

    useEffect(() => {
        /**
         * This useEffect handles the session timer countdown
         * It tracks the overall session time and triggers the end-of-session behavior
         * when the session duration is reached
         */

        // Don't do anything if the session has already ended
        if (isSessionEnded) {
            return;
        }

        if (isActive && isTraining && !isGongSequencePlaying) {
            sessionTimerRef.current = setTimeout(() => {
                if (isActiveRef.current && !isSessionEnded) {
                    if (sessionTimeLeft > 0) {
                        // Decrement session time left every second
                        setSessionTimeLeft(sessionTimeLeft - 1);
                    } else if (!isSessionEnded) {
                        // When the session time runs out:
                        // Batch state updates to prevent UI flicker
                        // IMPORTANT: Reset countdown to 0 BEFORE setting isSessionEnded to true
                        // This prevents the "Next gong in:" message from flashing
                        setCountdown(0);

                        // Now set isSessionEnded to true
                        setIsSessionEnded(true);

                        // If countdown was already at 0, enable the "Finish Training" button
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

        // Cleanup - clear timer when component unmounts or dependencies change
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

    /**
     * Starts a new training session
     * 1. Clears all timers and stops audio playback
     * 2. Loads the latest settings from localStorage
     * 3. Validates settings and initializes the session state
     * 4. Sets the first interval
     */
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
        setWaitingForConfirmation(false);
        setIsGongSequencePlaying(false);
        setIsGongPlaying(false);
        setCountdown(0);
        setCurrentInterval(0);

        // Set new interval
        setNewInterval();
    }, [isPomodoroMode, currentSettings, activeConfig, loadSettings]);

    /**
     * Stops the current training session
     * 1. Clears all timers to prevent further state updates
     * 2. Stops all audio playback
     * 3. Resets all training state variables
     */
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

        // CRITICAL FIX: Reset all training state in a specific order to prevent UI flicker
        // First ensure countdown is 0 and isSessionEnded is false before changing isTraining
        // This prevents any possibility of the "Next gong in:" message appearing
        setCountdown(0);
        setCurrentInterval(0);
        setIsSessionEnded(false);
        setWaitingForConfirmation(false);
        setIsGongPlaying(false);
        setIsGongSequencePlaying(false);

        // Only after all other states are reset, change the main training state
        // This ensures that when isTraining changes, all other states are already in their final state
        setIsActive(false);
        setIsTraining(false);
        setSessionTimeLeft(0);
    }, []);

    /**
     * Sets a new random interval for the next gong
     * 1. Checks if the session has ended before setting a new interval
     * 2. Loads the latest settings from localStorage
     * 3. Generates a random interval within the min/max range
     * 4. Updates the countdown and interval state
     */
    const setNewInterval = useCallback(() => {
        // Log when this function is called to help with debugging
        console.log("setNewInterval called with state:", {
            isSessionEnded,
            waitingForConfirmation,
            countdown,
        });

        // Early return if the session is ending or has ended
        // This is a critical check to prevent setting a new interval when the session is ending
        if (isSessionEnded) {
            console.log("Session ended, not setting new interval");
            // Activate the "Finish Training" button
            setWaitingForConfirmation(true);
            // Start playing gong4 in a loop to signal the end of training
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
        if (isSessionEnded) {
            console.log("Session state changed, not setting new interval");
            return;
        }

        // Generate a random interval between min and max values
        const newInterval = Math.floor(
            Math.random() * (settings.maxInterval - settings.minInterval + 1) +
                settings.minInterval
        );
        console.log("Generated new interval:", newInterval);

        // Update state with the new interval
        setCurrentInterval(newInterval);
        setCountdown(newInterval);
        setWaitingForConfirmation(false);
    }, [
        isPomodoroMode,
        currentSettings,
        isSessionEnded,
        setWaitingForConfirmation,
        countdown,
    ]);

    /**
     * Starts playing the fourth gong sound in a loop
     * Used to indicate that the user should confirm standing up
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
     * Plays the third gong sound if enabled in settings
     * After playing, activates the confirmation button and starts the gong4 loop
     */
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

        // Skip third sound if disabled or session is inactive
        if (!isActiveRef.current || !settings.isThirdSoundEnabled) {
            setWaitingForConfirmation(true);
            startGong4Loop();
            return;
        }

        // Play the third gong sound
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

    /**
     * Stops the looping fourth gong sound
     * Called when the user confirms standing up
     */
    const stopGong4 = useCallback(() => {
        if (audio4Ref.current) {
            audio4Ref.current.loop = false;
            audio4Ref.current.pause();
            audio4Ref.current.currentTime = 0;
        }
    }, []);

    /**
     * Handles the user's confirmation that they stood up
     * Called when the user clicks the "Let's Go!" or "Finish Training" button
     * 1. Stops the looping gong4 sound
     * 2. If session has ended, stops the training completely
     * 3. Otherwise, sets a new interval for the next gong
     */
    const handleStoodUp = useCallback(() => {
        // Log when this function is called to help with debugging
        console.log("handleStoodUp called with state:", {
            isTraining,
            waitingForConfirmation,
            isSessionEnded,
            countdown,
        });

        // This function is called when the user clicks the "Let's go!" or "Finish Training" button
        // The button is only active when waitingForConfirmation or isSessionEnded is true
        if (isTraining && (waitingForConfirmation || isSessionEnded)) {
            // CRITICAL FIX: Immediately ensure countdown is 0 and isSessionEnded is true
            // This prevents any possibility of the "Next gong in:" message appearing
            if (isSessionEnded) {
                // Force these states immediately to prevent any UI flicker
                setCountdown(0);

                // Stop the gong4 sound (looping sound)
                stopGong4();

                // Use React's batch update to ensure all state changes happen together
                // This is the key fix - we're manually batching these critical state updates
                // to ensure they're processed together before any rendering occurs
                setTimeout(() => {
                    stopTraining();
                }, 0);
            } else {
                // For normal interval progression (not at session end)
                // Stop the gong4 sound (looping sound)
                stopGong4();
                setIsGongSequencePlaying(false);

                // Double-check that we're not in the process of ending the session
                if (!isSessionEnded) {
                    console.log("Setting new interval");
                    // Set a new interval
                    setNewInterval();
                } else {
                    console.log("Not setting new interval - session is ending");
                    // If we somehow got here with isSessionEnded true,
                    // stop the training instead of setting a new interval
                    stopTraining();
                }
            }
        }
    }, [
        isTraining,
        waitingForConfirmation,
        isSessionEnded,
        stopTraining,
        setNewInterval,
        stopGong4,
        setIsGongSequencePlaying,
        countdown,
    ]);

    /**
     * Plays the sequence of gong sounds when the countdown reaches zero
     * 1. Checks if the session has ended before playing
     * 2. Sets the gong sequence playing flag
     * 3. Starts the sequence with the first gong
     */
    const playGongSequence = useCallback(() => {
        // Log when this function is called to help with debugging
        console.log("playGongSequence called with state:", {
            isSessionEnded,
        });

        // Function that plays the sound sequence (gong1, gong2, gong3, gong4)
        // Called when countdown reaches 0
        // Early return if the session is ending or has ended
        if (!isActiveRef.current || isSessionEnded) {
            console.log(
                "Not playing gong sequence - session is ending or inactive"
            );
            return;
        }

        // Set flag that the sound sequence is playing
        setIsGongSequencePlaying(true);

        // Ensure countdown is set to 0
        setCountdown(0);

        // Clear the session timer when gong sequence starts
        if (sessionTimerRef.current) {
            clearTimeout(sessionTimerRef.current);
        }

        // Final check before playing the gong sequence
        // This ensures we don't play the gong sequence if the session state changed
        if (isSessionEnded) {
            console.log("Session state changed, not playing gong sequence");
            setIsGongSequencePlaying(false);
            return;
        }

        // Start playing the sound sequence
        playFirstGong();
    }, [setCountdown, isSessionEnded]);

    /**
     * Returns a random gong sound from the available options
     * Used to add variety to the first gong sound
     */
    const getRandomGong1 = useCallback(() => {
        const randomIndex = Math.floor(
            Math.random() * audioRefs.current.length
        );
        return audioRefs.current[randomIndex];
    }, []);

    /**
     * Plays the first gong in the sequence
     * After playing, schedules the second gong sequence
     */
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

    /**
     * Plays the second part of the gong sequence
     * Plays 5 repetitions of the second gong sound with pauses in between
     * After completion, either plays the third gong or activates the confirmation button
     */
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
                                        (settings.pause2Duration ||
                                            CONFIG.DEFAULT_PAUSE2_DURATION) *
                                            1000
                                    );
                                } else {
                                    // After 5 repetitions, either play third sound or activate confirmation
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

    /**
     * Plays a test gong sound for the settings page
     * @param gongNumber - Which gong sound to play (1, 2, or 3)
     */
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

    /**
     * Formats a time in seconds to a human-readable string
     * For times less than a minute, shows only seconds
     * For times of a minute or more, shows minutes:seconds format
     *
     * @param seconds - The time in seconds to format
     * @returns Formatted time string (e.g., "45s" or "2:30")
     */
    const formatTime = useCallback((seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        if (minutes === 0) {
            return `${remainingSeconds}s`;
        }
        return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    }, []);

    /**
     * Type guard to validate if an object conforms to the Settings interface
     * Checks that all required properties exist and have the correct types
     *
     * @param obj - The object to validate
     * @returns Boolean indicating whether the object is a valid Settings object
     */
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

    // Show loading state while settings are being loaded
    if (isLoading) {
        return <div>Loading settings...</div>;
    }

    // Main component render
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
                        {/* Show clock icon and mode indicator when not in training */}
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
                            {/* Display current training status */}
                            <TrainingStatus
                                isTraining={isTraining}
                                waitingForConfirmation={waitingForConfirmation}
                                isSessionEnded={isSessionEnded}
                                countdown={countdown}
                                formatTime={formatTime}
                                isGongSequencePlaying={isGongSequencePlaying}
                            />
                        </div>
                        <div className="flex-1 flex items-center justify-center mt-2">
                            {/* Display remaining session time */}
                            <SessionTimeLeft
                                isTraining={isTraining}
                                sessionTimeLeft={sessionTimeLeft}
                                formatTime={formatTime}
                            />
                        </div>
                    </div>
                    {/* Display training control buttons */}
                    <TrainingButtons
                        isTraining={isTraining}
                        waitingForConfirmation={waitingForConfirmation}
                        isGongSequencePlaying={isGongSequencePlaying}
                        isSessionEnded={isSessionEnded}
                        startTraining={startTraining}
                        stopTraining={stopTraining}
                        handleStoodUp={handleStoodUp}
                    />
                </CardContent>
            </Card>
        </div>
    );
}

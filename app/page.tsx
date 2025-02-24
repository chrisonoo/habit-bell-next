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

interface Settings {
    sessionDuration: number;
    minInterval: number;
    maxInterval: number;
    pause1Duration: number;
    pause2Duration: number;
    isThirdSoundEnabled: boolean;
}

export default function HomePage() {
    const { activeConfig, isPomodoroMode, isReady } = useActiveConfig();
    const CONFIG = isPomodoroMode ? POMODORO_CONFIG : TRAINING_CONFIG;

    // Initialize with loading state
    const [isLoading, setIsLoading] = useState(true);
    const [settings, setSettings] = useState<Settings | null>(null);
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
    const [isThirdSoundEnabled, setIsThirdSoundEnabled] = useState(false);
    const [audioFailed, setAudioFailed] = useState(false);
    const [audioFailed2, setAudioFailed2] = useState(false);
    const [audioFailed3, setAudioFailed3] = useState(false);

    // Initialize these with null and set them after loading settings
    const [pause1Duration, setPause1Duration] = useState<number>(0);
    const [pause2Duration, setPause2Duration] = useState<number>(0);
    const [sessionDuration, setSessionDuration] = useState<number>(0);
    const [minInterval, setMinInterval] = useState<number>(0);
    const [maxInterval, setMaxInterval] = useState<number>(0);

    const audioRefs = useRef<HTMLAudioElement[]>([]);
    const audio2Ref = useRef<HTMLAudioElement | null>(null);
    const audio3Ref = useRef<HTMLAudioElement | null>(null);
    const audio4Ref = useRef<HTMLAudioElement | null>(null);
    const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
    const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
    const gongSequenceTimerRef = useRef<NodeJS.Timeout | null>(null);

    const isActiveRef = useRef(isActive);
    const isThirdSoundEnabledRef = useRef(isThirdSoundEnabled);

    useEffect(() => {
        isActiveRef.current = isActive;
    }, [isActive]);

    useEffect(() => {
        isThirdSoundEnabledRef.current = isThirdSoundEnabled;
        console.log("Third sound enabled:", isThirdSoundEnabled); // Debug log
    }, [isThirdSoundEnabled]);

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
        if (isActive && isTraining && countdown > 0) {
            countdownTimerRef.current = setTimeout(() => {
                if (isActiveRef.current) {
                    setCountdown(countdown - 1);
                }
            }, 1000);
        } else if (isActive && isTraining && countdown === 0) {
            playGongSequence();
        }
        return () => {
            if (countdownTimerRef.current)
                clearTimeout(countdownTimerRef.current);
        };
    }, [isActive, isTraining, countdown]);

    useEffect(() => {
        if (isActive && isTraining) {
            sessionTimerRef.current = setTimeout(() => {
                if (isActiveRef.current) {
                    if (sessionTimeLeft > 0) {
                        setSessionTimeLeft(sessionTimeLeft - 1);
                    } else if (!isSessionEnded) {
                        setIsSessionEnded(true);
                        setIsLastInterval(true);
                    }
                }
            }, 1000);
        }
        return () => {
            if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current);
        };
    }, [isActive, isTraining, sessionTimeLeft, isSessionEnded]);

    const startTraining = useCallback(() => {
        setIsActive(true);
        setIsTraining(true);
        setSessionTimeLeft(sessionDuration * 60);
        setIsSessionEnded(false);
        setIsLastInterval(false);
        setNewInterval();
    }, [sessionDuration]);

    const stopTraining = useCallback(() => {
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

        // Clear all timers
        if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current);
        if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current);
        if (gongSequenceTimerRef.current)
            clearTimeout(gongSequenceTimerRef.current);
    }, []);

    const setNewInterval = useCallback(() => {
        const newInterval = Math.floor(
            Math.random() * (maxInterval - minInterval + 1) + minInterval
        );
        setCurrentInterval(newInterval);
        setCountdown(newInterval);
        setWaitingForConfirmation(false);
    }, [maxInterval, minInterval]);

    const playThirdGong = useCallback(() => {
        if (!isActiveRef.current || !isThirdSoundEnabledRef.current) {
            setIsGongSequencePlaying(false);
            startGong4Loop();
            return;
        }
        if (audio3Ref.current) {
            gongSequenceTimerRef.current = setTimeout(() => {
                if (isActiveRef.current && isThirdSoundEnabledRef.current) {
                    setIsGongPlaying(true);
                    audio3Ref
                        .current!.play()
                        .then(() => {
                            audio3Ref.current!.onended = () => {
                                if (isActiveRef.current) {
                                    setIsGongPlaying(false);
                                    setIsGongSequencePlaying(false);
                                    startGong4Loop();
                                }
                            };
                        })
                        .catch((error) => {
                            console.error("Third gong playback failed:", error);
                            if (isActiveRef.current) {
                                setIsGongPlaying(false);
                                setIsGongSequencePlaying(false);
                                startGong4Loop();
                            }
                        });
                } else {
                    setIsGongSequencePlaying(false);
                    startGong4Loop();
                }
            }, pause1Duration * 1000);
        } else {
            setIsGongSequencePlaying(false);
            startGong4Loop();
        }
    }, [pause1Duration]);

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

    const stopGong4 = useCallback(() => {
        if (audio4Ref.current) {
            audio4Ref.current.loop = false;
            audio4Ref.current.pause();
            audio4Ref.current.currentTime = 0;
        }
    }, []);

    const handleStoodUp = useCallback(() => {
        if (isTraining && waitingForConfirmation) {
            stopGong4();
            if (isLastInterval) {
                stopTraining();
            } else {
                setNewInterval();
            }
        }
    }, [
        isTraining,
        waitingForConfirmation,
        isLastInterval,
        stopTraining,
        setNewInterval,
        stopGong4,
    ]);

    const playGongSequence = useCallback(() => {
        if (!isActiveRef.current) return;
        setWaitingForConfirmation(true);
        setIsGongSequencePlaying(true);
        playFirstGong();
    }, []);

    const getRandomGong1 = useCallback(() => {
        const randomIndex = Math.floor(
            Math.random() * audioRefs.current.length
        );
        return audioRefs.current[randomIndex];
    }, []);

    const playFirstGong = useCallback(() => {
        if (!isActiveRef.current) return;
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
                                pause1Duration * 1000
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
                            pause1Duration * 1000
                        );
                    }
                });
        } else {
            gongSequenceTimerRef.current = setTimeout(
                playSecondGongSequence,
                pause1Duration * 1000
            );
        }
    }, [pause1Duration, getRandomGong1]);

    const playSecondGongSequence = useCallback(() => {
        if (!isActiveRef.current) return;
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
                                        pause2Duration * 1000
                                    );
                                } else {
                                    if (isThirdSoundEnabledRef.current) {
                                        playThirdGong();
                                    } else {
                                        setIsGongSequencePlaying(false);
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
                                    pause2Duration * 1000
                                );
                            } else {
                                if (isThirdSoundEnabledRef.current) {
                                    playThirdGong();
                                } else {
                                    setIsGongSequencePlaying(false);
                                }
                            }
                        }
                    });
            } else {
                count++;
                if (count < 5) {
                    gongSequenceTimerRef.current = setTimeout(
                        playNextGong,
                        pause2Duration * 1000
                    );
                } else {
                    if (isThirdSoundEnabledRef.current) {
                        playThirdGong();
                    } else {
                        setIsGongSequencePlaying(false);
                    }
                }
            }
        };
        playNextGong();
    }, [pause2Duration]);

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

    // Load settings effect
    useEffect(() => {
        if (
            typeof window !== "undefined" &&
            CONFIG &&
            isReady &&
            activeConfig
        ) {
            try {
                const config = JSON.parse(activeConfig) as Settings;
                console.log("Loading settings from activeConfig:", config);

                // Update all settings states
                setSettings(config);
                setSessionDuration(config.sessionDuration);
                setMinInterval(config.minInterval);
                setMaxInterval(config.maxInterval);
                setPause1Duration(config.pause1Duration);
                setPause2Duration(config.pause2Duration);
                setIsThirdSoundEnabled(config.isThirdSoundEnabled);

                console.log("Final state values:", {
                    sessionDuration: config.sessionDuration,
                    minInterval: config.minInterval,
                    maxInterval: config.maxInterval,
                    pause1Duration: config.pause1Duration,
                    pause2Duration: config.pause2Duration,
                    isThirdSoundEnabled: config.isThirdSoundEnabled,
                });

                setIsLoading(false);
            } catch (error) {
                console.error("Error parsing activeConfig:", error);
                // Use default values from CONFIG if parsing fails
                const defaultSettings: Settings = {
                    sessionDuration: CONFIG.DEFAULT_SESSION_DURATION,
                    minInterval: CONFIG.DEFAULT_MIN_INTERVAL,
                    maxInterval: CONFIG.DEFAULT_MAX_INTERVAL,
                    pause1Duration: CONFIG.DEFAULT_PAUSE1_DURATION,
                    pause2Duration: CONFIG.DEFAULT_PAUSE2_DURATION,
                    isThirdSoundEnabled: CONFIG.DEFAULT_THIRD_SOUND_ENABLED,
                };
                setSettings(defaultSettings);
                setSessionDuration(defaultSettings.sessionDuration);
                setMinInterval(defaultSettings.minInterval);
                setMaxInterval(defaultSettings.maxInterval);
                setPause1Duration(defaultSettings.pause1Duration);
                setPause2Duration(defaultSettings.pause2Duration);
                setIsThirdSoundEnabled(defaultSettings.isThirdSoundEnabled);
                setIsLoading(false);
            }
        }
    }, [isPomodoroMode, CONFIG, activeConfig, isReady]);

    // Add logging to resetToDefaults
    const resetToDefaults = useCallback(() => {
        console.log("Resetting to defaults with CONFIG:", CONFIG);
        const defaultSettings = {
            sessionDuration: CONFIG.DEFAULT_SESSION_DURATION,
            minInterval: CONFIG.DEFAULT_MIN_INTERVAL,
            maxInterval: CONFIG.DEFAULT_MAX_INTERVAL,
            pause1Duration: CONFIG.DEFAULT_PAUSE1_DURATION,
            pause2Duration: CONFIG.DEFAULT_PAUSE2_DURATION,
            isThirdSoundEnabled: CONFIG.DEFAULT_THIRD_SOUND_ENABLED,
        };

        console.log("New default settings:", defaultSettings);

        // Update all states
        setSettings(defaultSettings);
        setSessionDuration(defaultSettings.sessionDuration);
        setMinInterval(defaultSettings.minInterval);
        setMaxInterval(defaultSettings.maxInterval);
        setPause1Duration(defaultSettings.pause1Duration);
        setPause2Duration(defaultSettings.pause2Duration);
        setIsThirdSoundEnabled(defaultSettings.isThirdSoundEnabled);

        // Save settings using localStorage
        if (typeof window !== "undefined") {
            const settingsKey = isPomodoroMode
                ? "pomodoroSettings"
                : "trainingSettings";
            console.log(
                "Saving default settings to localStorage key:",
                settingsKey
            );
            localStorage.setItem(settingsKey, JSON.stringify(defaultSettings));
            console.log(
                "Verification - saved settings:",
                localStorage.getItem(settingsKey)
            );
        }
    }, [CONFIG, isPomodoroMode]);

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
                                <TrainingClockIcon />
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
                        startTraining={startTraining}
                        stopTraining={stopTraining}
                        handleStoodUp={handleStoodUp}
                    />
                </CardContent>
            </Card>
        </div>
    );
}

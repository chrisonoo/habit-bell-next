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
        if (!currentSettings) return;

        // Reload current settings based on active mode and wait for them to be loaded
        loadSettings(activeConfig).then((settings) => {
            console.log("Starting training with values:", settings);
            console.log(
                "Active mode:",
                isPomodoroMode ? "pomodoro" : "training"
            );

            // Validate values before starting
            if (
                settings.sessionDuration <= 0 ||
                settings.minInterval <= 0 ||
                settings.maxInterval <= 0
            ) {
                console.error("Invalid training values");
                return;
            }

            setIsActive(true);
            setIsTraining(true);
            setSessionTimeLeft(settings.sessionDuration * 60);
            setIsSessionEnded(false);
            setIsLastInterval(false);
            setNewInterval();
        });
    }, [currentSettings, isPomodoroMode, activeConfig, loadSettings]);

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
        if (!currentSettings) return;

        console.log("Setting new interval with:", {
            minInterval: currentSettings.minInterval,
            maxInterval: currentSettings.maxInterval,
        });

        if (
            currentSettings.minInterval <= 0 ||
            currentSettings.maxInterval <= 0 ||
            currentSettings.maxInterval < currentSettings.minInterval
        ) {
            console.error("Invalid interval values:", {
                minInterval: currentSettings.minInterval,
                maxInterval: currentSettings.maxInterval,
            });
            return;
        }

        const newInterval = Math.floor(
            Math.random() *
                (currentSettings.maxInterval -
                    currentSettings.minInterval +
                    1) +
                currentSettings.minInterval
        );
        console.log("Generated new interval:", newInterval);

        setCurrentInterval(newInterval);
        setCountdown(newInterval);
        setWaitingForConfirmation(false);
    }, [currentSettings]);

    const playThirdGong = useCallback(() => {
        if (!isActiveRef.current || !currentSettings?.isThirdSoundEnabled) {
            setIsGongSequencePlaying(false);
            startGong4Loop();
            return;
        }
        if (audio3Ref.current) {
            gongSequenceTimerRef.current = setTimeout(() => {
                if (
                    isActiveRef.current &&
                    currentSettings?.isThirdSoundEnabled
                ) {
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
            }, (currentSettings?.pause1Duration || CONFIG.DEFAULT_PAUSE1_DURATION) * 1000);
        } else {
            setIsGongSequencePlaying(false);
            startGong4Loop();
        }
    }, [currentSettings, CONFIG]);

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
                                (currentSettings?.pause1Duration ||
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
                            (currentSettings?.pause1Duration ||
                                CONFIG.DEFAULT_PAUSE1_DURATION) * 1000
                        );
                    }
                });
        } else {
            gongSequenceTimerRef.current = setTimeout(
                playSecondGongSequence,
                (currentSettings?.pause1Duration ||
                    CONFIG.DEFAULT_PAUSE1_DURATION) * 1000
            );
        }
    }, [currentSettings, CONFIG, getRandomGong1]);

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
                                        (currentSettings?.pause2Duration ||
                                            CONFIG.DEFAULT_PAUSE2_DURATION) *
                                            1000
                                    );
                                } else {
                                    if (currentSettings?.isThirdSoundEnabled) {
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
                                    (currentSettings?.pause2Duration ||
                                        CONFIG.DEFAULT_PAUSE2_DURATION) * 1000
                                );
                            } else {
                                if (currentSettings?.isThirdSoundEnabled) {
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
                        (currentSettings?.pause2Duration ||
                            CONFIG.DEFAULT_PAUSE2_DURATION) * 1000
                    );
                } else {
                    if (currentSettings?.isThirdSoundEnabled) {
                        playThirdGong();
                    } else {
                        setIsGongSequencePlaying(false);
                    }
                }
            }
        };
        playNextGong();
    }, [currentSettings, CONFIG]);

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

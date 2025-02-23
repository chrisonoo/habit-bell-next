"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrainingStatus } from "@/components/training/TrainingStatus";
import { SessionTimeLeft } from "@/components/training/SessionTimeLeft";
import { TrainingButtons } from "@/components/training/TrainingButtons";
import { CONFIG } from "@/lib/config";
import { cn } from "@/lib/utils";

export default function HomePage() {
    const [settings, setSettings] = useState(() => {
        if (typeof window !== "undefined") {
            const savedSettings = localStorage.getItem("habitBellSettings");
            return savedSettings
                ? JSON.parse(savedSettings)
                : {
                      sessionDuration: CONFIG.DEFAULT_SESSION_DURATION,
                      minInterval: CONFIG.DEFAULT_MIN_INTERVAL,
                      maxInterval: CONFIG.DEFAULT_MAX_INTERVAL,
                      pause1Duration: CONFIG.DEFAULT_PAUSE1_DURATION,
                      pause2Duration: CONFIG.DEFAULT_PAUSE2_DURATION,
                      isThirdSoundEnabled: CONFIG.DEFAULT_THIRD_SOUND_ENABLED,
                  };
        }
        return {};
    });

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
    const [isThirdSoundEnabled, setIsThirdSoundEnabled] = useState(() =>
        typeof window !== "undefined" &&
        settings.isThirdSoundEnabled !== undefined
            ? settings.isThirdSoundEnabled
            : CONFIG.DEFAULT_THIRD_SOUND_ENABLED
    );
    const [audioFailed, setAudioFailed] = useState(false);
    const [audioFailed2, setAudioFailed2] = useState(false);
    const [audioFailed3, setAudioFailed3] = useState(false);
    const [pause1Duration, setPause1Duration] = useState(() =>
        typeof window !== "undefined" && settings.pause1Duration !== undefined
            ? settings.pause1Duration
            : CONFIG.DEFAULT_PAUSE1_DURATION
    );
    const [pause2Duration, setPause2Duration] = useState(() =>
        typeof window !== "undefined" && settings.pause2Duration !== undefined
            ? settings.pause2Duration
            : CONFIG.DEFAULT_PAUSE2_DURATION
    );
    const [sessionDuration, setSessionDuration] = useState(() =>
        typeof window !== "undefined" && settings.sessionDuration !== undefined
            ? settings.sessionDuration
            : CONFIG.DEFAULT_SESSION_DURATION
    );
    const [minInterval, setMinInterval] = useState(() =>
        typeof window !== "undefined" && settings.minInterval !== undefined
            ? settings.minInterval
            : CONFIG.DEFAULT_MIN_INTERVAL
    );
    const [maxInterval, setMaxInterval] = useState(() =>
        typeof window !== "undefined" && settings.maxInterval !== undefined
            ? settings.maxInterval
            : CONFIG.DEFAULT_MAX_INTERVAL
    );

    const audioRefs = useRef<HTMLAudioElement[]>([]);
    const audio2Ref = useRef<HTMLAudioElement | null>(null);
    const audio3Ref = useRef<HTMLAudioElement | null>(null);
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
        // Save settings to localStorage whenever they change
        if (typeof window !== "undefined") {
            const settingsToSave = {
                sessionDuration,
                minInterval,
                maxInterval,
                pause1Duration,
                pause2Duration,
                isThirdSoundEnabled,
            };
            localStorage.setItem(
                "habitBellSettings",
                JSON.stringify(settingsToSave)
            );
        }
    }, [
        sessionDuration,
        minInterval,
        maxInterval,
        pause1Duration,
        pause2Duration,
        isThirdSoundEnabled,
    ]);

    useEffect(() => {
        const initAudio = async () => {
            try {
                audioRefs.current = CONFIG.AUDIO_URLS.GONG1.map(
                    (url) => new Audio(url)
                );
                audio2Ref.current = new Audio(CONFIG.AUDIO_URLS.GONG2);
                audio3Ref.current = new Audio(CONFIG.AUDIO_URLS.GONG3);

                // Initialize all GONG1 sounds
                for (const audio of audioRefs.current) {
                    await audio.play();
                    audio.pause();
                    audio.currentTime = 0;
                }

                // Initialize GONG2 and GONG3
                await audio2Ref.current.play();
                await audio3Ref.current.play();
                audio2Ref.current.pause();
                audio3Ref.current.pause();
                audio2Ref.current.currentTime = 0;
                audio3Ref.current.currentTime = 0;

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

    const handleStoodUp = useCallback(() => {
        if (isTraining && waitingForConfirmation) {
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

    const playThirdGong = useCallback(() => {
        if (!isActiveRef.current || !isThirdSoundEnabledRef.current) {
            setIsGongSequencePlaying(false);
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
                                }
                            };
                        })
                        .catch((error) => {
                            console.error("Third gong playback failed:", error);
                            if (isActiveRef.current) {
                                setIsGongPlaying(false);
                                setIsGongSequencePlaying(false);
                            }
                        });
                } else {
                    setIsGongSequencePlaying(false);
                }
            }, pause1Duration * 1000);
        } else {
            setIsGongSequencePlaying(false);
        }
    }, [pause1Duration]);

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

    const resetToDefaults = useCallback(() => {
        setSessionDuration(CONFIG.DEFAULT_SESSION_DURATION);
        setMinInterval(CONFIG.DEFAULT_MIN_INTERVAL);
        setMaxInterval(CONFIG.DEFAULT_MAX_INTERVAL);
        setPause1Duration(CONFIG.DEFAULT_PAUSE1_DURATION);
        setPause2Duration(CONFIG.DEFAULT_PAUSE2_DURATION);
        setIsThirdSoundEnabled(CONFIG.DEFAULT_THIRD_SOUND_ENABLED);

        // Update localStorage with default settings
        if (typeof window !== "undefined") {
            const defaultSettings = {
                sessionDuration: CONFIG.DEFAULT_SESSION_DURATION,
                minInterval: CONFIG.DEFAULT_MIN_INTERVAL,
                maxInterval: CONFIG.DEFAULT_MAX_INTERVAL,
                pause1Duration: CONFIG.DEFAULT_PAUSE1_DURATION,
                pause2Duration: CONFIG.DEFAULT_PAUSE2_DURATION,
                isThirdSoundEnabled: CONFIG.DEFAULT_THIRD_SOUND_ENABLED,
            };
            localStorage.setItem(
                "habitBellSettings",
                JSON.stringify(defaultSettings)
            );
        }
    }, []);

    return (
        <div className="flex-1 flex items-center justify-center">
            <Card
                className={cn(
                    "w-full max-w-[600px] transition-colors duration-200 border-2",
                    isGongPlaying ? "border-red-500" : "border-gray-200"
                )}
            >
                <CardContent className="space-y-6 p-6">
                    <div className="text-center flex flex-col justify-center min-h-[7rem]">
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

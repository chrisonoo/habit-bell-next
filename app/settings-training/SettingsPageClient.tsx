"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SessionDurationSlider } from "@/components/settings/SessionDurationSlider";
import { PauseDurationSlider } from "@/components/settings/PauseDurationSlider";
import { ThirdSoundToggle } from "@/components/settings/ThirdSoundToggle";
import { TestGongs } from "@/components/settings/TestGongs";
import { ResetButton } from "@/components/settings/ResetButton";
import { CONFIG } from "@/lib/config";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { IntervalSlider } from "@/components/settings/IntervalSlider";

interface Settings {
    // Session settings
    sessionDuration: number;
    maxSessionDuration: number;
    stepSessionDuration: number;

    // Interval settings
    interval: number;
    minInterval: number;
    maxInterval: number;
    stepInterval: number;

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

export default function SettingsPageClient() {
    const [settings, setSettings] = useState<Settings>(() => {
        if (typeof window !== "undefined") {
            const savedSettings = localStorage.getItem("trainingSettings");
            if (!savedSettings) {
                // Initialize with default settings from config
                const defaultSettings: Settings = {
                    // Session settings
                    sessionDuration: CONFIG.DEFAULT_SESSION_DURATION,
                    maxSessionDuration: CONFIG.MAX_SESSION_DURATION,
                    stepSessionDuration: CONFIG.STEP_SESSION_DURATION,

                    // Interval settings
                    interval: CONFIG.DEFAULT_INTERVAL,
                    minInterval: CONFIG.MIN_INTERVAL,
                    maxInterval: CONFIG.MAX_INTERVAL,
                    stepInterval: CONFIG.STEP_INTERVAL,

                    // Pause durations
                    pause1Duration: CONFIG.DEFAULT_PAUSE1_DURATION,
                    maxPause1Duration: CONFIG.MAX_PAUSE1_DURATION,
                    minPause1Duration: CONFIG.MIN_PAUSE1_DURATION,
                    stepPause1Duration: CONFIG.STEP_PAUSE1_DURATION,
                    pause2Duration: CONFIG.DEFAULT_PAUSE2_DURATION,
                    maxPause2Duration: CONFIG.MAX_PAUSE2_DURATION,
                    minPause2Duration: CONFIG.MIN_PAUSE2_DURATION,
                    stepPause2Duration: CONFIG.STEP_PAUSE2_DURATION,

                    // Other settings
                    isThirdSoundEnabled: CONFIG.DEFAULT_THIRD_SOUND_ENABLED,
                };
                // Save default settings to storage immediately
                localStorage.setItem(
                    "trainingSettings",
                    JSON.stringify(defaultSettings)
                );
                return defaultSettings;
            }
            return JSON.parse(savedSettings);
        }
        // Return empty settings for SSR
        return {} as Settings;
    });

    const [isGongPlaying, setIsGongPlaying] = useState(false);
    const [audioFailed, setAudioFailed] = useState(false);
    const [audioFailed2, setAudioFailed2] = useState(false);
    const [audioFailed3, setAudioFailed3] = useState(false);
    const [audioFailed4, setAudioFailed4] = useState(false);
    const audioRefs = useRef<HTMLAudioElement[]>([]);
    const audio2Ref = useRef<HTMLAudioElement | null>(null);
    const audio3Ref = useRef<HTMLAudioElement | null>(null);
    const audio4Ref = useRef<HTMLAudioElement | null>(null);

    // Update session duration
    const setSessionDuration = useCallback((value: number) => {
        setSettings((prev) => {
            const newSettings = {
                ...prev,
                sessionDuration: value,
            };
            localStorage.setItem(
                "trainingSettings",
                JSON.stringify(newSettings)
            );
            return newSettings;
        });
    }, []);

    // Update interval
    const setInterval = useCallback((value: number) => {
        setSettings((prev) => {
            const newSettings = { ...prev, interval: value };
            localStorage.setItem(
                "trainingSettings",
                JSON.stringify(newSettings)
            );
            return newSettings;
        });
    }, []);

    // Update pause1 duration
    const setPause1Duration = useCallback((value: number) => {
        setSettings((prev) => {
            const newSettings = { ...prev, pause1Duration: value };
            localStorage.setItem(
                "trainingSettings",
                JSON.stringify(newSettings)
            );
            return newSettings;
        });
    }, []);

    // Update pause2 duration
    const setPause2Duration = useCallback((value: number) => {
        setSettings((prev) => {
            const newSettings = { ...prev, pause2Duration: value };
            localStorage.setItem(
                "trainingSettings",
                JSON.stringify(newSettings)
            );
            return newSettings;
        });
    }, []);

    // Toggle third sound
    const setIsThirdSoundEnabled = useCallback((value: boolean) => {
        setSettings((prev) => {
            const newSettings = { ...prev, isThirdSoundEnabled: value };
            localStorage.setItem(
                "trainingSettings",
                JSON.stringify(newSettings)
            );
            return newSettings;
        });
    }, []);

    // Reset settings to defaults
    const resetSettings = useCallback(() => {
        const defaultSettings: Settings = {
            // Session settings
            sessionDuration: CONFIG.DEFAULT_SESSION_DURATION,
            maxSessionDuration: CONFIG.MAX_SESSION_DURATION,
            stepSessionDuration: CONFIG.STEP_SESSION_DURATION,

            // Interval settings
            interval: CONFIG.DEFAULT_INTERVAL,
            minInterval: CONFIG.MIN_INTERVAL,
            maxInterval: CONFIG.MAX_INTERVAL,
            stepInterval: CONFIG.STEP_INTERVAL,

            // Pause durations
            pause1Duration: CONFIG.DEFAULT_PAUSE1_DURATION,
            maxPause1Duration: CONFIG.MAX_PAUSE1_DURATION,
            minPause1Duration: CONFIG.MIN_PAUSE1_DURATION,
            stepPause1Duration: CONFIG.STEP_PAUSE1_DURATION,
            pause2Duration: CONFIG.DEFAULT_PAUSE2_DURATION,
            maxPause2Duration: CONFIG.MAX_PAUSE2_DURATION,
            minPause2Duration: CONFIG.MIN_PAUSE2_DURATION,
            stepPause2Duration: CONFIG.STEP_PAUSE2_DURATION,

            // Other settings
            isThirdSoundEnabled: CONFIG.DEFAULT_THIRD_SOUND_ENABLED,
        };
        setSettings(defaultSettings);
        localStorage.setItem(
            "trainingSettings",
            JSON.stringify(defaultSettings)
        );
    }, []);

    // Initialize audio elements
    useEffect(() => {
        if (typeof window !== "undefined") {
            // Initialize audio elements for gong sounds
            const gong1Url =
                CONFIG.AUDIO_URLS.GONG1[
                    Math.floor(Math.random() * CONFIG.AUDIO_URLS.GONG1.length)
                ];
            const gong2Url = CONFIG.AUDIO_URLS.GONG2;
            const gong3Url = CONFIG.AUDIO_URLS.GONG3;
            const gong4Url = CONFIG.AUDIO_URLS.GONG4;

            // Create audio elements
            const audio1 = new Audio(gong1Url);
            const audio2 = new Audio(gong2Url);
            const audio3 = new Audio(gong3Url);
            const audio4 = new Audio(gong4Url);

            // Set up error handlers
            audio1.onerror = () => setAudioFailed(true);
            audio2.onerror = () => setAudioFailed2(true);
            audio3.onerror = () => setAudioFailed3(true);
            audio4.onerror = () => setAudioFailed4(true);

            // Store references
            audioRefs.current = [audio1];
            audio2Ref.current = audio2;
            audio3Ref.current = audio3;
            audio4Ref.current = audio4;

            // Preload audio
            audio1.load();
            audio2.load();
            audio3.load();
            audio4.load();
        }
    }, []);

    // Handle audio playback for testing
    const playTestGongs = useCallback(
        (includeThirdSound: boolean) => {
            if (isGongPlaying) return;

            setIsGongPlaying(true);

            const audio1 = audioRefs.current[0];
            const audio2 = audio2Ref.current;
            const audio3 = audio3Ref.current;

            if (!audio1 || !audio2 || !audio3) {
                setIsGongPlaying(false);
                return;
            }

            // Play first gong
            audio1.currentTime = 0;
            audio1.play().catch((e) => {
                console.error("Error playing audio:", e);
                setAudioFailed(true);
                setIsGongPlaying(false);
            });

            // Play second gong after pause1
            setTimeout(() => {
                audio2.currentTime = 0;
                audio2.play().catch((e) => {
                    console.error("Error playing audio:", e);
                    setAudioFailed2(true);
                });

                // Play third gong after pause2 if enabled
                if (includeThirdSound) {
                    setTimeout(() => {
                        audio3.currentTime = 0;
                        audio3.play().catch((e) => {
                            console.error("Error playing audio:", e);
                            setAudioFailed3(true);
                        });

                        // Reset playing state after all sounds
                        setTimeout(() => {
                            setIsGongPlaying(false);
                        }, 1000);
                    }, settings.pause2Duration * 1000);
                } else {
                    // Reset playing state after second sound
                    setTimeout(() => {
                        setIsGongPlaying(false);
                    }, 1000);
                }
            }, settings.pause1Duration * 1000);
        },
        [
            isGongPlaying,
            settings.pause1Duration,
            settings.pause2Duration,
            setIsGongPlaying,
        ]
    );

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Training Settings</h1>
                <Button asChild>
                    <Link href="/">Back to Training</Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Training Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Accordion
                        type="single"
                        collapsible
                        defaultValue="session"
                        className="w-full"
                    >
                        <AccordionItem value="session">
                            <AccordionTrigger>
                                Session Settings
                            </AccordionTrigger>
                            <AccordionContent className="space-y-6 pt-4">
                                <SessionDurationSlider
                                    sessionDuration={settings.sessionDuration}
                                    setSessionDuration={setSessionDuration}
                                    maxSessionDuration={
                                        settings.maxSessionDuration
                                    }
                                    stepSessionDuration={
                                        settings.stepSessionDuration
                                    }
                                    isTraining={false}
                                />
                                <IntervalSlider
                                    interval={settings.interval}
                                    setInterval={setInterval}
                                    minInterval={settings.minInterval}
                                    maxInterval={settings.maxInterval}
                                    stepInterval={settings.stepInterval}
                                    isTraining={false}
                                />
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="pauses">
                            <AccordionTrigger>Pause Settings</AccordionTrigger>
                            <AccordionContent className="space-y-6 pt-4">
                                <PauseDurationSlider
                                    label="Pause after first gong"
                                    pauseDuration={settings.pause1Duration}
                                    setPauseDuration={setPause1Duration}
                                    maxPauseDuration={
                                        settings.maxPause1Duration
                                    }
                                    minPauseDuration={
                                        settings.minPause1Duration
                                    }
                                    stepPauseDuration={
                                        settings.stepPause1Duration
                                    }
                                    isTraining={false}
                                />
                                <PauseDurationSlider
                                    label="Pause after second gong"
                                    pauseDuration={settings.pause2Duration}
                                    setPauseDuration={setPause2Duration}
                                    maxPauseDuration={
                                        settings.maxPause2Duration
                                    }
                                    minPauseDuration={
                                        settings.minPause2Duration
                                    }
                                    stepPauseDuration={
                                        settings.stepPause2Duration
                                    }
                                    isTraining={false}
                                />
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="sounds">
                            <AccordionTrigger>Sound Settings</AccordionTrigger>
                            <AccordionContent className="space-y-6 pt-4">
                                <ThirdSoundToggle
                                    isThirdSoundEnabled={
                                        settings.isThirdSoundEnabled
                                    }
                                    setIsThirdSoundEnabled={
                                        setIsThirdSoundEnabled
                                    }
                                    isTraining={false}
                                />
                                <TestGongs
                                    playTestGongs={playTestGongs}
                                    isGongPlaying={isGongPlaying}
                                    isThirdSoundEnabled={
                                        settings.isThirdSoundEnabled
                                    }
                                    audioFailed={audioFailed}
                                    audioFailed2={audioFailed2}
                                    audioFailed3={audioFailed3}
                                    audioFailed4={audioFailed4}
                                />
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                    <ResetButton resetSettings={resetSettings} />
                </CardContent>
            </Card>
        </div>
    );
}

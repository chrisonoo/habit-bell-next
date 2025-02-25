"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SessionDurationSlider } from "@/components/settings/SessionDurationSlider";
import { IntervalRangeSlider } from "@/components/settings/IntervalRangeSlider";
import { PauseDurationSlider } from "@/components/settings/PauseDurationSlider";
import { ThirdSoundToggle } from "@/components/settings/ThirdSoundToggle";
import { TestGongs } from "@/components/settings/TestGongs";
import { ResetButton } from "@/components/settings/ResetButton";
import { CONFIG } from "@/lib/config-pomodoro";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Settings {
    // Session settings
    sessionDuration: number;
    maxSessionDuration: number;
    stepSessionDuration: number;

    // Interval settings
    minInterval: number;
    maxInterval: number;
    stepInterval: number;
    defaultMinInterval: number;
    defaultMaxInterval: number;

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
            const savedSettings = localStorage.getItem("pomodoroSettings");
            if (!savedSettings) {
                // Initialize with default settings from config
                const defaultSettings: Settings = {
                    // Session settings
                    sessionDuration: CONFIG.DEFAULT_SESSION_DURATION,
                    maxSessionDuration: CONFIG.MAX_SESSION_DURATION,
                    stepSessionDuration: CONFIG.STEP_SESSION_DURATION,

                    // Interval settings
                    minInterval: CONFIG.DEFAULT_MIN_INTERVAL,
                    maxInterval: CONFIG.DEFAULT_MAX_INTERVAL,
                    stepInterval: CONFIG.STEP_INTERVAL,
                    defaultMinInterval: CONFIG.MIN_INTERVAL,
                    defaultMaxInterval: CONFIG.MAX_INTERVAL,

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
                    "pomodoroSettings",
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

    // Save settings to localStorage whenever they change
    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("pomodoroSettings", JSON.stringify(settings));
        }
    }, [settings]);

    useEffect(() => {
        const initAudio = async () => {
            try {
                audioRefs.current = CONFIG.AUDIO_URLS.GONG1.map(
                    (url) => new Audio(url)
                );
                audio2Ref.current = new Audio(CONFIG.AUDIO_URLS.GONG2);
                audio3Ref.current = new Audio(CONFIG.AUDIO_URLS.GONG3);
                audio4Ref.current = new Audio(CONFIG.AUDIO_URLS.GONG4);

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
                setAudioFailed4(false);
            } catch (error) {
                console.error("Audio initialization failed:", error);
                setAudioFailed(true);
                setAudioFailed2(true);
                setAudioFailed3(true);
                setAudioFailed4(true);
            }
        };
        initAudio();
    }, []);

    const updateSetting = (
        key: keyof Settings,
        value: Settings[keyof Settings]
    ) => {
        setSettings((prev: Settings) => ({ ...prev, [key]: value }));
    };

    const resetToDefaults = useCallback(() => {
        const defaultSettings: Settings = {
            // Session settings
            sessionDuration: CONFIG.DEFAULT_SESSION_DURATION,
            maxSessionDuration: CONFIG.MAX_SESSION_DURATION,
            stepSessionDuration: CONFIG.STEP_SESSION_DURATION,

            // Interval settings
            minInterval: CONFIG.DEFAULT_MIN_INTERVAL,
            maxInterval: CONFIG.DEFAULT_MAX_INTERVAL,
            stepInterval: CONFIG.STEP_INTERVAL,
            defaultMinInterval: CONFIG.MIN_INTERVAL,
            defaultMaxInterval: CONFIG.MAX_INTERVAL,

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
    }, []);

    const playTestGong = useCallback((gongNumber: 1 | 2 | 3 | 4) => {
        const audio =
            gongNumber === 1
                ? audioRefs.current[
                      Math.floor(Math.random() * audioRefs.current.length)
                  ]
                : gongNumber === 2
                ? audio2Ref.current
                : gongNumber === 3
                ? audio3Ref.current
                : audio4Ref.current;
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
                    } else if (gongNumber === 3) {
                        setAudioFailed3(true);
                    } else {
                        setAudioFailed4(true);
                    }
                });
        }
    }, []);

    return (
        <Card className="w-full max-w-[600px] mx-auto">
            <CardHeader>
                <CardTitle>Pomodoro Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
                {/* Main settings */}
                <div className="space-y-6">
                    <SessionDurationSlider
                        sessionDuration={settings.sessionDuration}
                        setSessionDuration={(value) =>
                            updateSetting("sessionDuration", value)
                        }
                        maxSessionDuration={settings.maxSessionDuration}
                        stepSessionDuration={settings.stepSessionDuration}
                        isTraining={false}
                    />
                    <IntervalRangeSlider
                        minInterval={settings.minInterval}
                        maxInterval={settings.maxInterval}
                        setMinInterval={(value) =>
                            updateSetting("minInterval", value)
                        }
                        setMaxInterval={(value) =>
                            updateSetting("maxInterval", value)
                        }
                        stepInterval={settings.stepInterval}
                        defaultMinInterval={settings.defaultMinInterval}
                        defaultMaxInterval={settings.defaultMaxInterval}
                        isTraining={false}
                    />

                    <div className="flex flex-col items-center mt-6">
                        <Button asChild className="w-full sm:w-auto px-8">
                            <Link href="/">Save & Return</Link>
                        </Button>
                    </div>
                </div>

                {/* Advanced settings in Accordion */}
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="advanced-settings">
                        <AccordionTrigger className="text-lg font-medium">
                            Advanced
                        </AccordionTrigger>
                        <AccordionContent className="space-y-6 pt-4">
                            <PauseDurationSlider
                                id="pause1-duration"
                                label="Pause 1 Duration"
                                value={settings.pause1Duration}
                                setValue={(value) =>
                                    updateSetting("pause1Duration", value)
                                }
                                min={settings.minPause1Duration}
                                max={settings.maxPause1Duration}
                                step={settings.stepPause1Duration}
                                isTraining={false}
                            />
                            <PauseDurationSlider
                                id="pause2-duration"
                                label="Pause 2 Duration"
                                value={settings.pause2Duration}
                                setValue={(value) =>
                                    updateSetting("pause2Duration", value)
                                }
                                min={settings.minPause2Duration}
                                max={settings.maxPause2Duration}
                                step={settings.stepPause2Duration}
                                isTraining={false}
                            />
                            <ThirdSoundToggle
                                isThirdSoundEnabled={
                                    settings.isThirdSoundEnabled
                                }
                                setIsThirdSoundEnabled={(value) =>
                                    updateSetting("isThirdSoundEnabled", value)
                                }
                                isTraining={false}
                            />
                            <TestGongs
                                playTestGong={playTestGong}
                                audioFailed={audioFailed}
                                audioFailed2={audioFailed2}
                                audioFailed3={audioFailed3}
                                audioFailed4={audioFailed4}
                                isTraining={false}
                            />
                            <ResetButton resetToDefaults={resetToDefaults} />
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
    );
}

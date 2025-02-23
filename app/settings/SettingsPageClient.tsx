"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SessionDurationSlider } from "@/components/settings/SessionDurationSlider";
import { IntervalRangeSlider } from "@/components/settings/IntervalRangeSlider";
import { PauseDurationSlider } from "@/components/settings/PauseDurationSlider";
import { ThirdSoundToggle } from "@/components/settings/ThirdSoundToggle";
import { TestGongs } from "@/components/settings/TestGongs";
import { ResetButton } from "@/components/settings/ResetButton";
import { CONFIG } from "@/lib/config";

interface Settings {
    sessionDuration: number;
    minInterval: number;
    maxInterval: number;
    pause1Duration: number;
    pause2Duration: number;
    isThirdSoundEnabled: boolean;
}

export default function SettingsPageClient() {
    const [settings, setSettings] = useState<Settings>(() => {
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
        return {
            sessionDuration: CONFIG.DEFAULT_SESSION_DURATION,
            minInterval: CONFIG.DEFAULT_MIN_INTERVAL,
            maxInterval: CONFIG.DEFAULT_MAX_INTERVAL,
            pause1Duration: CONFIG.DEFAULT_PAUSE1_DURATION,
            pause2Duration: CONFIG.DEFAULT_PAUSE2_DURATION,
            isThirdSoundEnabled: CONFIG.DEFAULT_THIRD_SOUND_ENABLED,
        };
    });

    const [isGongPlaying, setIsGongPlaying] = useState(false);
    const [audioFailed, setAudioFailed] = useState(false);
    const [audioFailed2, setAudioFailed2] = useState(false);
    const [audioFailed3, setAudioFailed3] = useState(false);
    const audioRefs = useRef<HTMLAudioElement[]>([]);
    const audio2Ref = useRef<HTMLAudioElement | null>(null);
    const audio3Ref = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("habitBellSettings", JSON.stringify(settings));
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

    const updateSetting = (
        key: keyof Settings,
        value: Settings[keyof Settings]
    ) => {
        setSettings((prev: Settings) => ({ ...prev, [key]: value }));
    };

    const resetToDefaults = useCallback(() => {
        const defaultSettings: Settings = {
            sessionDuration: CONFIG.DEFAULT_SESSION_DURATION,
            minInterval: CONFIG.DEFAULT_MIN_INTERVAL,
            maxInterval: CONFIG.DEFAULT_MAX_INTERVAL,
            pause1Duration: CONFIG.DEFAULT_PAUSE1_DURATION,
            pause2Duration: CONFIG.DEFAULT_PAUSE2_DURATION,
            isThirdSoundEnabled: CONFIG.DEFAULT_THIRD_SOUND_ENABLED,
        };
        setSettings(defaultSettings);
    }, []);

    const playTestGong = useCallback((gongNumber: 1 | 2 | 3) => {
        const audio =
            gongNumber === 1
                ? audioRefs.current[
                      Math.floor(Math.random() * audioRefs.current.length)
                  ]
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
    }, []);

    return (
        <Card className="w-full max-w-[600px] mx-auto">
            <CardHeader>
                <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
                <SessionDurationSlider
                    sessionDuration={settings.sessionDuration}
                    setSessionDuration={(value) =>
                        updateSetting("sessionDuration", value)
                    }
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
                    isTraining={false}
                />
                <PauseDurationSlider
                    id="pause1-duration"
                    label="Pause 1 Duration"
                    value={settings.pause1Duration}
                    setValue={(value) => updateSetting("pause1Duration", value)}
                    min={CONFIG.MIN_PAUSE1_DURATION}
                    max={CONFIG.MAX_PAUSE1_DURATION}
                    step={CONFIG.STEP_PAUSE1_DURATION}
                    isTraining={false}
                />
                <PauseDurationSlider
                    id="pause2-duration"
                    label="Pause 2 Duration"
                    value={settings.pause2Duration}
                    setValue={(value) => updateSetting("pause2Duration", value)}
                    min={CONFIG.MIN_PAUSE2_DURATION}
                    max={CONFIG.MAX_PAUSE2_DURATION}
                    step={CONFIG.STEP_PAUSE2_DURATION}
                    isTraining={false}
                />
                <ThirdSoundToggle
                    isThirdSoundEnabled={settings.isThirdSoundEnabled}
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
                    isTraining={false}
                />
                <ResetButton resetToDefaults={resetToDefaults} />
            </CardContent>
        </Card>
    );
}

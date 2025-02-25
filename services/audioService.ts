"use client";

/**
 * Audio Service
 * Handles audio initialization, playback, and management for the application
 */

/**
 * Interface for audio configuration
 */
interface AudioConfig {
    GONG1: string[];
    GONG2: string;
    GONG3: string;
    GONG4: string;
}

/**
 * Class representing an audio service for managing sound playback
 */
export class AudioService {
    private audioElements: Map<string, HTMLAudioElement> = new Map();
    private gong1Elements: HTMLAudioElement[] = [];
    private initialized: boolean = false;

    /**
     * Initializes audio elements with the provided configuration
     * @param audioConfig - Configuration containing audio URLs
     */
    async initialize(audioConfig: AudioConfig): Promise<void> {
        try {
            console.log("Initializing audio elements...");

            // Initialize GONG1 sounds (array of sounds)
            this.gong1Elements = audioConfig.GONG1.map((url) => {
                const audio = new Audio(url);
                audio.preload = "auto";
                return audio;
            });

            // Initialize other gong sounds
            this.audioElements.set("gong2", new Audio(audioConfig.GONG2));
            this.audioElements.set("gong3", new Audio(audioConfig.GONG3));
            this.audioElements.set("gong4", new Audio(audioConfig.GONG4));

            // Set preload attribute for all audio elements
            this.audioElements.forEach((audio) => {
                audio.preload = "auto";
            });

            this.initialized = true;
            console.log("Audio elements initialized successfully");
        } catch (error) {
            console.error("Audio initialization failed:", error);
            throw error;
        }
    }

    /**
     * Gets a random GONG1 sound
     * @returns A random audio element from the GONG1 collection
     */
    getRandomGong1(): HTMLAudioElement | null {
        if (!this.initialized || this.gong1Elements.length === 0) {
            console.warn(
                "Audio not initialized or no GONG1 elements available"
            );
            return null;
        }

        const randomIndex = Math.floor(
            Math.random() * this.gong1Elements.length
        );
        return this.gong1Elements[randomIndex];
    }

    /**
     * Gets a specific gong sound by name
     * @param name - The name of the gong sound to get
     * @returns The requested audio element or null if not found
     */
    getGong(name: "gong2" | "gong3" | "gong4"): HTMLAudioElement | null {
        if (!this.initialized) {
            console.warn("Audio not initialized");
            return null;
        }

        return this.audioElements.get(name) || null;
    }

    /**
     * Plays an audio element
     * @param audio - The audio element to play
     * @returns A promise that resolves when the audio starts playing or rejects on error
     */
    async playAudio(audio: HTMLAudioElement): Promise<void> {
        if (!audio) {
            console.warn("Cannot play audio - audio element is null");
            return;
        }

        try {
            // Reset the audio to ensure it plays from the beginning
            audio.currentTime = 0;
            await audio.play();
        } catch (error) {
            console.error("Audio playback failed:", error);
            throw error;
        }
    }

    /**
     * Stops an audio element
     * @param audio - The audio element to stop
     */
    stopAudio(audio: HTMLAudioElement): void {
        if (!audio) {
            console.warn("Cannot stop audio - audio element is null");
            return;
        }

        try {
            audio.pause();
            audio.currentTime = 0;
            if (audio.loop) {
                audio.loop = false;
            }
        } catch (error) {
            console.error("Error stopping audio:", error);
        }
    }

    /**
     * Starts looping an audio element
     * @param audio - The audio element to loop
     */
    startAudioLoop(audio: HTMLAudioElement): void {
        if (!audio) {
            console.warn("Cannot start audio loop - audio element is null");
            return;
        }

        try {
            audio.loop = true;
            audio.currentTime = 0;
            audio.play().catch((error) => {
                console.error("Audio loop playback failed:", error);
                // Try again after a short delay if playback fails
                setTimeout(() => {
                    if (audio) {
                        audio.play().catch((e) => {
                            console.error(
                                "Retry audio loop playback failed:",
                                e
                            );
                        });
                    }
                }, 1000);
            });
        } catch (error) {
            console.error("Error starting audio loop:", error);
        }
    }

    /**
     * Stops all audio playback
     */
    stopAllAudio(): void {
        try {
            // Stop all GONG1 sounds
            this.gong1Elements.forEach((audio) => {
                audio.pause();
                audio.currentTime = 0;
            });

            // Stop all other gong sounds
            this.audioElements.forEach((audio) => {
                audio.pause();
                audio.currentTime = 0;
                if (audio.loop) {
                    audio.loop = false;
                }
            });
        } catch (error) {
            console.error("Error stopping all audio:", error);
        }
    }

    /**
     * Checks if the audio service is initialized
     * @returns True if initialized, false otherwise
     */
    isInitialized(): boolean {
        return this.initialized;
    }
}

// Create and export a singleton instance of the AudioService
export const audioService = new AudioService();

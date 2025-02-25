"use client";

import { useState, useRef, useCallback, useEffect } from "react";

/**
 * Interface for the return value of the useTrainingTimer hook
 */
interface UseTrainingTimerReturn {
    // State
    countdown: number;
    sessionTimeLeft: number;
    isSessionEnded: boolean;
    lastTickTimestamp: number | null;

    // Functions
    setCountdown: (value: number) => void;
    setSessionTimeLeft: (value: number) => void;
    setIsSessionEnded: (value: boolean) => void;
    setLastTickTimestamp: (value: number | null) => void;
    startTimer: (sessionDuration: number, initialInterval: number) => void;
    stopTimer: () => void;
    resetTimers: () => void;
}

/**
 * Custom hook for managing training timers
 * Handles countdown and session time tracking
 */
export function useTrainingTimer(
    isActive: boolean,
    isTraining: boolean,
    isGongSequencePlaying: boolean,
    onCountdownZero: () => void,
    onSessionEnd: () => void
): UseTrainingTimerReturn {
    // Timer state
    const [countdown, setCountdown] = useState(0);
    const [sessionTimeLeft, setSessionTimeLeft] = useState(0);
    const [isSessionEnded, setIsSessionEnded] = useState(false);
    const [lastTickTimestamp, setLastTickTimestamp] = useState<number | null>(
        null
    );

    // Timer references
    const animationFrameIdRef = useRef<number | null>(null);

    /**
     * Starts the training timers
     * @param sessionDuration - Duration of the session in seconds
     * @param initialInterval - Initial interval for the countdown in seconds
     */
    const startTimer = useCallback(
        (sessionDuration: number, initialInterval: number) => {
            console.log("Starting timer with:", {
                sessionDuration,
                initialInterval,
            });
            setSessionTimeLeft(sessionDuration);
            setCountdown(initialInterval);
            setIsSessionEnded(false);
            setLastTickTimestamp(null);
        },
        []
    );

    /**
     * Stops all timers and resets state
     */
    const stopTimer = useCallback(() => {
        console.log("Stopping timer");
        if (animationFrameIdRef.current) {
            cancelAnimationFrame(animationFrameIdRef.current);
            animationFrameIdRef.current = null;
        }

        setCountdown(0);
        setSessionTimeLeft(0);
        setIsSessionEnded(false);
        setLastTickTimestamp(null);
    }, []);

    /**
     * Resets timers without changing the active state
     */
    const resetTimers = useCallback(() => {
        console.log("Resetting timers");
        setCountdown(0);
        setIsSessionEnded(false);
        setLastTickTimestamp(null);
    }, []);

    // Main timer effect that updates countdown and session time
    useEffect(() => {
        // Don't run timers if not active, not training, or session has ended
        if (!isActive || !isTraining || isSessionEnded) {
            setLastTickTimestamp(null);
            return;
        }

        // Don't run timers when gong sequence is playing
        if (isGongSequencePlaying) {
            setLastTickTimestamp(null);
            return;
        }

        console.log("Timer effect started");
        let lastUpdate = performance.now();

        const updateTimers = (timestamp: number) => {
            if (!lastTickTimestamp) {
                setLastTickTimestamp(timestamp);
                lastUpdate = timestamp;
                animationFrameIdRef.current =
                    requestAnimationFrame(updateTimers);
                return;
            }

            const elapsed = timestamp - lastUpdate;
            if (elapsed >= 1000) {
                lastUpdate = timestamp;
                console.log(
                    "Timer tick - sessionTimeLeft:",
                    sessionTimeLeft,
                    "countdown:",
                    countdown
                );

                // Update countdown
                if (countdown > 0) {
                    const newCountdown = countdown - 1;
                    setCountdown(newCountdown);

                    // If countdown just reached zero, trigger gong sequence
                    if (newCountdown === 0) {
                        onCountdownZero();
                    }
                }

                // Update session time only if gong sequence is not playing
                if (!isGongSequencePlaying && sessionTimeLeft > 0) {
                    setSessionTimeLeft((prev) => Math.max(0, prev - 1));
                } else if (sessionTimeLeft === 0 && !isSessionEnded) {
                    setIsSessionEnded(true);
                    onSessionEnd();
                }
            }

            animationFrameIdRef.current = requestAnimationFrame(updateTimers);
        };

        animationFrameIdRef.current = requestAnimationFrame(updateTimers);

        return () => {
            console.log("Timer effect cleanup");
            if (animationFrameIdRef.current) {
                cancelAnimationFrame(animationFrameIdRef.current);
                animationFrameIdRef.current = null;
            }
        };
    }, [
        isActive,
        isTraining,
        isSessionEnded,
        countdown,
        sessionTimeLeft,
        lastTickTimestamp,
        isGongSequencePlaying,
        onCountdownZero,
        onSessionEnd,
    ]);

    // Log session time changes for debugging
    useEffect(() => {
        console.log("Current session time:", sessionTimeLeft);
    }, [sessionTimeLeft]);

    return {
        // State
        countdown,
        sessionTimeLeft,
        isSessionEnded,
        lastTickTimestamp,

        // Functions
        setCountdown,
        setSessionTimeLeft,
        setIsSessionEnded,
        setLastTickTimestamp,
        startTimer,
        stopTimer,
        resetTimers,
    };
}

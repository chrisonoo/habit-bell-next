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
    const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
    const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

    /**
     * Starts the training timers
     * @param sessionDuration - Duration of the session in seconds
     * @param initialInterval - Initial interval for the countdown in seconds
     */
    const startTimer = useCallback(
        (sessionDuration: number, initialInterval: number) => {
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
        if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current);
        if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current);

        setCountdown(0);
        setSessionTimeLeft(0);
        setIsSessionEnded(false);
        setLastTickTimestamp(null);
    }, []);

    /**
     * Resets timers without changing the active state
     */
    const resetTimers = useCallback(() => {
        setCountdown(0);
        setIsSessionEnded(false);
        setLastTickTimestamp(null);
    }, []);

    // Main timer effect that updates countdown and session time
    useEffect(() => {
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
        let animationFrameId: number;
        let lastUpdate = performance.now();

        const updateTimers = (timestamp: number) => {
            if (!lastTickTimestamp) {
                setLastTickTimestamp(timestamp);
                lastUpdate = timestamp;
                animationFrameId = requestAnimationFrame(updateTimers);
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

                // Update both timers simultaneously
                if (sessionTimeLeft > 0) {
                    setSessionTimeLeft((prev) => Math.max(0, prev - 1));
                } else if (!isSessionEnded) {
                    setCountdown(0);
                    setIsSessionEnded(true);
                    onSessionEnd();
                }

                if (countdown > 0 && !isSessionEnded) {
                    setCountdown((prev) => Math.max(0, prev - 1));
                } else if (
                    countdown === 0 &&
                    !isSessionEnded &&
                    !isGongSequencePlaying
                ) {
                    onCountdownZero();
                }
            }

            animationFrameId = requestAnimationFrame(updateTimers);
        };

        animationFrameId = requestAnimationFrame(updateTimers);

        return () => {
            console.log("Timer effect cleanup");
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
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

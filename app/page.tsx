"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrainingStatus } from "@/components/training/TrainingStatus";
import { SessionTimeLeft } from "@/components/training/SessionTimeLeft";
import { TrainingButtons } from "@/components/training/TrainingButtons";
import { cn } from "@/lib/utils";
import { TrainingClockIcon } from "@/components/training/TrainingClockIcon";
import { useActiveConfig } from "@/hooks/useActiveConfig";
import { useHeader } from "@/components/layout/Header";
import { useTrainingState } from "@/hooks/useTrainingState";

/**
 * Main HomePage component for the habit bell application
 * Uses the useTrainingState hook to manage the training session
 * Supports both training and pomodoro modes with different timing configurations
 */
export default function HomePage() {
    // Get configuration settings from the active config hook
    const { isPomodoroMode } = useActiveConfig();

    // Get header functions at the top level to avoid conditional hook calls
    const { toggleHeader } = useHeader();

    // Use the training state hook to manage all training state
    const {
        isLoading,
        isTraining,
        isGongPlaying,
        isGongSequencePlaying,
        waitingForConfirmation,
        countdown,
        sessionTimeLeft,
        isSessionEnded,
        startTraining,
        stopTraining,
        handleStoodUp,
        formatTime,
    } = useTrainingState();

    // Show loading state while settings are being loaded
    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                Loading settings...
            </div>
        );
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
                                <TrainingClockIcon onClick={toggleHeader} />
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

/**
 * Interface defining the props for the TrainingStatus component
 * Contains all the state variables needed to display the appropriate training status message
 */
interface TrainingStatusProps {
    isTraining: boolean;
    waitingForConfirmation: boolean;
    isSessionEnded: boolean;
    countdown: number;
    formatTime: (seconds: number) => string;
    isGongSequencePlaying: boolean;
}

/**
 * TrainingStatus component displays different messages based on the current state of the training session
 * Shows appropriate text for: not training, training completed, time to stand up, and countdown to next gong
 */
export function TrainingStatus({
    isTraining,
    waitingForConfirmation,
    isSessionEnded,
    countdown,
    formatTime,
    isGongSequencePlaying,
}: TrainingStatusProps) {
    // If not in training mode, show the initial ready message
    if (!isTraining) {
        return (
            <div className="text-xl sm:text-2xl font-bold">
                Ready to training?
            </div>
        );
    }

    // If the session has ended, show the completion message
    if (isSessionEnded) {
        return (
            <div className="text-xl sm:text-2xl font-bold text-green-500">
                Training completed!
            </div>
        );
    }

    // If waiting for user confirmation, countdown is zero, or gong sequence is playing,
    // show the "stand up" message
    if (waitingForConfirmation || countdown === 0 || isGongSequencePlaying) {
        return (
            <div className="text-xl sm:text-2xl font-bold text-red-500">
                Stand up now!
            </div>
        );
    }

    // If countdown is active and session is not ended, show the countdown timer
    if (countdown > 0 && !isSessionEnded) {
        return (
            <div className="flex flex-col sm:flex-row items-center justify-center">
                <div className="text-xl sm:text-2xl font-bold">
                    Next gong in:
                </div>
                <div className="text-3xl sm:text-4xl font-bold sm:ml-2">
                    {formatTime(countdown)}
                </div>
            </div>
        );
    }

    // Fallback message if none of the above conditions are met
    return (
        <div className="text-xl sm:text-2xl font-bold">
            Training in progress...
        </div>
    );
}

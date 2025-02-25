/**
 * Interface defining the props for the TrainingStatus component
 * Contains all the state variables needed to display the appropriate training status message
 */
interface TrainingStatusProps {
    isTraining: boolean; // Whether training is currently active
    waitingForConfirmation: boolean; // Whether waiting for user to confirm standing up
    isSessionEnded: boolean; // Whether the training session has ended
    countdown: number; // Time until the next gong in seconds
    formatTime: (seconds: number) => string; // Function to format time in seconds to a readable string
    isGongSequencePlaying: boolean; // Whether the gong sequence is currently playing
}

/**
 * TrainingStatus component displays different messages based on the current state of the training session
 * Shows appropriate text for: not training, training completed, time to stand up, and countdown to next gong
 *
 * @param props - Component properties including training state and countdown information
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

    // CRITICAL FIX: Check isSessionEnded first and with highest priority
    // This ensures that when a session ends, this message always takes precedence
    // regardless of other state variables
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
    // Double-check isSessionEnded again as an extra safety measure
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

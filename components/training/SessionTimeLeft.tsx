/**
 * Interface defining the props for the SessionTimeLeft component
 * Contains the training state, remaining time, and formatting function
 */
interface SessionTimeLeftProps {
    isTraining: boolean;
    sessionTimeLeft: number;
    formatTime: (seconds: number) => string;
}

/**
 * SessionTimeLeft component displays the remaining time in the current training session
 * Shows either the time left or a prompt to start training based on the isTraining state
 */
export function SessionTimeLeft({
    isTraining,
    sessionTimeLeft,
    formatTime,
}: SessionTimeLeftProps) {
    return (
        <div className="text-base sm:text-lg">
            {/* Conditionally display either the time left or a prompt to start training */}
            {isTraining
                ? `Session time left: ${formatTime(sessionTimeLeft)}`
                : "Press 'Start Training' to begin"}
        </div>
    );
}

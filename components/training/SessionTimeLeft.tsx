/**
 * Interface defining the props for the SessionTimeLeft component
 */
interface SessionTimeLeftProps {
    isTraining: boolean; // Whether training is currently active
    sessionTimeLeft: number; // Time left in the session in seconds
    formatTime: (seconds: number) => string; // Function to format time in seconds to a readable string
}

/**
 * SessionTimeLeft component displays the remaining time in the current training session
 * Shows the time in a formatted way (e.g., "2:30" for 2 minutes and 30 seconds)
 * Only displays when training is active
 *
 * @param props - Component properties including training state and time information
 */
export function SessionTimeLeft({
    isTraining,
    sessionTimeLeft,
    formatTime,
}: SessionTimeLeftProps) {
    // Only show session time when in training mode
    if (!isTraining) {
        return null;
    }

    return (
        <div className="text-sm text-muted-foreground">
            Session time left: {formatTime(sessionTimeLeft)}
        </div>
    );
}

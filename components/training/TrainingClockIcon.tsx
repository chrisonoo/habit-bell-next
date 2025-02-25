import { Clock } from "lucide-react";
import { useCallback } from "react";

/**
 * Interface defining the props for the TrainingClockIcon component
 * Contains an optional onClick handler for custom click behavior
 */
interface TrainingClockIconProps {
    onClick?: () => void;
}

/**
 * TrainingClockIcon component displays a clock icon that toggles fullscreen mode when clicked
 * Also executes any additional onClick handler passed as a prop
 */
export function TrainingClockIcon({ onClick }: TrainingClockIconProps) {
    /**
     * Handle click on the clock icon
     * 1. Calls the original onClick handler if provided
     * 2. Toggles fullscreen mode (enters fullscreen if not in fullscreen, exits if already in fullscreen)
     */
    const handleClick = useCallback(() => {
        // Call the original onClick handler if provided
        if (onClick) {
            onClick();
        }

        // Toggle fullscreen
        if (!document.fullscreenElement) {
            // If not in fullscreen mode, request fullscreen
            document.documentElement.requestFullscreen().catch((err) => {
                console.error(
                    `Error attempting to enable fullscreen: ${err.message}`
                );
            });
        } else {
            // If already in fullscreen mode, exit fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }, [onClick]);

    return (
        <div
            className="relative w-24 h-24 mx-auto mb-4 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleClick}
        >
            <Clock className="w-full h-full text-primary" />
        </div>
    );
}

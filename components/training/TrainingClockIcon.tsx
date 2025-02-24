import { Clock } from "lucide-react";
import { useCallback } from "react";

interface TrainingClockIconProps {
    onClick?: () => void;
}

export function TrainingClockIcon({ onClick }: TrainingClockIconProps) {
    const handleClick = useCallback(() => {
        // Call the original onClick handler if provided
        if (onClick) {
            onClick();
        }

        // Toggle fullscreen
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                console.error(
                    `Error attempting to enable fullscreen: ${err.message}`
                );
            });
        } else {
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

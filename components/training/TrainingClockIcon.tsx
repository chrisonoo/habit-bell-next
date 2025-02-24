import { Clock } from "lucide-react";

interface TrainingClockIconProps {
    onClick?: () => void;
}

export function TrainingClockIcon({ onClick }: TrainingClockIconProps) {
    return (
        <div
            className="relative w-24 h-24 mx-auto mb-4 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={onClick}
        >
            <Clock className="w-full h-full text-primary" />
        </div>
    );
}

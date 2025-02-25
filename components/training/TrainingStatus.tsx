interface TrainingStatusProps {
    isTraining: boolean;
    waitingForConfirmation: boolean;
    isSessionEnded: boolean;
    countdown: number;
    formatTime: (seconds: number) => string;
    isGongSequencePlaying: boolean;
}

export function TrainingStatus({
    isTraining,
    waitingForConfirmation,
    isSessionEnded,
    countdown,
    formatTime,
    isGongSequencePlaying,
}: TrainingStatusProps) {
    if (!isTraining) {
        return (
            <div className="text-xl sm:text-2xl font-bold">
                Ready to training?
            </div>
        );
    }

    if (isSessionEnded) {
        return (
            <div className="text-xl sm:text-2xl font-bold text-green-500">
                Training completed!
            </div>
        );
    }

    if (waitingForConfirmation || countdown === 0 || isGongSequencePlaying) {
        return (
            <div className="text-xl sm:text-2xl font-bold text-red-500">
                Stand up now!
            </div>
        );
    }

    if (countdown > 0) {
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

    return (
        <div className="text-xl sm:text-2xl font-bold">
            Training in progress...
        </div>
    );
}

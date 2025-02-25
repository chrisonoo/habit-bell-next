import { Button } from "@/components/ui/button";

interface TrainingButtonsProps {
    isTraining: boolean;
    waitingForConfirmation: boolean;
    isGongSequencePlaying: boolean;
    isSessionEnded?: boolean;
    isLastInterval?: boolean;
    startTraining: () => void;
    stopTraining: () => void;
    handleStoodUp: () => void;
}

export function TrainingButtons({
    isTraining,
    waitingForConfirmation,
    isGongSequencePlaying,
    isSessionEnded = false,
    isLastInterval = false,
    startTraining,
    stopTraining,
    handleStoodUp,
}: TrainingButtonsProps) {
    if (isTraining) {
        return (
            <div className="flex sm:flex-row sm:space-y-0 sm:space-x-2 gap-2">
                <Button
                    onClick={stopTraining}
                    variant="destructive"
                    className="flex-2"
                >
                    Stop
                </Button>
                <Button
                    onClick={handleStoodUp}
                    className="flex-1"
                    disabled={!waitingForConfirmation && !isSessionEnded}
                >
                    {isSessionEnded || isLastInterval
                        ? "Finish Training"
                        : "Let's Go!"}
                </Button>
            </div>
        );
    }

    return (
        <Button onClick={startTraining} className="w-full">
            Start Training
        </Button>
    );
}

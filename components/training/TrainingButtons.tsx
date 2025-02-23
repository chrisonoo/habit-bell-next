import { Button } from "@/components/ui/button";

interface TrainingButtonsProps {
    isTraining: boolean;
    waitingForConfirmation: boolean;
    isGongSequencePlaying: boolean;
    startTraining: () => void;
    stopTraining: () => void;
    handleStoodUp: () => void;
}

export function TrainingButtons({
    isTraining,
    waitingForConfirmation,
    isGongSequencePlaying,
    startTraining,
    stopTraining,
    handleStoodUp,
}: TrainingButtonsProps) {
    if (isTraining) {
        return (
            <div className="flex sm:flex-row sm:space-y-0 sm:space-x-2 gap-2">
                <Button
                    onClick={handleStoodUp}
                    className="flex-1"
                    disabled={!waitingForConfirmation || isGongSequencePlaying}
                >
                    Let's Go!
                </Button>
                <Button
                    onClick={stopTraining}
                    variant="destructive"
                    className="flex-2"
                >
                    Stop
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

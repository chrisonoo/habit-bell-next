import { Button } from "@/components/ui/button";

/**
 * Interface defining the props for the TrainingButtons component
 * Contains all the state variables and callback functions needed for button interactions
 */
interface TrainingButtonsProps {
    isTraining: boolean; // Whether training is currently active
    waitingForConfirmation: boolean; // Whether waiting for user to confirm standing up
    isGongSequencePlaying: boolean; // Whether the gong sequence is currently playing
    isSessionEnded?: boolean; // Whether the training session has ended (optional)
    startTraining: () => void; // Function to start a new training session
    stopTraining: () => void; // Function to stop the current training session
    handleStoodUp: () => void; // Function to handle when user confirms standing up
}

/**
 * TrainingButtons component displays different buttons based on the current state of the training session
 * Shows either:
 * 1. Start Training button when not in training mode
 * 2. Stop and Let's Go/Finish Training buttons when in training mode
 *
 * @param props - Component properties including training state and callback functions
 */
export function TrainingButtons({
    isTraining,
    waitingForConfirmation,
    isGongSequencePlaying,
    isSessionEnded = false,
    startTraining,
    stopTraining,
    handleStoodUp,
}: TrainingButtonsProps) {
    // If in training mode, show Stop and Let's Go/Finish Training buttons
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
                    // Button is disabled unless waiting for confirmation or session has ended
                    disabled={!waitingForConfirmation && !isSessionEnded}
                >
                    {/* Button text changes based on whether the session has ended */}
                    {isSessionEnded ? "Finish Training" : "Let's Go!"}
                </Button>
            </div>
        );
    }

    // If not in training mode, show Start Training button
    return (
        <Button onClick={startTraining} className="w-full">
            Start Training
        </Button>
    );
}

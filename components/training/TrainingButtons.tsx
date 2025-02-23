import { Button } from "@/components/ui/button"

interface TrainingButtonsProps {
  isTraining: boolean
  waitingForConfirmation: boolean
  isGongSequencePlaying: boolean
  startTraining: () => void
  stopTraining: () => void
  handleStoodUp: () => void
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
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
        <Button onClick={handleStoodUp} className="flex-1" disabled={!waitingForConfirmation || isGongSequencePlaying}>
          I Stood Up!
        </Button>
        <Button onClick={stopTraining} variant="destructive" className="flex-1">
          Stop Training
        </Button>
      </div>
    )
  }

  return (
    <Button onClick={startTraining} className="w-full">
      Start Training
    </Button>
  )
}


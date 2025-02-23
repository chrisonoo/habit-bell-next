interface TrainingStatusProps {
  isTraining: boolean
  waitingForConfirmation: boolean
  isSessionEnded: boolean
  isLastInterval: boolean
  countdown: number
  formatTime: (seconds: number) => string
}

export function TrainingStatus({
  isTraining,
  waitingForConfirmation,
  isSessionEnded,
  isLastInterval,
  countdown,
  formatTime,
}: TrainingStatusProps) {
  if (!isTraining) {
    return <div className="text-xl sm:text-2xl font-bold">Ready to start training</div>
  }

  if (waitingForConfirmation) {
    return <div className="text-xl sm:text-2xl font-bold text-yellow-500">Stand up now!</div>
  }

  if (isSessionEnded) {
    return (
      <div className="text-xl sm:text-2xl font-bold text-yellow-500">
        {isLastInterval ? "Complete your last stand!" : "Session ended"}
      </div>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center">
      <div className="text-xl sm:text-2xl font-bold">Next gong in:</div>
      <div className="text-3xl sm:text-4xl font-bold sm:ml-2">{formatTime(countdown)}</div>
    </div>
  )
}


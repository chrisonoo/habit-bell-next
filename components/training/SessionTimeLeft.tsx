interface SessionTimeLeftProps {
  isTraining: boolean
  sessionTimeLeft: number
  formatTime: (seconds: number) => string
}

export function SessionTimeLeft({ isTraining, sessionTimeLeft, formatTime }: SessionTimeLeftProps) {
  return (
    <div className="text-base sm:text-lg">
      {isTraining ? `Session time left: ${formatTime(sessionTimeLeft)}` : "Press 'Start Training' to begin"}
    </div>
  )
}


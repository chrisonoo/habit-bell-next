interface TestGongsProps {
  playTestGong: (gongNumber: 1 | 2 | 3) => void
  audioFailed: boolean
  audioFailed2: boolean
  audioFailed3: boolean
  isTraining: boolean
}

export function TestGongs({ playTestGong, audioFailed, audioFailed2, audioFailed3, isTraining }: TestGongsProps) {
  return (
    <div className="space-y-4">
      <div className="text-base sm:text-lg">Test Gongs</div>
      <div className="flex items-center space-x-4">
        {[1, 2, 3].map((gongNumber) => (
          <button
            key={gongNumber}
            onClick={() => playTestGong(gongNumber as 1 | 2 | 3)}
            disabled={isTraining || (gongNumber === 1 ? audioFailed : gongNumber === 2 ? audioFailed2 : audioFailed3)}
            className={`focus:outline-none ${
              isTraining || (gongNumber === 1 ? audioFailed : gongNumber === 2 ? audioFailed2 : audioFailed3)
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer"
            }`}
          >
            <div className="flex flex-col items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={
                  gongNumber === 1
                    ? audioFailed
                      ? "text-red-500"
                      : "text-green-500"
                    : gongNumber === 2
                      ? audioFailed2
                        ? "text-red-500"
                        : "text-green-500"
                      : audioFailed3
                        ? "text-red-500"
                        : "text-green-500"
                }
              >
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              </svg>
              <span className="text-xs sm:text-sm mt-1">Gong {gongNumber}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}


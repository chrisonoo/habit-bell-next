import { Button } from "@/components/ui/button"

interface ResetButtonProps {
  resetToDefaults: () => void
}

export function ResetButton({ resetToDefaults }: ResetButtonProps) {
  return (
    <Button onClick={resetToDefaults} className="w-full bg-red-500 text-white hover:bg-red-600">
      Reset to Default Settings
    </Button>
  )
}


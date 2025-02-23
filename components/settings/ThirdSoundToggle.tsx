import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface ThirdSoundToggleProps {
  isThirdSoundEnabled: boolean
  setIsThirdSoundEnabled: (value: boolean) => void
  isTraining: boolean
}

export function ThirdSoundToggle({ isThirdSoundEnabled, setIsThirdSoundEnabled, isTraining }: ThirdSoundToggleProps) {
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="third-sound-toggle"
        checked={isThirdSoundEnabled}
        onCheckedChange={setIsThirdSoundEnabled}
        disabled={isTraining}
      />
      <Label htmlFor="third-sound-toggle">Enable Third Sound</Label>
    </div>
  )
}


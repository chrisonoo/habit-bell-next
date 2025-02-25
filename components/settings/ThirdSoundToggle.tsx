import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

/**
 * Interface defining the props for the ThirdSoundToggle component
 * Used to enable or disable the third gong sound in the sequence
 */
interface ThirdSoundToggleProps {
    isThirdSoundEnabled: boolean; // Whether the third sound is currently enabled
    setIsThirdSoundEnabled: (value: boolean) => void; // Function to update the setting
    isTraining: boolean; // Whether training is in progress (disables toggle)
}

/**
 * ThirdSoundToggle component
 * Provides a toggle switch to enable or disable the third gong sound in the sequence
 * The third sound plays after the five repetitions of the second gong
 *
 * @param props - Component properties including current value and setter function
 */
export function ThirdSoundToggle({
    isThirdSoundEnabled,
    setIsThirdSoundEnabled,
    isTraining,
}: ThirdSoundToggleProps) {
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
    );
}

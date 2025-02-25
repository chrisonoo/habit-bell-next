import { Button } from "@/components/ui/button";

/**
 * Interface defining the props for the ResetButton component
 */
interface ResetButtonProps {
    resetToDefaults: () => void; // Function to reset all settings to their default values
}

/**
 * ResetButton component
 * Provides a button to reset all settings to their default values
 * Styled with red background to indicate a destructive action
 *
 * @param resetToDefaults - Function to call when the button is clicked
 */
export function ResetButton({ resetToDefaults }: ResetButtonProps) {
    return (
        <Button
            onClick={resetToDefaults}
            className="w-full bg-red-500 text-white hover:bg-red-600"
        >
            Reset to Default Settings
        </Button>
    );
}

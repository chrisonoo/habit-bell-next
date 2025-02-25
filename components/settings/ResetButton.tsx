import { Button } from "@/components/ui/button";

/**
 * Interface defining the props for the ResetButton component
 */
interface ResetButtonProps {
    resetToDefaults?: () => void; // Function to reset all settings to their default values (old prop name)
    resetSettings?: () => void; // Function to reset all settings to their default values (new prop name)
}

/**
 * ResetButton component
 * Provides a button to reset all settings to their default values
 * Styled with red background to indicate a destructive action
 * Supports both old and new prop naming conventions for backward compatibility
 *
 * @param props - Component properties including reset function
 */
export function ResetButton({
    resetToDefaults,
    resetSettings,
}: ResetButtonProps) {
    // Use new prop name if provided, otherwise fall back to old prop name
    const handleReset = resetSettings || resetToDefaults;

    if (!handleReset) {
        console.error("ResetButton: Missing reset function");
        return null;
    }

    return (
        <Button
            onClick={handleReset}
            className="w-full bg-red-500 text-white hover:bg-red-600"
        >
            Reset to Default Settings
        </Button>
    );
}

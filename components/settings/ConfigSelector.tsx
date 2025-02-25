import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription } from "@/components/ui/card";

/**
 * Interface defining the props for the ConfigSelector component
 * Used to switch between training and pomodoro modes
 */
interface ConfigSelectorProps {
    activeConfig: string; // Current active configuration ("training" or "pomodoro")
    onConfigChange: (value: string) => void; // Callback function when configuration changes
}

/**
 * ConfigSelector component
 * Provides a dropdown menu to switch between training and pomodoro modes
 *
 * @param activeConfig - Current active configuration
 * @param onConfigChange - Callback function when configuration changes
 */
export function ConfigSelector({
    activeConfig,
    onConfigChange,
}: ConfigSelectorProps) {
    /**
     * Handles the configuration change event
     * Logs the change and calls the parent callback function
     *
     * @param value - New configuration value
     */
    const handleConfigChange = (value: string) => {
        console.log(`Changing mode from ${activeConfig} to ${value}`);
        onConfigChange(value);
    };

    return (
        <Card className="mt-8">
            <CardContent className="p-3">
                <CardDescription className="mb-3">
                    Active configuration
                </CardDescription>
                <Select value={activeConfig} onValueChange={handleConfigChange}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select configuration mode" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="pomodoro">Pomodoro Mode</SelectItem>
                        <SelectItem value="training">Training Mode</SelectItem>
                    </SelectContent>
                </Select>
            </CardContent>
        </Card>
    );
}

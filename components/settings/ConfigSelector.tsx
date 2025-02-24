import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription } from "@/components/ui/card";

interface ConfigSelectorProps {
    activeConfig: string;
    onConfigChange: (value: string) => void;
}

export function ConfigSelector({
    activeConfig,
    onConfigChange,
}: ConfigSelectorProps) {
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

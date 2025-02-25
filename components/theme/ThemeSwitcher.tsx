import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

/**
 * ThemeSwitcher component
 * Provides a button to toggle between light and dark themes
 * Uses next-themes for theme management and handles client-side rendering
 */
export function ThemeSwitcher() {
    // State to track if component has mounted (for client-side rendering)
    const [mounted, setMounted] = useState(false);
    // Get current theme and theme setter function from next-themes
    const { theme, setTheme } = useTheme();

    // Set mounted to true after initial render
    useEffect(() => {
        setMounted(true);
    }, []);

    // Don't render anything during SSR to prevent hydration mismatch
    if (!mounted) {
        return null;
    }

    return (
        <button
            // Toggle between light and dark theme when clicked
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle theme"
        >
            {/* Show Sun icon in dark mode, Moon icon in light mode */}
            {theme === "dark" ? (
                <Sun className="h-5 w-5" />
            ) : (
                <Moon className="h-5 w-5" />
            )}
        </button>
    );
}

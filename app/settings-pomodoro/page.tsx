import dynamic from "next/dynamic";

/**
 * Dynamically import the client-side settings component
 * This prevents server-side rendering issues with browser-specific features
 * like localStorage and audio playback
 */
const SettingsPageClient = dynamic(() => import("./SettingsPageClient"), {
    ssr: false,
});

/**
 * Pomodoro Settings Page
 * Renders the client-side settings component for pomodoro mode
 * The actual implementation is in SettingsPageClient.tsx
 */
export default function SettingsPage() {
    return <SettingsPageClient />;
}

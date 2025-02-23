import dynamic from "next/dynamic";

const SettingsPageClient = dynamic(() => import("./SettingsPageClient"), {
    ssr: false,
});

export default function SettingsPage() {
    return <SettingsPageClient />;
}


// This empty layout bypasses the dashboard layout entirely.
// The landing page editor is a full-screen modal experience that manages its own UI.
export default function LandingEditorLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

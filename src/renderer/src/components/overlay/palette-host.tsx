import { CommandPalette } from "@/components/overlay/command-palette";
import { usePaletteSession } from "@/hooks/overlay/use-palette-session";

export function PaletteHost() {
  const { session, endSession, dismiss } = usePaletteSession();

  if (!session) return null;

  return (
    <CommandPalette
      key={session.id}
      initialQuery={session.query}
      onDismiss={dismiss}
      onNavigated={endSession}
    />
  );
}

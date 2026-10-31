import { useSidebar } from "@/components/ui/sidebar";
import { useSidebarStateReport } from "@/hooks/sidebar/use-sidebar-state-report";

/** The window-edge hot zone that reveals the floating nav while the sidebar is collapsed. */
export function HoverRail() {
  const { open } = useSidebar();
  useSidebarStateReport();

  if (open) return null;

  return (
    <div
      aria-hidden
      className="fixed inset-y-0 left-0 z-10 w-2"
      data-slot="hover-rail"
      onPointerEnter={() => window.api.reportGutterHover(true)}
      onPointerLeave={() => window.api.reportGutterHover(false)}
    />
  );
}

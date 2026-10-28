import { useAppMutation } from "@/hooks/use-app-mutation";

export function useTabActions() {
  const createTab = useAppMutation({
    mutationFn: (url?: string) => window.api.createTab(url),
    errorMessage: "Could not open a new tab",
  });
  const closeTab = useAppMutation({
    mutationFn: (id: number) => window.api.closeTab(id),
    errorMessage: "Could not close the tab",
  });
  const activateTab = useAppMutation({
    mutationFn: (id: number) => window.api.activateTab(id),
    errorMessage: "Could not switch tabs",
  });
  const navigateActiveTab = useAppMutation({
    mutationFn: (url: string) => window.api.navigateActiveTab(url),
    errorMessage: "That is not a valid web address",
  });

  return { createTab, closeTab, activateTab, navigateActiveTab };
}

export type SampleTab = {
  id: string;
  title: string;
  url: string;
};

export const SAMPLE_TABS: SampleTab[] = [
  { id: "tab-1", title: "Electron", url: "https://www.electronjs.org" },
  { id: "tab-2", title: "shadcn/ui", url: "https://ui.shadcn.com" },
  { id: "tab-3", title: "TanStack Query", url: "https://tanstack.com/query" },
  { id: "tab-4", title: "Drizzle ORM", url: "https://orm.drizzle.team" },
];

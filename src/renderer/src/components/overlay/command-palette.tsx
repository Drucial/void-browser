import { useDeferredValue, useState } from "react";

import type { NavigateRequest } from "@shared/ipc";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";

import { PALETTE_KEY_HINTS } from "@/components/overlay/constants/key-hints";
import { resolveSubmission } from "@/components/overlay/utils/resolve-submission";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { historyQueries } from "@/hooks/history/history.queries";

type CommandPaletteProps = {
  initialQuery: string;
  onDismiss: () => void;
  onNavigated: () => void;
};

export function CommandPalette({
  initialQuery,
  onDismiss,
  onNavigated,
}: CommandPaletteProps) {
  const [query, setQuery] = useState(initialQuery);
  const [highlightedUrl, setHighlightedUrl] = useState("");
  const deferredQuery = useDeferredValue(query);
  const { data: results = [] } = useQuery({
    ...historyQueries.search(deferredQuery),
    placeholderData: keepPreviousData,
  });
  const navigate = useMutation({
    mutationFn: (request: NavigateRequest) =>
      window.overlayApi.navigate(request),
    onSuccess: onNavigated,
  });

  return (
    <Dialog open onOpenChange={(isOpen) => !isOpen && onDismiss()}>
      <DialogContent
        aria-describedby={undefined}
        className="sm:max-w-2xl"
        showCloseButton={false}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Search history or enter an address</DialogTitle>
        </DialogHeader>
        <Command
          shouldFilter={false}
          value={highlightedUrl}
          onValueChange={setHighlightedUrl}
          onKeyDown={(event) => {
            if (event.key !== "Enter" || event.nativeEvent.isComposing) return;

            event.preventDefault();
            const request = resolveSubmission({
              query,
              results,
              highlightedUrl,
              isNewTab: event.ctrlKey || event.metaKey,
            });
            if (request) navigate.mutate(request);
          }}
        >
          <CommandInput
            aria-label="Search history or enter an address"
            placeholder="Search history or enter an address"
            value={query}
            onFocus={(event) => event.currentTarget.select()}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>No matches</CommandEmpty>
            {results.map((entry) => (
              <CommandItem
                key={entry.id}
                value={entry.url}
                onSelect={() =>
                  navigate.mutate({ url: entry.url, newTab: false })
                }
              >
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate">{entry.title || entry.url}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {entry.url}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandList>
          <div className="text-muted-foreground flex items-center gap-4 border-t px-3 py-2 text-xs">
            {PALETTE_KEY_HINTS.map(({ label, keys }) => (
              <span key={label} className="flex items-center gap-1">
                <KbdGroup>
                  {keys.map((key) => (
                    <Kbd key={key}>{key}</Kbd>
                  ))}
                </KbdGroup>
                {label}
              </span>
            ))}
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

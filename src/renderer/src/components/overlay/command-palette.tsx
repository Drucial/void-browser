import { useState } from "react";

import type { NavigateRequest } from "@shared/ipc";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";

import { PALETTE_KEY_HINTS } from "@/components/overlay/constants/key-hints";
import { getPaletteList } from "@/components/overlay/utils/get-palette-list";
import { resolveSubmission } from "@/components/overlay/utils/resolve-submission";
import {
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { historyQueries } from "@/hooks/history/history.queries";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

const SEARCH_DEBOUNCE_MS = 150;

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
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);
  const search = historyQueries.search(debouncedQuery);
  const isSearchEnabled =
    search.enabled && (initialQuery === "" || query !== initialQuery);
  const { data, isFetching } = useQuery({
    ...search,
    enabled: isSearchEnabled,
    placeholderData: keepPreviousData,
  });
  const searchResults = isSearchEnabled && data ? data : [];
  const isSettled = debouncedQuery === query && !isFetching;
  const {
    results,
    isShown: isListShown,
    hasBody: hasListBody,
    hasNoMatches,
  } = getPaletteList({
    query,
    initialQuery,
    results: searchResults,
    isSettled,
  });
  const navigate = useMutation({
    mutationFn: (request: NavigateRequest) =>
      window.overlayApi.navigate(request),
    onSuccess: onNavigated,
  });

  return (
    <CommandDialog
      open
      className="sm:max-w-2xl"
      showCloseButton={false}
      title="Search history or enter an address"
      commandProps={{
        shouldFilter: false,
        value: highlightedUrl,
        onValueChange: setHighlightedUrl,
        onKeyDown: (event) => {
          if (event.key !== "Enter" || event.nativeEvent.isComposing) return;

          event.preventDefault();
          const request = resolveSubmission({
            query,
            results: isSettled ? results : [],
            highlightedUrl,
            isNewTab: event.ctrlKey || event.metaKey,
          });
          if (request) navigate.mutate(request);
        },
      }}
      onOpenChange={(isOpen) => !isOpen && onDismiss()}
    >
      <CommandInput
        aria-label="Search history or enter an address"
        placeholder="Search history or enter an address"
        value={query}
        onFocus={(event) => event.currentTarget.select()}
        onValueChange={setQuery}
      />
      {isListShown && (
        <>
          {hasListBody && (
            <CommandList className="h-72">
              {hasNoMatches && <CommandEmpty>No matches</CommandEmpty>}
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
          )}
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
        </>
      )}
    </CommandDialog>
  );
}

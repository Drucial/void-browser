import { useState } from "react";

import { resolveAddressInput, SEARCH_ENGINE_NAME } from "@shared/address-input";
import type { NavigateRequest } from "@shared/ipc";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";

import { PALETTE_KEY_HINTS } from "@/components/overlay/constants/key-hints";
import { resolveSubmission } from "@/components/overlay/utils/resolve-submission";
import {
  CommandDialog,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { historyQueries } from "@/hooks/history/history.queries";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

const SEARCH_DEBOUNCE_MS = 150;
const ACTION_ROW_VALUE = "address-action";

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
  const [hasMovedHighlight, setHasMovedHighlight] = useState(false);
  const isUntouched = query === initialQuery;
  const debouncedQuery = useDebouncedValue(
    isUntouched ? "" : query,
    SEARCH_DEBOUNCE_MS
  );
  const typedText = query.trim();
  const { data } = useQuery({
    ...historyQueries.search(typedText ? debouncedQuery : ""),
    placeholderData: keepPreviousData,
  });
  const results = data?.entries ?? [];
  const action = isUntouched ? null : resolveAddressInput(query);
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
        value: action && !hasMovedHighlight ? ACTION_ROW_VALUE : highlightedUrl,
        onValueChange: setHighlightedUrl,
        onKeyDown: (event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            setHasMovedHighlight(true);

            return;
          }
          if (event.key !== "Enter" || event.nativeEvent.isComposing) return;

          event.preventDefault();
          const request = resolveSubmission({
            query,
            results,
            highlightedUrl,
            hasMovedHighlight,
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
        onValueChange={(text) => {
          setQuery(text);
          setHasMovedHighlight(false);
        }}
      />
      <CommandList className="mt-2 h-72">
        {action && (
          <CommandItem
            value={ACTION_ROW_VALUE}
            onSelect={() => navigate.mutate({ url: typedText, newTab: false })}
          >
            <span className="truncate">
              {action.kind === "search"
                ? `Search ${SEARCH_ENGINE_NAME} for “${typedText}”`
                : `Go to ${typedText}`}
            </span>
          </CommandItem>
        )}
        {results.map((entry) => (
          <CommandItem
            key={entry.id}
            value={entry.url}
            onSelect={() => navigate.mutate({ url: entry.url, newTab: false })}
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
      <div className="text-muted-foreground mx-1 flex items-center gap-4 border-t px-3 py-2 text-xs">
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
    </CommandDialog>
  );
}

import { ipcMain } from "electron";
import { z } from "zod";

import type { InvokeContract, SendContract } from "../../shared/ipc";
import { themePreferenceSchema } from "../db/settings";
import { normalizeUrl } from "../tabs/normalize-url";
import type { TabManager } from "../tabs/tab-manager";
import type { ThemeController } from "../theme/theme-controller";

const tabIdSchema = z.number().int().positive();

const urlSchema = z.string().transform((value, ctx) => {
  const url = normalizeUrl(value);
  if (!url)
    ctx.issues.push({ code: "custom", message: "Invalid URL", input: value });

  return url ?? z.NEVER;
});

export const boundsSchema = z.object({
  x: z.number().int(),
  y: z.number().int(),
  width: z.number().int().nonnegative(),
  height: z.number().int().nonnegative(),
});

function handle<
  Channel extends keyof InvokeContract,
  Schema extends z.ZodType<unknown, InvokeContract[Channel]["input"]>,
>(
  channel: Channel,
  schema: Schema,
  run: (input: z.output<Schema>) => InvokeContract[Channel]["output"]
) {
  ipcMain.handle(channel, (_event, payload: unknown) =>
    run(schema.parse(payload))
  );
}

function listen<
  Channel extends keyof SendContract,
  Schema extends z.ZodType<unknown, SendContract[Channel]>,
>(channel: Channel, schema: Schema, run: (payload: z.output<Schema>) => void) {
  ipcMain.on(channel, (_event, payload: unknown) => {
    const parsed = schema.safeParse(payload);
    if (parsed.success) run(parsed.data);
  });
}

export function registerIpcHandlers(tabs: TabManager, theme: ThemeController) {
  handle("tabs:list", z.undefined(), () => tabs.getSnapshot());
  handle("tabs:create", urlSchema.optional(), (url) => tabs.create(url));
  handle("tabs:close", tabIdSchema, (id) => tabs.close(id));
  handle("tabs:activate", tabIdSchema, (id) => tabs.activate(id));
  handle("tabs:navigate", urlSchema, (url) => tabs.navigateActive(url));
  handle("theme:get", z.undefined(), () => theme.getState());
  handle("theme:set", themePreferenceSchema, (preference) =>
    theme.setPreference(preference)
  );
  listen("view:set-bounds", boundsSchema, (bounds) => tabs.setBounds(bounds));
}

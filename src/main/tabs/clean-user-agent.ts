/** Returns `userAgent` without the `Electron/<version>` and `<appName>/<version>` tokens. */
export function cleanUserAgent(userAgent: string, appName: string) {
  return userAgent
    .split(" ")
    .filter(
      (token) =>
        !token.startsWith("Electron/") && !token.startsWith(`${appName}/`)
    )
    .join(" ");
}

let enabled = false;

export function setDebug(v: boolean): void {
  enabled = v;
}

export function isDebug(): boolean {
  return enabled;
}

export function debugLog(action: "read" | "write", path: string): void {
  if (enabled) {
    console.error(`[debug] ${action}: ${path}`);
  }
}

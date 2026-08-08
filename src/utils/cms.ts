export function parseSelectedHrefs(value: unknown): string[] | undefined {
  if (Array.isArray(value)) {
    return value.map(String).filter(Boolean);
  }
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map(String).filter(Boolean);
      }
    } catch {
      // Return undefined if not valid JSON
    }
  }
  return undefined;
}

export function serializeSelectedHrefs(hrefs: string[]): string {
  return JSON.stringify(hrefs);
}

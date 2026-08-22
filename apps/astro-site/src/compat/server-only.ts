// Astro server modules are already excluded from client bundles unless imported
// by a hydrated island. This module mirrors the no-op production entrypoint of
// `server-only` without coupling the public zone to the Next.js runtime.
export {};

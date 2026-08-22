/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly LEGACY_ADMIN_ORIGIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Backend base URL for the experimental /dev/* live-data routes — see src/api.ts. */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

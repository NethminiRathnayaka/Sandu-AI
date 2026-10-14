/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_LLM_API_KEY?: string;
  readonly VITE_FIREBASE_ENABLED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

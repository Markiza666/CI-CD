/// <reference types="vite/client" />

// Interface to extend the ImportMetaEnv object with your custom VITE_ variables
interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string;
}

// Interface to extend the ImportMeta object with the env property
interface ImportMeta {
    readonly env: ImportMetaEnv;
}

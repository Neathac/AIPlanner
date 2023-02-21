import "vite/client";
/// <reference types="vite/client" />

interface ImportMetaEnv {
  NODE_ENV: "development" | "production";
  VITE_APP_AUTH_EMULATOR: String;
  VITE_APP_DATABASE_EMULATOR_PORT: Number;
  VITE_APP_FIRESTORE_EMULATOR_PORT: Number;
  VITE_APP_CLOUD_STORAGE_EMULATOR_PORT: Number;
  VITE_APP_FUNCTIONS_EMULATOR_PORT: Number;

  VITE_APP_EMULATOR_HOST: String;
  VITE_APP_DEV_ENVIRONMENT: Boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
// Dev environment
export const DEV_ENVIRONMENT =
  import.meta.env.VITE_APP_DEV_ENVIRONMENT || false;

/*
    Emulator routes
*/
export const EMULATOR_HOST =
  import.meta.env.VITE_APP_EMULATOR_HOST || "localhost";
export const AUTH_EMULATOR = import.meta.env.VITE_APP_AUTH_EMULATOR || "";
export const DATABASE_EMULATOR_PORT = Number(
  import.meta.env.VITE_APP_DATABASE_EMULATOR_PORT
);
export const FIRESTORE_EMULATOR_PORT = Number(
  import.meta.env.VITE_APP_FIRESTORE_EMULATOR_PORT
);
export const CLOUD_STORAGE_EMULATOR_PORT = Number(
  import.meta.env.VITE_APP_CLOUD_STORAGE_EMULATOR_PORT
);
export const FUNCTIONS_EMULATOR_PORT = Number(
  import.meta.env.VITE_APP_FUNCTIONS_EMULATOR_PORT
);

/*
    Router routes
*/

export const HOME_ROUTE = "/";
export const ABOUT_ROUTE = "/about";
export const PDDL_ROUTE = "/pddl";

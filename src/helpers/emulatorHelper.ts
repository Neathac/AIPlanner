import { connectAuthEmulator, getAuth } from "firebase/auth";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getDatabase, connectDatabaseEmulator } from "firebase/database";
import {
  AUTH_EMULATOR,
  DEV_ENVIRONMENT,
  FUNCTIONS_EMULATOR_PORT,
  CLOUD_STORAGE_EMULATOR_PORT,
  DATABASE_EMULATOR_PORT,
  FIRESTORE_EMULATOR_PORT,
  EMULATOR_HOST,
} from "./consts";

export const initEmulators = (): void => {
  if (DEV_ENVIRONMENT) {
    if (AUTH_EMULATOR) {
      connectAuthEmulator(getAuth(), AUTH_EMULATOR);
    }
    if (DATABASE_EMULATOR_PORT) {
      connectDatabaseEmulator(
        getDatabase(),
        EMULATOR_HOST,
        DATABASE_EMULATOR_PORT
      );
    }
    if (CLOUD_STORAGE_EMULATOR_PORT) {
      connectStorageEmulator(
        getStorage(),
        EMULATOR_HOST,
        CLOUD_STORAGE_EMULATOR_PORT
      );
    }
    if (FUNCTIONS_EMULATOR_PORT) {
      connectFunctionsEmulator(
        getFunctions(),
        EMULATOR_HOST,
        FUNCTIONS_EMULATOR_PORT
      );
    }
    if (FIRESTORE_EMULATOR_PORT) {
      connectFirestoreEmulator(
        getFirestore(),
        EMULATOR_HOST,
        FIRESTORE_EMULATOR_PORT
      );
    }
  }
};

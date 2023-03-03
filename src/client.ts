import { User } from "@functions/systemTypes";
import { FirebaseApp } from "firebase/app";
import {
  Functions,
  getFunctions,
  httpsCallable,
  HttpsCallable,
} from "firebase/functions";
import { DEV_ENVIRONMENT } from "./helpers/consts";

let functions: Functions | undefined;
let _getSelf: HttpsCallable<unknown, unknown>;
let _getAllUsers: HttpsCallable<unknown, unknown>;

export function initClient(app: FirebaseApp) {
  functions = DEV_ENVIRONMENT
    ? getFunctions()
    : getFunctions(app, "europe-west2");
  _getSelf = httpsCallable(functions, "getSelf");
  _getAllUsers = httpsCallable(functions, "getAllUsers");
}

export function getSelf(): Promise<User> {
  return _getSelf().then((result) => result.data as User);
}

export function getAllUsers(): Promise<User[]> {
  return _getAllUsers().then((result) => result.data as User[]);
}

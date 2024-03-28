import { Manager } from "../stores/resourceManager";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import { getSelf } from "../client";
import { store } from "../store";

export async function signin(): Promise<void> {
  // Also possible to import useRouter and store it in data. See About for example
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider).then(() => {
    getSelf().then((u) => {
      if (u) {
        store.me = u;
        Manager.initiateUser();
      }
    });
  });
}

export async function signout(): Promise<void> {
  // Also possible to import useRouter and store it in data. See About for example
  const auth = getAuth();
  return signOut(auth).then(() => {
    Manager.flushUserData();
  });
}

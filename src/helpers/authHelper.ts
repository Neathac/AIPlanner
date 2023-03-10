import { Manager } from "@src/stores/resourceManager";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
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
        store.avatar = u.pic ?? store.avatar;
        Manager.initiateUser();
      }
    });
  });
}

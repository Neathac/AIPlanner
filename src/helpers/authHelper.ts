import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getSelf } from "../client";
import { store } from "../store";

export async function signin(): Promise<void> {
  // Also possible to import useRouter and store it in data. See About for example
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  console.log("I got called");
  return signInWithPopup(auth, provider).then(() =>
    getSelf().then((u) => {
      if (u) {
        store.me = u;
      }
    })
  );
}

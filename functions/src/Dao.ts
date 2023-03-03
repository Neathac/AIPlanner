import {CollectionReference,
  Firestore,
  FirestoreDataConverter,
  Query,
} from "firebase-admin/firestore";
import {UserEntity} from "./Entities";

const firestore = new Firestore();

/**
 * Transforms incoming and outgoing database data
 */
const userEntityConverter:FirestoreDataConverter<UserEntity> = {
  toFirestore: (data: UserEntity) => data,
  fromFirestore: (snap: FirebaseFirestore.QueryDocumentSnapshot) =>
        snap.data() as UserEntity,
};

/**
 * Fetches a user from the database if exists
 * @param {string} uid - The id key by which to find the user
 * @return {Promise<UserEntity | undefined>} - A UserEntity object if found
 */
export async function getUser(uid: string): Promise<UserEntity | undefined> {
  return firestore
      .collection("users")
      .doc(uid)
      .withConverter(userEntityConverter)
      .get().then((ds)=>ds.data());
}

/**
 * Save a user to the database
 * @param {UserEntity} u - A UserEntity object with data to store
 * @return {Promise<void>} - An indicator of how the write operation went
 */
export async function storeUser(u: UserEntity): Promise<void> {
  return firestore.collection("users").doc(u.id).set(u).then();
}

/**
 * Fetches all user entries in the database from users collection
 * @param {number} limit - Limit of entries to fetch
 * @return {Promise<UserEntity[]>} - Found entries
 */
export async function getAllUsers(limit?:number): Promise<UserEntity[]> {
  let query:CollectionReference<UserEntity>|Query<UserEntity> =
     firestore.collection("users")
         .withConverter(userEntityConverter);

  if (limit!=undefined) {
    query = query.limit(limit);
  }
  return query.get().then((a)=>a.docs.map((a)=>a.data()));
}

/**
 * Change a user database entry
 * @param {string} id  - An identifier of which user to change
 * @param {Partial<UserEntity>} user - The new user data object
 * @return {Promise<UserEntity | undefined>} - The chnged User Entity
 */
export async function updateUser(id: string, user: Partial<UserEntity>): Promise<UserEntity | undefined> {
  // Update the user
  await firestore.collection("users").withConverter(userEntityConverter).doc(id).update(user);
  const newUser: UserEntity | undefined = await getUser(id);
  return newUser;
}



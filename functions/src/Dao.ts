import {CollectionReference,
  Firestore,
  FirestoreDataConverter,
  Query,
} from "firebase-admin/firestore";
import {UserEntity, DomainEntity, ProblemEntity} from "./Entities";

const firestore = new Firestore();

export const USERS_COLLECTION = "users";
export const DOMAINS_COLLECTION = "domains";
export const PROBLEMS_COLLECTION = "problems";

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
      .collection(USERS_COLLECTION)
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
  return firestore.collection(USERS_COLLECTION).doc(u.id).set(u).then();
}

/**
 * Fetches all user entries in the database from users collection
 * @param {number} limit - Limit of entries to fetch
 * @return {Promise<UserEntity[]>} - Found entries
 */
export async function getAllUsers(limit?:number): Promise<UserEntity[]> {
  let query:CollectionReference<UserEntity>|Query<UserEntity> =
     firestore.collection(USERS_COLLECTION)
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
  await firestore.collection(USERS_COLLECTION).withConverter(userEntityConverter).doc(id).update(user);
  const newUser: UserEntity | undefined = await getUser(id);
  return newUser;
}

/**
 * Transforms incoming and outgoing database data
 */
const domainEntityConverter:FirestoreDataConverter<DomainEntity> = {
  toFirestore: (data: DomainEntity) => data,
  fromFirestore: (snap: FirebaseFirestore.QueryDocumentSnapshot) =>
        snap.data() as DomainEntity,
};

/**
 * Fetches a domain from the database if exists
 * @param {string} uid - The id key by which to find the domain
 * @return {Promise<DomainEntity | undefined>} - A DomainEntity object if found
 */
export async function getDomain(uid: string): Promise<DomainEntity | undefined> {
  return firestore
      .collection(DOMAINS_COLLECTION)
      .doc(uid)
      .withConverter(domainEntityConverter)
      .get().then((ds)=>ds.data());
}

/**
 * Save a domain to the database
 * @param {DomainEntity} u - A DomainEntity object with data to store
 * @return {Promise<void>} - An indicator of how the write operation went
 */
export async function storeDomain(u: DomainEntity): Promise<void> {
  return firestore.collection(DOMAINS_COLLECTION).doc(u.id).set(u).then();
}

/**
 * Fetches all domain entries in the database from domains collection
 * @param {string} userId - Id of user with domains
 * @param {number} limit - Limit of entries to fetch
 * @return {Promise<DomainEntity[]>} - Found entries
 */
export async function getAllDomainsForUser(userId: string, limit?:number): Promise<DomainEntity[]> {
  let query:CollectionReference<DomainEntity>|Query<DomainEntity> =
     firestore.collection(DOMAINS_COLLECTION).where("id", "==", userId)
         .withConverter(domainEntityConverter);

  if (limit!=undefined) {
    query = query.limit(limit);
  }
  return query.get().then((a)=>a.docs.map((a)=>a.data()));
}

/**
 * Change a domain database entry
 * @param {string} id  - An identifier of which domain to change
 * @param {Partial<DomainEntity>} domain - The new domain data object
 * @return {Promise<DomainEntity | undefined>} - The chnged Domain Entity
 */
export async function updateDomain(id: string, domain: Partial<DomainEntity>): Promise<DomainEntity | undefined> {
  // Update the domain
  await firestore.collection(DOMAINS_COLLECTION).withConverter(domainEntityConverter).doc(id).update(domain);
  const newDomain: DomainEntity | undefined = await getDomain(id);
  return newDomain;
}

/**
 * Delete a Domain database entry
 * @param {string} id  - An identifier of which Domain to delete
 * @return {Promise<void>}
 */
export async function deleteDomain(id: string): Promise<void> {
  // Delete the domain
  await firestore.collection(DOMAINS_COLLECTION).withConverter(domainEntityConverter).doc(id).delete();
  return;
}


/**
 * Transforms incoming and outgoing database data
 */
const problemEntityConverter:FirestoreDataConverter<ProblemEntity> = {
  toFirestore: (data: ProblemEntity) => data,
  fromFirestore: (snap: FirebaseFirestore.QueryDocumentSnapshot) =>
        snap.data() as ProblemEntity,
};

/**
 * Fetches a problem from the database if exists
 * @param {string} uid - The id key by which to find the problem
 * @return {Promise<ProblemEntity | undefined>} - A ProblemEntity object if found
 */
export async function getProblem(uid: string): Promise<ProblemEntity | undefined> {
  return firestore
      .collection(PROBLEMS_COLLECTION)
      .doc(uid)
      .withConverter(problemEntityConverter)
      .get().then((ds)=>ds.data());
}

/**
 * Save a Problem to the database
 * @param {ProblemEntity} u - A ProblemEntity object with data to store
 * @return {Promise<void>} - An indicator of how the write operation went
 */
export async function storeProblem(u: ProblemEntity): Promise<void> {
  return firestore.collection(PROBLEMS_COLLECTION).doc(u.id).set(u).then();
}

/**
 * Fetches all Problem entries in the database from problems collection
 * @param {string} domainId - Id of domain of the problems
 * @param {number} limit - Limit of entries to fetch
 * @return {Promise<ProblemEntity[]>} - Found entries
 */
export async function getAllProblemsForDomain(domainId: string, limit?:number): Promise<ProblemEntity[]> {
  let query:CollectionReference<ProblemEntity>|Query<ProblemEntity> =
     firestore.collection(PROBLEMS_COLLECTION).where("parentDomain", "==", domainId)
         .withConverter(problemEntityConverter);

  if (limit!=undefined) {
    query = query.limit(limit);
  }
  return query.get().then((a)=>a.docs.map((a)=>a.data()));
}

/**
 * Change a Problem database entry
 * @param {string} id  - An identifier of which Problem to change
 * @param {Partial<ProblemEntity>} problem - The new Problem data object
 * @return {Promise<ProblemEntity | undefined>} - The changed Problem Entity
 */
export async function updateProblem(id: string, problem: Partial<ProblemEntity>): Promise<ProblemEntity | undefined> {
  // Update the domain
  await firestore.collection(PROBLEMS_COLLECTION).withConverter(problemEntityConverter).doc(id).update(problem);
  const newProblem: ProblemEntity | undefined = await getProblem(id);
  return newProblem;
}

/**
 * Delete a Problem database entry
 * @param {string} id  - An identifier of which Problem to delete
 * @return {Promise<void>}
 */
export async function deleteProblem(id: string): Promise<void> {
  // Delete the problem
  await firestore.collection(PROBLEMS_COLLECTION).withConverter(problemEntityConverter).doc(id).delete();
  return;
}
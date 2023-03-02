import {CollectionReference,
    Firestore,
    FirestoreDataConverter,
    Query,
  } from "firebase-admin/firestore";
  import {UserEntity} from "./Entities";
  const firestore = new Firestore();
  
  const userEntityConverter:FirestoreDataConverter<UserEntity> = {
    toFirestore: (data: UserEntity) => data,
    fromFirestore: (snap: FirebaseFirestore.QueryDocumentSnapshot) =>
        snap.data() as UserEntity,
  };
  
  export async function getUser(uid: string): Promise<UserEntity | undefined> {
    return firestore
        .collection("users")
        .doc(uid)
        .withConverter(userEntityConverter)
        .get().then((ds)=>ds.data());
  }
  
  export async function storeUser(u: UserEntity): Promise<void> {
    return firestore.collection("users").doc(u.id).set(u).then();
  }
  
  export async function getAllUsers(limit?:number): Promise<UserEntity[]> {
    let query:CollectionReference<UserEntity>|Query<UserEntity> =
     firestore.collection("users")
         .withConverter(userEntityConverter);
  
    if (limit!=undefined) {
      query = query.limit(limit);
    }
    return query.get().then((a)=>a.docs.map((a)=>a.data()));
  }
  
  export async function updateUser(id: string, user: Partial<UserEntity>): Promise<UserEntity | undefined> {
    // Update the user
    await firestore.collection("users").withConverter(userEntityConverter).doc(id).update(user);
    const newUser: UserEntity | undefined = await getUser(id);
    return newUser;
  }
  
  
import * as functions from "firebase-functions";
import * as cors from "cors";
import {toUser} from "./Entities";
import * as Dao from "./Dao";
import {UserRecord} from "firebase-admin/lib/auth/user-record";

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
const corsHandler = cors({origin: true, preflightContinue: false});

const theFunctions = ()=>{
  if (process.env.FUNCTIONS_EMULATOR) return functions;
  else return functions.region("europe-west2");
};

export const onUserCreation = theFunctions()
    .auth.user().onCreate(async (user: UserRecord, context: any) => {
      return Dao.storeUser({
        id: user.uid,
        name: user.displayName??"",
        email: user.email??"",
        pic: user.photoURL,
        docNum: 0,
      }).then(()=>{
        functions.logger.info(`user created ${user.email} `);
      });
    });

export const getSelf = theFunctions()
    .https.onCall(async (_data:void, context: functions.https.CallableContext) => {
      if (!context.auth) {
        // eslint-disable-next-line max-len
        throw new functions.https.HttpsError("unauthenticated", "you need to authenticate");
      }
      const auth = context.auth;
      return Dao.getUser(auth.uid).then(toUser);
    });

export const helloWorld = theFunctions()
    .https.onRequest((request: any, response: any) => {
      corsHandler(request, response, () => {
        functions.logger.info("Hello logs!!", {structuredData: true});
        response.send("Hello from Firebase!");
      });
    });

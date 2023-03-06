import * as functions from "firebase-functions";
import * as cors from "cors";
import {toDomain, toDomainEntity, toProblem, toProblemEntity, toUser} from "./Entities";
import * as Dao from "./Dao";
import {UserRecord} from "firebase-admin/lib/auth/user-record";
import {User, Domain, Problem} from "../shared/systemTypes";
import {uniqueId} from "lodash";

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
        domainIds: [],
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

export const updateUser = theFunctions()
    .https.onCall(async (data: Partial<User>, context) => {
      if (data.id) {
        return Dao.updateUser(data.id, data).then((toUser));
      } else if (context.auth) {
        return Dao.updateUser(context.auth?.uid, data).then(toUser);
      } else {
        throw new functions.https.HttpsError("unauthenticated", "you need to authenticate");
      }
    });

export const createDomain = theFunctions().https.onCall(async (data:Domain, context: functions.https.CallableContext) => {
  if (!context.auth) {
    // eslint-disable-next-line max-len
    throw new functions.https.HttpsError("unauthenticated", "you need to authenticate");
  }

  return Dao.getUser(context.auth.uid).then((user) => {
    if (!user) throw new functions.https.HttpsError("not-found", "User not found in the database");

    const uuid = uniqueId();
    user.docNum += 1;
    user.domainIds.push(uuid);
    Dao.updateUser(user.id, user);
    data.id = uuid;
    return Dao.storeDomain(toDomainEntity(data)).then(() => {
      return Dao.getDomain(uuid).then(toDomain);
    });
  });
});

export const getDomain = theFunctions()
    .https.onCall(async (data:string, context: functions.https.CallableContext) => {
      if (!context.auth) {
        // eslint-disable-next-line max-len
        throw new functions.https.HttpsError("unauthenticated", "you need to authenticate");
      }
      return Dao.getUser(context.auth.uid).then((user) => {
        if (user && user.domainIds.includes(data)) return Dao.getDomain(data).then(toDomain);
        else throw new functions.https.HttpsError("not-found", "User does not have access to domain");
      });
    });

export const getDomainProblems = theFunctions()
    .https.onCall(async (data: string, context: functions.https.CallableContext) => {
      if (!context.auth) {
        // eslint-disable-next-line max-len
        throw new functions.https.HttpsError("unauthenticated", "you need to authenticate");
      }
      return Dao.getUser(context.auth.uid).then((user) => {
        if (!user) throw new functions.https.HttpsError("internal", "Authenticated user does not correspond to a database entry");
        if (!user.domainIds.includes(data)) throw new functions.https.HttpsError("permission-denied", "User does not have access to the specified domain");
        return Dao.getAllProblemsForDomain(data).then(problemEntities => problemEntities.map(entity => toProblem(entity)));
      });
    });

export const getMyDomains = theFunctions()
    .https.onCall(async (_data: void, context: functions.https.CallableContext) => {
      if (!context.auth) {
        // eslint-disable-next-line max-len
        throw new functions.https.HttpsError("unauthenticated", "you need to authenticate");
      }
      return Dao.getAllDomainsForUser(context.auth.uid).then(domainEntities => domainEntities.map(entity => toDomain(entity)));
    });

export const updateDomain = theFunctions()
    .https.onCall(async (data: Partial<Domain>, context: functions.https.CallableContext) => {
      if (!context.auth) {
        // eslint-disable-next-line max-len
        throw new functions.https.HttpsError("unauthenticated", "you need to authenticate");
      }
      return Dao.getUser(context.auth.uid).then((user) => {
        if (!data.id) throw new functions.https.HttpsError("invalid-argument", "Domain id not provided");
        if (!user?.domainIds.includes(data.id)) throw new functions.https.HttpsError("not-found", "User does not have access to domain");
        return Dao.updateDomain(data.id, data).then((toDomain));
      });
    });

export const createProblem = theFunctions().https.onCall(async (_data:Problem, context: functions.https.CallableContext) => {
  if (!context.auth) {
    // eslint-disable-next-line max-len
    throw new functions.https.HttpsError("unauthenticated", "you need to authenticate");
  }

  if (!_data.parentDomain) {
    // eslint-disable-next-line max-len
    throw new functions.https.HttpsError("invalid-argument", "Problem needs to be associated with a domain");
  }

  return Dao.getUser(context.auth.uid).then((user) => {
    if (!user) throw new functions.https.HttpsError("not-found", "User not found in the database");
    if (!user.domainIds.includes(_data.parentDomain)) throw new functions.https.HttpsError("not-found", "User does not have access to the domain");

    return Dao.getDomain(_data.parentDomain).then((domain) => {
      if (!domain) throw new functions.https.HttpsError("not-found", "Domain not found in the database");
      const uuid = uniqueId();
      _data.id = uuid;
      domain.associatedProblems.push(uuid);
      user.docNum += 1;
      Dao.updateDomain(domain.id, domain);
      Dao.updateUser(user.id, user);
      return Dao.storeProblem(toProblemEntity(_data)).then(() => {
        return Dao.getProblem(uuid).then(toProblem);
      });
    });
  });
});

export const getProblem = theFunctions()
    .https.onCall(async (data:string, context: functions.https.CallableContext) => {
      if (!context.auth) {
        // eslint-disable-next-line max-len
        throw new functions.https.HttpsError("unauthenticated", "you need to authenticate");
      }
      return Dao.getUser(context.auth.uid).then((user) => {
        return Dao.getProblem(data).then((problem) => {
          if (user && problem && user.domainIds.includes(problem.parentDomain)) return toProblem(problem);
          else throw new functions.https.HttpsError("not-found", "User does not have access to problem");
        });
      });
    });

export const updateProblem = theFunctions()
    .https.onCall(async (data: Partial<Problem>, context: functions.https.CallableContext) => {
      if (!context.auth) {
        // eslint-disable-next-line max-len
        throw new functions.https.HttpsError("unauthenticated", "you need to authenticate");
      }
      return Dao.getUser(context.auth.uid).then((user) => {
        if (!data.id) throw new functions.https.HttpsError("invalid-argument", "Problem id not provided");
        Dao.getProblem(data.id).then((problem) => {
          if (problem && !user?.domainIds.includes(problem.parentDomain)) throw new functions.https.HttpsError("not-found", "User does not have access to problem");
        });

        return Dao.updateProblem(data.id, data).then((toProblem));
      });
    });

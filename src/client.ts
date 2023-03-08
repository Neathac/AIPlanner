import { Problem, User, Domain } from "@functions/systemTypes";
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
let _createDomain: HttpsCallable<unknown, unknown>;
let _getDomain: HttpsCallable<unknown, unknown>;
let _getMyDomains: HttpsCallable<unknown, unknown>;
let _getDomainProblems: HttpsCallable<unknown, unknown>;
let _updateDomain: HttpsCallable<unknown, unknown>;
let _deleteDomain: HttpsCallable<unknown, unknown>;
let _createProblem: HttpsCallable<unknown, unknown>;
let _getProblem: HttpsCallable<unknown, unknown>;
let _updateProblem: HttpsCallable<unknown, unknown>;
let _deleteProblem: HttpsCallable<unknown, unknown>;

export function initClient(app: FirebaseApp) {
  functions = DEV_ENVIRONMENT
    ? getFunctions()
    : getFunctions(app, "europe-west2");
  _getSelf = httpsCallable(functions, "getSelf");
  _getAllUsers = httpsCallable(functions, "getAllUsers");
  _createDomain = httpsCallable(functions, "createDomain");
  _getDomain = httpsCallable(functions, "getDomain");
  _getMyDomains = httpsCallable(functions, "getMyDomains");
  _getDomainProblems = httpsCallable(functions, "getDomainProblems");
  _updateDomain = httpsCallable(functions, "updateDomain");
  _deleteDomain = httpsCallable(functions, "deleteDomain");
  _createProblem = httpsCallable(functions, "createProblem");
  _getProblem = httpsCallable(functions, "getProblem");
  _updateProblem = httpsCallable(functions, "updateProblem");
  _deleteProblem = httpsCallable(functions, "deleteProblem");
}

export function getSelf(): Promise<User> {
  return _getSelf().then((result) => result.data as User);
}

export function getAllUsers(): Promise<User[]> {
  return _getAllUsers().then((result) => result.data as User[]);
}

export function createDomain(domain: Domain): Promise<Domain> {
  return _createDomain(domain).then((result) => result.data as Domain);
}

export function getDomain(domainId: string): Promise<Domain> {
  return _getDomain(domainId).then((result) => result.data as Domain);
}

export function getMyDomains(): Promise<Array<Domain>> {
  return _getMyDomains().then((result) => result.data as Array<Domain>);
}

export function getDomainProblems(domainId: string): Promise<Array<Problem>> {
  return _getDomainProblems(domainId).then(
    (result) => result.data as Array<Problem>
  );
}

export function deleteDomain(domainId: string): Promise<void> {
  return _deleteDomain(domainId).then();
}

export function updateDomain(domain: Partial<Domain>): Promise<Domain> {
  return _updateDomain(domain).then((result) => result.data as Domain);
}

export function createProblem(problem: Problem): Promise<Problem> {
  return _createProblem(problem).then((result) => result.data as Problem);
}

export function getProblem(problemId: string): Promise<Problem> {
  return _getProblem(problemId).then((result) => result.data as Problem);
}

export function updateProblem(problem: Partial<Problem>): Promise<Problem> {
  return _updateProblem(problem).then((result) => result.data as Problem);
}

export function deleteProblem(problem: Problem): Promise<void> {
  return _deleteProblem(problem).then();
}

import { emptyPddlDocument } from "@functions/parserTypes";
import { Domain, Problem, User } from "@functions/systemTypes";
import {
  createDomain,
  createProblem,
  getDomain,
  getDomainProblems,
  getMyDomains,
  getProblem,
  getSelf,
  updateDomain,
  updateProblem,
} from "@src/client";
import { NEW_DOMAIN } from "@src/helpers/consts";
import { loadActiveDomain } from "@src/languageSupport/decomposer/domainLoader";
import editorFactory from "@src/languageSupport/nodeFactory/nodeFactory";
import nodeFactory from "@src/languageSupport/nodeFactory/nodeFactory";
import EventBus from "@src/lib/EventBus";
import { store } from "@src/store";
import { useDocumentStore } from "./documentStore";
import { useDomainStore } from "./domainStore";
import { useNodeStore } from "./nodeStore";
import { useProblemStore } from "./problemStore";

export interface resourceManager {
  /**
   * A server call getter
   * Stores the incoming info in localstorage
   * @async
   * @return {Promise<User>} - Returns users own object
   */
  getSelf(): Promise<User>;

  /**
   * Creates a new domain
   * @async
   * @param {Domain} domain - A domain with filled in basic info
   * @return {Promise<Domain>} - Resulting object corresponds to the values stored in the DB, mainly the generated id
   */
  createDomain(domain: Domain): Promise<Domain>;

  /**
   * Getter of a specific domain
   * Stores it in localstorage
   * Called in tandem with getDomainProblems
   * @async
   * @param {string} domainId - Id by which to find the domain
   * @return {Promise<Domain>} - A domain object from the DB
   */
  getDomain(domainId: string): Promise<Domain>;

  /**
   * Getter of all problems of specifc domain
   * @async
   * @param {string} domainId - Id of problem parent domain
   * @return {Promise<Array<Problem>>} - An array of found problems
   */
  getDomainProblems(domainId: string): Promise<Array<Problem>>;

  /**
   * Getter of all domains available to the user
   * @async
   * @return {Promise<Array<Domain>>} - All domains available to me
   */
  getMyDomains(): Promise<Array<Domain>>;

  /**
   * Updates a domain
   * @async
   * @param {Partial<Domain>} domain - The updated Domain object
   * @return {Promise<Domain>} - Updated domain
   */
  updateDomain(domain: Partial<Domain>): Promise<Domain>;

  /**
   * Selects a domain
   * @param {Domain} domain - The Domain to select
   */
  selectDomain(domain: Domain): void;

  /**
   * Creates a new problem in a given domain
   * Always called in tandem with getDomain
   * @async
   * @param {Problem} problem - The problem with its initial info
   * @return {Promise<Problem>} - A problem object corresponding to a database entry
   */
  createProblem(problem: Problem): Promise<Problem>;

  /**
   * A problem getter
   * @async
   * @param {string} problemId - Id of problem to fetch from the database
   * @return {Promise<Problem>} - A problem from the database
   */
  getProblem(problemId: string): Promise<Problem>;

  /**
   * Updates a problem
   * @async
   * @param {Partial<Problem>} problem - The changed problem including its id
   * @return {Promise<Problem>} - An updated problem
   */
  updateProblem(problem: Partial<Problem>): Promise<Problem>;

  /**
   * Sets up the user info
   * @async
   * @param {User} user - User which to set up
   */
  initiateUser(user: User): Promise<void>;

  /**
   * Deletes a domain
   * @async
   * @param {string} domainId - Id of domain to delete
   */
  deleteDomain(domainId: string): Promise<void>;

  /**
   * Deletes a problem
   * @async
   * @param {string} problemId - Id of problem to delete
   */
  deleteProblem(problemId: string): Promise<void>;
}

export class resourceManagerClass implements resourceManager {
  async getSelf(): Promise<User> {
    return getSelf().then((user) => {
      store.me = user;
      return user;
    });
  }

  async createDomain(domain: Domain): Promise<Domain> {
    return createDomain(domain).then((newDomain) => {
      useDocumentStore().appendDomains(newDomain, []);
      useDocumentStore().setActiveDomain(newDomain.id);
      useDomainStore().loadActiveDomain(emptyPddlDocument(), "");
      useNodeStore().loadActiveEditorState(nodeFactory().save());
      return newDomain;
    });
  }

  async getDomain(domainId: string): Promise<Domain> {
    const domain = useDocumentStore().getDomainById(domainId);
    if (domain) {
      if (
        domain.associatedProblems.length !==
        useDocumentStore().getProblemsByDomainId(domain.id).length
      ) {
        return getDomainProblems(domain.id).then((problems) => {
          useDocumentStore().setDomainProblems(domain.id, problems);
          return domain;
        });
      } else {
        return domain;
      }
    } else {
      return getDomain(domainId).then(async (domain) => {
        return getDomainProblems(domainId).then((problems) => {
          useDocumentStore().appendDomains(domain, problems);
          useDocumentStore().setActiveDomain(domain.id);
          useDomainStore().loadActiveDomain(
            loadActiveDomain(domain.rawDomain),
            domain.rawDomain
          );
          return domain;
        });
      });
    }
  }

  async getMyDomains(): Promise<Domain[]> {
    if (
      store.me.domainIds.length !==
      useDocumentStore().getAvailableDomains.length
    ) {
      return getMyDomains().then((domains) => {
        useDocumentStore().overrideDomains(domains);
        return domains;
      });
    } else return useDocumentStore().getAvailableDomains;
  }

  async updateDomain(domain: Partial<Domain>): Promise<Domain> {
    return updateDomain(domain).then((newDomain) => {
      return getDomainProblems(newDomain.id).then((problems) => {
        useDocumentStore().modifyDomain(newDomain);
        useDocumentStore().setDomainProblems(newDomain.id, problems);
        return newDomain;
      });
    });
  }

  async createProblem(problem: Problem): Promise<Problem> {
    return createProblem(problem).then((problem) => {
      return getDomain(problem.parentDomain).then((domain) => {
        useDocumentStore().modifyDomain(domain);
        useDocumentStore().appendDomainProblems(problem);
        useProblemStore().loadActiveProblem(emptyPddlDocument(), "");
        return problem;
      });
    });
  }

  async getProblem(problemId: string): Promise<Problem | undefined> {
    const problem = useDocumentStore().getActiveProblemById(problemId);
    if (problem) {
      useProblemStore().loadActiveProblem(
        loadActiveDomain(problem.rawProblem),
        problem.rawProblem
      );
      return problem;
    } else if (
      useDocumentStore().getActiveDomain.associatedProblems.includes(
        problemId
      ) ||
      useDocumentStore().getAvailableDomains.find((domain) =>
        domain.associatedProblems.includes(problemId)
      )
    ) {
      return getProblem(problemId).then((problem) => {
        useDocumentStore().appendDomainProblems(problem);
        useProblemStore().loadActiveProblem(
          loadActiveDomain(problem.rawProblem),
          problem.rawProblem
        );
        return problem;
      });
    } else return undefined;
  }

  async updateProblem(problem: Partial<Problem>): Promise<Problem> {
    return updateProblem(problem).then((newProblem) => {
      useDocumentStore().appendDomainProblems(newProblem);
      useProblemStore().loadActiveProblem(
        loadActiveDomain(problem.rawProblem),
        problem.rawProblem
      );
      return newProblem;
    });
  }

  async initiateUser(): Promise<void> {
    getMyDomains().then((domains) => {
      useDocumentStore().overrideDomains(domains);
    });
    return;
  }

  async getDomainProblems(domainId: string): Promise<Array<Problem>> {
    if (
      useDocumentStore().getProblemsByDomainId(domainId).length !==
      useDocumentStore().getDomainById(domainId).associatedProblems.length
    )
      return getDomainProblems(domainId).then((res) => {
        useDocumentStore().setDomainProblems(domainId, res);
        return res;
      });
    else return useDocumentStore().getProblemsByDomainId(domainId);
  }

  async deleteDomain(domainId: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async deleteProblem(problemid: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

  selectDomain(domain: Domain): void {
    useDocumentStore().setActiveDomain(domain.id);
    useDomainStore().loadActiveDomain(
      loadActiveDomain(domain.rawDomain),
      domain.rawDomain
    );
    useNodeStore().loadActiveEditorState(
      JSON.parse(domain.dckState) ?? editorFactory()
    );
    store.activeDomain = domain.rawDomain;
    EventBus.emit(NEW_DOMAIN);
  }
}

export const Manager = new resourceManagerClass();

import { Domain, Problem } from "@functions/systemTypes";
import { defineStore } from "pinia";

export const useDocumentStore = defineStore("documentStore", {
  state: () => ({
    domains: [] as Array<Domain>,
    problems: {} as Map<string, Array<Problem>>,
    activeDomain: "",
  }),
  getters: {
    getAvailableDomains: (state) => state.domains,
    getDomainById: (state) => {
      return (domainId: string) =>
        state.domains.find((domain) => domain.id == domainId);
    },
    getActiveDomain: (state) =>
      state.domains.find((domain) => state.activeDomain == domain.id),
    getActiveProblems: (state) => state.problems.get(state.activeDomain),
    getActiveProblemById: (state) => {
      return (problemId: string) =>
        state.problems
          .get(state.activeDomain)
          .find((problem) => problem.id == problemId);
    },
    getProblemsByDomainId: (state) => {
      return (domainId: string) => state.problems.get(domainId);
    },
  },
  actions: {
    appendDomains(domain: Domain, problems: Array<Problem>) {
      const foundDomain = (this.domains as Array<Domain>).findIndex(
        (val) => val.id == domain.id
      );
      if (foundDomain == -1) (this.domains as Array<Domain>).push(domain);
      else (this.domains as Array<Domain>)[foundDomain] = domain;
      (this.problems as Map<string, Array<Problem>>).set(domain.id, problems);
      if (this.activeDomain == "") this.activeDomain = domain.id;
    },
    setActiveDomain(domainId: string) {
      if ((this.problems as Map<string, Array<Problem>>).has(domainId))
        this.activeDomain = domainId;
    },
    setDomainProblems(domainId: string, problems: Array<Problem>) {
      (this.problems as Map<string, Array<Problem>>).set(domainId, problems);
    },
    modifyDomain(domain: Domain) {
      const index = (this.domains as Array<Domain>).findIndex(
        (val) => domain.id === val.id
      );
      if (index > -1) (this.domains as Array<Domain>)[index] = domain;
      else {
        (this.domains as Array<Domain>).push(domain);
        (this.problems as Map<string, Array<Problem>>).set(domain.id, []);
      }
    },
    overrideDomains(domains: Domain[]) {
      this.domains = [];
      this.problems = {};
      for (const domain of domains) {
        this.domains.push(domain);
        this.problems.set(domain.id, []);
      }
    },

    appendDomainProblems(problem: Problem) {
      if (this.problems.has(problem.parentDomain)) {
        const foundProblem = (this.problems as Map<string, Array<Problem>>)[
          problem.parentDomain
        ].findIndex((val: Problem) => val.id == problem.id);
        if (foundProblem > -1)
          (this.problems as Map<string, Array<Problem>>)[problem.parentDomain][
            foundProblem
          ] = problem;
        else
          (this.problems as Map<string, Array<Problem>>)[
            problem.parentDomain
          ].push(problem);
      }
    },
  },
});

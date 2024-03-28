import { Domain, Problem } from "@functions/systemTypes";
import { defineStore } from "pinia";

export const useDocumentStore = defineStore("documentStore", {
  state: () => ({
    domains: [] as Array<Domain>,
    //problems: new Map<string, Array<Problem>>(),
    problems: JSON.stringify(Array.from(new Map<string, Array<Problem>>())),
    activeDomain: "",
    activeProblem: "",
  }),
  getters: {
    getAvailableDomains: (state) => state.domains,
    getDomainById: (state) => {
      return (domainId: string) =>
        state.domains.find((domain) => domain.id == domainId);
    },
    getActiveDomain: (state) =>
      state.domains.find((domain) => state.activeDomain == domain.id),
    getActiveProblems: (state) => {
      const problems: Map<string, Array<Problem>> = new Map(
        JSON.parse(state.problems)
      );
      return problems.get(state.activeDomain);
    },
    getActiveProblemById: (state) => {
      const problems: Map<string, Array<Problem>> = new Map(
        JSON.parse(state.problems)
      );
      return (problemId: string) =>
        problems
          .get(state.activeDomain)
          .find((problem) => problem.id == problemId);
    },
    getProblemsByDomainId: (state) => {
      const problems: Map<string, Array<Problem>> = new Map(
        JSON.parse(state.problems)
      );
      return (domainId: string) => problems.get(domainId);
    },
  },
  actions: {
    appendDomains(domain: Domain, problems: Array<Problem>) {
      const stateProblems: Map<string, Array<Problem>> = new Map(
        JSON.parse(this.problems)
      );
      const foundDomain = (this.domains as Array<Domain>).findIndex(
        (val) => val.id == domain.id
      );
      if (foundDomain == -1) (this.domains as Array<Domain>).push(domain);
      else this.domains[foundDomain] = domain;
      stateProblems.set(domain.id, problems);
      if (this.activeDomain == "") this.activeDomain = domain.id;
      this.problems = JSON.stringify(Array.from(stateProblems));
    },
    setActiveDomain(domainId: string) {
      const stateProblems: Map<string, Array<Problem>> = new Map(
        JSON.parse(this.problems)
      );
      if (stateProblems.has(domainId)) this.activeDomain = domainId;
      this.problems = JSON.stringify(Array.from(stateProblems));
    },
    setDomainProblems(domainId: string, problems: Array<Problem>) {
      const stateProblems: Map<string, Array<Problem>> = new Map(
        JSON.parse(this.problems)
      );
      stateProblems.set(domainId, problems);
      this.problems = JSON.stringify(Array.from(stateProblems));
    },
    modifyDomain(domain: Domain) {
      const stateProblems: Map<string, Array<Problem>> = new Map(
        JSON.parse(this.problems)
      );
      const index = (this.domains as Array<Domain>).findIndex(
        (val) => domain.id === val.id
      );
      if (index > -1) (this.domains as Array<Domain>)[index] = domain;
      else {
        (this.domains as Array<Domain>).push(domain);
        stateProblems.set(domain.id, []);
      }
      this.problems = JSON.stringify(Array.from(stateProblems));
    },

    modifyActiveProblem(problem: Problem) {
      const problems: Map<string, Array<Problem>> = new Map(
        JSON.parse(this.problems)
      );
      const found = problems
        .get(this.activeDomain)
        .findIndex((prob) => prob.id == problem.id);
      problems.get(this.activeDomain)[found] = problem;
      this.problems = JSON.stringify(Array.from(problems));
    },

    overrideDomains(domains: Domain[]) {
      this.domains = [];
      const problems = new Map<string, Array<Problem>>();
      for (const domain of domains) {
        this.domains.push(domain);
        problems.set(domain.id, []);
      }
      this.problems = JSON.stringify(Array.from(problems));
    },

    appendDomainProblems(problem: Problem) {
      const stateProblems: Map<string, Array<Problem>> = new Map(
        JSON.parse(this.problems)
      );
      console.log(stateProblems);
      if (stateProblems.has(problem.parentDomain)) {
        const foundProblem = stateProblems
          .get(problem.parentDomain)
          .findIndex((val: Problem) => val.id == problem.id);
        if (foundProblem > -1)
          stateProblems.get(problem.parentDomain)[foundProblem] = problem;
        else stateProblems.get(problem.parentDomain).push(problem);
      }
      this.problems = JSON.stringify(Array.from(stateProblems));
    },

    removeProblem(problem: Problem) {
      const index = (this.problems as Map<string, Array<Problem>>)[
        problem.parentDomain
      ].findIndex((val: Problem) => problem.id == val.id);
      if (index > -1)
        (this.problems as Map<string, Array<Problem>>)[
          problem.parentDomain
        ].splice(index, 1);
    },

    removeDomain(domainId: string) {
      const stateProblems: Map<string, Array<Problem>> = new Map(
        JSON.parse(this.problems)
      );
      stateProblems.delete(domainId);
      const index = (this.domains as Array<Domain>).findIndex(
        (dom) => dom.id == domainId
      );
      if (index > -1) (this.domains as Array<Domain>).splice(index, 1);
      this.problems = JSON.stringify(Array.from(stateProblems));
    },
  },
});

import { defineStore } from "pinia";
import {
  PddlDocument,
  emptyAttributedDCK,
  Action,
  Predicate,
  AttributedMemory,
  AttributedState,
  AttributedTransition,
  emptyAttributedInitRule,
  AttributedInitRule,
} from "@functions/parserTypes";
import { Domain } from "@functions/systemTypes";

export const useAtbStore = defineStore("atbStore", {
  state: () => ({
    dck: emptyAttributedDCK(),
  }),
  getters: {
    getDCKstates: (state) => state.dck.states,
    getDCKmemory: (state) => state.dck.memory,
    getDCKtransitions: (state) => state.dck.transitions,
    getDomain: (state) => state.dck.domain,
    getStatesNames: (state) => {
      const names = [];
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Object.entries(state.dck.states).forEach(([_, val]) =>
        names.push(val.name)
      );
      return names;
    },
    getDCKrules: (state) => state.dck.initRules,
    getDCKprologInit: (state) => state.dck.prologDomainInit,
  },
  actions: {
    loadFreshActiveDomain(pddlDomain: PddlDocument) {
      this.dck = emptyAttributedDCK();
      this.dck.domain.name = pddlDomain.name;
      this.dck.domain.predicates = pddlDomain.predicates;
      this.dck.domain.operators = pddlDomain.actions;
    },
    loadNewDomainOperators(actions: Action[]) {
      this.dck.domain.operators = actions;
    },
    loadNewDomainPredicates(predicates: Predicate[]) {
      this.dck.domain.predicates = predicates;
    },
    loadNewDckStates(predicates: AttributedState[]) {
      this.dck.states = predicates;
    },
    loadNewDckMemory(memory: AttributedMemory[]) {
      this.dck.memory = memory;
    },
    loadNewDckTransitions(transitions: AttributedTransition[]) {
      this.dck.transitions = transitions;
    },
    getSpecificInitRule(rulePredicate: string) {
      let found = this.dck.initRules.find(
        (val) => val.rulePredicate.name == rulePredicate
      );
      if (!found) {
        found = emptyAttributedInitRule();
        found.rulePredicate.name = rulePredicate;
        this.dck.initRules.push(found);
      }
      return found;
    },
    loadSpecificInitRule(rulePredicate: AttributedInitRule) {
      let found = this.dck.initRules.findIndex(
        (val) => val.rulePredicate.name == rulePredicate
      );
      if (found < 0) {
        this.dck.initRules.push(rulePredicate);
        found = this.dck.initRules.findIndex(
          (val) => val.rulePredicate.name == rulePredicate
        );
      }
      return this.dck.initRules[found];
    },
    loadNewDckRules(rules: AttributedInitRule[]) {
      this.dck.initRules = rules;
    },
    loadFreshDck(domain: Domain) {
      this.dck = domain.atbDck;
    },
    loadPrologInit(code: string) {
      this.dck.prologDomainInit = code;
    },
  },
});

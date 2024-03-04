import { defineStore } from "pinia";
import {
  PddlDocument,
  emptyAttributedDCK,
  Action,
  Predicate,
  AttributedMemory,
  AttributedState,
  AttributedTransition,
} from "@functions/parserTypes";

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
  },
});

import { defineStore } from "pinia";
import {
  PddlDocument,
  emptyAttributedDCK,
  AttributedDCK,
  Action,
  Predicate,
  AttributedMemory,
  AttributedState,
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
  },
});

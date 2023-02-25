import { defineStore } from "pinia";
import {
  emptyPddlDocument,
  PddlDocument,
  Action,
  Predicate,
} from "@functions/parserTypes";

export const useDomainStore = defineStore("domainStore", {
  state: () => ({
    rawDomain: ``,
    structuredDomain: emptyPddlDocument(),
  }),
  getters: {
    getStructure: (state) => state.structuredDomain,
    getRawValue: (state) => state.rawDomain,
    getActions: (state) => {
      const actions: { [key: string]: Action } = {};
      Object.entries(state.structuredDomain.actions).forEach(([, value]) => {
        actions[value.name] = value;
      });
      return actions;
    },
    getPredicates: (state) => {
      const predicates: Map<string, Predicate> = new Map<string, Predicate>();
      Object.entries(state.structuredDomain.predicates).forEach(
        ([, object]) => {
          if (object.rawPredicate) {
            predicates.set(object.rawPredicate, object);
          }
        }
      );
      return predicates;
    },
    getGoalifiedPredicates: (state) => {
      const predicates: Map<string, Predicate> = new Map<string, Predicate>();
      Object.entries(state.structuredDomain.predicates).forEach(
        ([, object]) => {
          if (object.rawPredicate) {
            const newObject = Object.assign({}, object);
            newObject.rawPredicate =
              object.rawPredicate.slice(0, 1) +
              "G" +
              object.rawPredicate.slice(1);

            predicates.set(newObject.rawPredicate, newObject);
          }
        }
      );
      return predicates;
    },
    getPredicatesByName: (state) => {
      const predicates: Map<string, Predicate> = new Map<string, Predicate>();
      Object.entries(state.structuredDomain.predicates).forEach(
        ([, object]) => {
          if (object.rawPredicate) {
            predicates.set(object.name, object);
          }
        }
      );
      return predicates;
    },
  },
  actions: {
    loadDomain(pddlDomain: PddlDocument, rawDomain: string) {
      this.rawDomain = rawDomain;
      this.structuredDomain = pddlDomain;
    },
    loadRawDomain(rawDomain: string) {
      this.rawDomain = rawDomain;
    },
  },
});

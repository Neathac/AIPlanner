import { defineStore } from "pinia";
import {
  emptyPddlDocument,
  PddlDocument,
  Action,
  Predicate,
} from "@functions/parserTypes";

export const useDomainStore = defineStore("domainStore", {
  state: () => ({
    rawActiveDomain: ``,
    structuredActiveDomain: emptyPddlDocument(),
  }),
  getters: {
    getStructure: (state) => state.structuredActiveDomain,
    getRawValue: (state) => state.rawActiveDomain,
    getActions: (state) => {
      const actions: { [key: string]: Action } = {};
      Object.entries(state.structuredActiveDomain.actions).forEach(
        ([, value]) => {
          actions[value.name] = value;
        }
      );
      return actions;
    },
    getPredicates: (state) => {
      const predicates: Map<string, Predicate> = new Map<string, Predicate>();
      Object.entries(state.structuredActiveDomain.predicates).forEach(
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
      Object.entries(state.structuredActiveDomain.predicates).forEach(
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
      Object.entries(state.structuredActiveDomain.predicates).forEach(
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
    loadActiveDomain(pddlDomain: PddlDocument, rawActiveDomain: string) {
      this.rawActiveDomain = rawActiveDomain;
      this.structuredActiveDomain = pddlDomain;
    },
    loadRawActiveDomain(rawActiveDomain: string) {
      this.rawActiveDomain = rawActiveDomain;
    },
  },
});

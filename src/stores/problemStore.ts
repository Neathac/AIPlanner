import { defineStore } from "pinia";
import {
  emptyPddlDocument,
  PddlDocument,
  Action,
  Predicate,
} from "@functions/parserTypes";

export const useProblemStore = defineStore("problemStore", {
  state: () => ({
    rawActiveProblem: ``,
    structuredActiveProblem: emptyPddlDocument(),
  }),
  getters: {
    getStructure: (state) => state.structuredActiveProblem,
    getRawValue: (state) => state.rawActiveProblem,
    getPredicates: (state) => {
      const predicates: Map<string, Predicate> = new Map<string, Predicate>();
      Object.entries(state.structuredActiveProblem.predicates).forEach(
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
      Object.entries(state.structuredActiveProblem.predicates).forEach(
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
      Object.entries(state.structuredActiveProblem.predicates).forEach(
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
    loadActiveProblem(pddlProblem: PddlDocument, rawActiveProblem: string) {
      this.rawActiveDomain = rawActiveProblem;
      this.structuredActiveDomain = pddlProblem;
    },
    loadRawActiveProblem(rawActiveProblem: string) {
      this.rawActiveDomain = rawActiveProblem;
    },
  },
});

import { defineStore } from "pinia";
import {
  emptyPddlProblemDocument,
  PddlProblemDocument,
} from "@functions/parserTypes";

export const useProblemStore = defineStore("problemStore", {
  state: () => ({
    rawActiveProblem: ``,
    structuredActiveProblem: emptyPddlProblemDocument(),
  }),
  getters: {
    getStructure: (state) => state.structuredActiveProblem,
    getRawValue: (state) => state.rawActiveProblem,
  },
  actions: {
    loadActiveProblem(
      pddlProblem: PddlProblemDocument,
      rawActiveProblem: string
    ) {
      this.rawActiveProblem = rawActiveProblem;
      this.structuredActiveProblem = pddlProblem;
    },
    loadRawActiveProblem(rawActiveProblem: string) {
      this.rawActiveProblem = rawActiveProblem;
    },
  },
});

import { NOBODY } from "@functions/systemTypes";
import { reactive } from "vue";
import { CHILDSNACK_PROBLEM_TEST, CHILDSNACK_TEST } from "./helpers/consts";

export const store = reactive({
  me: NOBODY,
  activeDomain: CHILDSNACK_TEST,
  activeProblem: CHILDSNACK_PROBLEM_TEST,
});

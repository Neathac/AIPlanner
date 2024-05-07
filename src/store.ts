import { NOBODY } from "@functions/systemTypes";
import { reactive } from "vue";
import {
  ADVANCED_BLOCKSWORLD_PROBLEM_TEST,
  ADVANCED_BLOCKSWORLD_TEST,
} from "./helpers/consts";

export const store = reactive({
  me: NOBODY,
  activeDomain: ADVANCED_BLOCKSWORLD_TEST,
  activeProblem: ADVANCED_BLOCKSWORLD_PROBLEM_TEST,
});

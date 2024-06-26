import {
  ActionModification,
  AttributedMemory,
  AttributedState,
  EMPTY_OPERATOR,
  Predicate,
} from "@functions/parserTypes";
import { useAtbStore } from "../../stores/atbStore";

export function decomposeStringToVariables(varString: String): string[] {
  return varString
    .trim()
    .split(",")
    .filter((val) => val != "")
    .map((str) => str.trim());
}

export function composeVariablesToString(variables: string[]): String {
  return variables.join(",");
}

export function dummyVariableString(numOfVars: number): String {
  if (numOfVars === 0) return "";
  let str = "";
  for (let i = 0; i < numOfVars; i++) {
    str += "?var_" + i + ", ";
  }
  return str.substring(0, str.length - 2);
}

export function findOverlap(arr1: string[], arr2: string[]): string[] {
  const result = new Array<string>();
  const temp = arr2.join(", ");
  arr1.forEach((str) => {
    if (temp.includes(str)) result.push(str);
  });
  return result;
}

export function getRawPredicate(name: string, variableString: String): string {
  if (variableString === "") return name;
  return "(" + name + " " + variableString + ")";
}

export function getRawPredicateFromArray(
  name: string,
  variables: String[]
): string {
  if (variables.length < 1) return "(" + name + ")";
  return "(" + name + " " + variables.join(" ") + ")";
}

export const gatherPredicateModifications = (): Map<string, Predicate> => {
  const result = new Map<string, Predicate>();
  useAtbStore().getDCKmemory.forEach((memPred) => {
    if (!memPred.omitFromProblem)
      result.set(memPred.name, getPredicateFromAttributedMemory(memPred));
  });
  useAtbStore().getDCKstates.forEach((atbPred) => {
    result.set(atbPred.name, getPredicateFromAttributedState(atbPred));
  });
  return result;
};

export const getPredicateFromAttributedState = (
  state: AttributedState
): Predicate => {
  return {
    name: state.name,
    varNames:
      state.specificVars ??
      decomposeStringToVariables(dummyVariableString(state.numOfVars)),
    rawPredicate: getRawPredicateFromArray(
      state.name,
      state.specificVars ??
        decomposeStringToVariables(dummyVariableString(state.numOfVars))
    ),
  };
};

export const getPredicateFromAttributedMemory = (
  state: AttributedMemory
): Predicate => {
  return {
    name: state.name,
    varNames:
      state.specificVars ??
      decomposeStringToVariables(dummyVariableString(state.numOfVars)),
    rawPredicate: getRawPredicateFromArray(
      state.name,
      state.specificVars ??
        decomposeStringToVariables(dummyVariableString(state.numOfVars))
    ),
  };
};

export const getPredicateFromNameAndVars = (
  name: string,
  variables: string[]
): Predicate => {
  return {
    name: name,
    varNames: variables,
    rawPredicate: getRawPredicateFromArray(name, variables),
  };
};

export const negatePredicate = (
  predicate: Predicate,
  negate: boolean
): Predicate => {
  if (!negate) return predicate;
  if (!predicate.rawPredicate) return predicate;
  predicate.rawPredicate = "(not " + predicate.rawPredicate + ")";
  return predicate;
};

export const gatherActionModification = (): ActionModification[] => {
  const result: ActionModification[] = [];
  useAtbStore().getDCKtransitions.forEach((trans) => {
    const preconditions: Predicate[] = [];
    const effects: Predicate[] = [];
    let parameters: string[] = [];
    // Positive state transition preconditions and effects
    preconditions.push(getPredicateFromAttributedState(trans.originState));
    effects.push(getPredicateFromAttributedState(trans.targetState));
    // Take care of transition to same state
    if (trans.originState.name != trans.targetState.name) {
      effects.push(
        negatePredicate(
          getPredicateFromAttributedState(trans.originState),
          true
        )
      );
      preconditions.push(
        negatePredicate(
          getPredicateFromAttributedState(trans.targetState),
          true
        )
      );
    }
    // Populate extra parameters
    if (trans && trans.constraints)
      trans.constraints.forEach((cons) => {
        cons.variables.forEach((variable) => parameters.push(variable));
      });
    if (trans.originState.specificVars)
      trans.originState.specificVars.forEach((variable) =>
        parameters.push(variable)
      );
    else
      dummyVariableString(trans.originState.numOfVars)
        .split(",")
        .forEach((variable) => parameters.push(variable));
    if (trans.targetState.specificVars)
      trans.targetState.specificVars.forEach((variable) =>
        parameters.push(variable)
      );
    else
      dummyVariableString(trans.targetState.numOfVars)
        .split(",")
        .forEach((variable) => parameters.push(variable));
    trans.operator.parameters.varName.forEach((variable) =>
      parameters.push(variable)
    );
    let tempPars = "";
    parameters.forEach((parameter) => {
      if (!tempPars.includes(parameter.trim()))
        tempPars += parameter.trim() + " ";
    });
    parameters = tempPars.split(" ");
    // Extra constraint effects and preconditions
    trans.constraints.forEach((cons) => {
      if (cons.isInEffect) {
        effects.push(
          negatePredicate(
            getPredicateFromNameAndVars(cons.predicate, cons.variables),
            cons.negated
          )
        );
      } else {
        preconditions.push(
          negatePredicate(
            getPredicateFromNameAndVars(cons.predicate, cons.variables),
            cons.negated
          )
        );
      }
    });
    result.push({
      actionName: trans.operator.name,
      extraPreconditions: preconditions,
      extraEffects: effects,
      extraParameters: parameters,
      originalOperator: trans.operator,
    });
  });
  return result;
};

export const assembleActionReplacements = (
  modifications: ActionModification[]
): Array<{ original: string; redefinition: string }> => {
  const result: Array<{ original: string; redefinition: string }> = new Array<{
    original: string;
    redefinition: string;
  }>();
  const mappedModifications: Map<string, string> = new Map<string, string>();

  modifications.forEach((mod, index) => {
    let joinedPreconditions: string = "";
    mod.extraPreconditions.forEach((val) => {
      if (val.rawPredicate) joinedPreconditions += val.rawPredicate;
    });
    let joinedEffects: string = "";
    mod.extraEffects.forEach((val) => {
      if (val.rawPredicate) joinedEffects += val.rawPredicate;
    });
    const newEffect = mod.originalOperator.effect.toString().includes("(and")
      ? mod.originalOperator.effect
          .toString()
          .substring(
            0,
            mod.originalOperator.effect.toString().indexOf("(and") + 4
          ) +
        joinedEffects +
        mod.originalOperator.effect
          .toString()
          .substring(mod.originalOperator.effect.toString().indexOf("(and") + 4)
      : "(and" + joinedEffects + mod.originalOperator.effect + ")";
    const newParameters: string[] = [];
    mod.originalOperator.parameters.varName.forEach((val, ind) => {
      let tmp = val;
      if (mod.originalOperator.parameters.types.length > ind)
        tmp += " " + mod.originalOperator.parameters.types[ind].name;
      newParameters.push(tmp);
    });
    mod.extraParameters.forEach((val, _) => {
      if (!mod.originalOperator.parameters.varName.includes(val))
        newParameters.push(val);
    });
    const assembledDckAction =
      "\n(:action DCK_" +
      mod.originalOperator.name +
      "_" +
      index +
      " \n\t:parameters " +
      "(" +
      newParameters.join(" ") +
      ")" +
      " \n\t:precondition (and" +
      joinedPreconditions +
      mod.originalOperator.preconditions +
      ") \n\t:effect " +
      newEffect +
      ")\n";
    if (mappedModifications.has(mod.originalOperator.rawText))
      mappedModifications.set(
        mod.originalOperator.rawText,
        mappedModifications.get(mod.originalOperator.rawText) +
          assembledDckAction
      );
    else if (mod.originalOperator.name != EMPTY_OPERATOR)
      mappedModifications.set(mod.originalOperator.rawText, assembledDckAction);
    else mappedModifications.set(EMPTY_OPERATOR + index, assembledDckAction);
  });
  for (const [key, value] of mappedModifications) {
    result.push({ original: key, redefinition: value });
  }
  return result;
};

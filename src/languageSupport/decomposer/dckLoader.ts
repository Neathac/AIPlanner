import {
  ActionModification,
  AttributedMemory,
  AttributedState,
  Predicate,
} from "@functions/parserTypes";
import { useAtbStore } from "../../stores/atbStore";

export function decomposeStringToVariables(varString: String): string[] {
  return varString.trim().split(",");
}

export function composeVariablesToString(variables: string[]): String {
  return variables.join(", ");
}

export function dummyVariableString(numOfVars: number): String {
  if (numOfVars === 0) return "";
  let str = "";
  for (let i = 0; i < numOfVars; i++) {
    str += "?var_" + i + ", ";
  }
  return str.substring(0, str.length - 2);
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
    varNames: decomposeStringToVariables(dummyVariableString(state.numOfVars)),
    rawPredicate: getRawPredicateFromArray(
      state.name,
      decomposeStringToVariables(dummyVariableString(state.numOfVars))
    ),
  };
};

export const getPredicateFromAttributedMemory = (
  state: AttributedMemory
): Predicate => {
  return {
    name: state.name,
    varNames: decomposeStringToVariables(dummyVariableString(state.numOfVars)),
    rawPredicate: getRawPredicateFromArray(
      state.name,
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
    preconditions.push(getPredicateFromAttributedState(trans.originState));
    effects.push(
      negatePredicate(getPredicateFromAttributedState(trans.originState), true)
    );
    effects.push(getPredicateFromAttributedState(trans.targetState));
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
    mod.extraPreconditions.forEach((val) => {
      if (val.rawPredicate) joinedEffects += val.rawPredicate;
    });
    const assembledDckAction =
      "\n(:action DCK_" +
      mod.originalOperator.name +
      "_" +
      index +
      " \n\t:parameters " +
      mod.originalOperator.parameters.rawParameters +
      " \n\t:preconditions (and" +
      joinedPreconditions +
      mod.originalOperator.preconditions +
      ") \n\t:effect (and" +
      joinedEffects +
      mod.originalOperator.effect +
      "))\n";
    if (mappedModifications.has(mod.originalOperator.rawText))
      mappedModifications.set(
        mod.originalOperator.rawText,
        mappedModifications.get(mod.originalOperator.rawText) +
          assembledDckAction
      );
    else
      mappedModifications.set(mod.originalOperator.rawText, assembledDckAction);
  });
  for (const [key, value] of mappedModifications) {
    result.push({ original: key, redefinition: value });
  }
  return result;
};

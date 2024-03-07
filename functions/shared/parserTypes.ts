export interface PddlProblemDocument {
  name: string;
  parentDomain: string;
  objects: ProblemObject[];
  init: Predicate[];
  goal: LogicalExpression | Predicate | string;
}

export const emptyPddlProblemDocument = (): PddlProblemDocument => ({
  name: "",
  parentDomain: "",
  objects: new Array<ProblemObject>(),
  init: new Array<Predicate>(),
  goal: "",
});

export interface PddlDocument {
    name: string;
    types?: PddlType[];
    predicates: Predicate[];
    actions: Action[];
  }

export interface ProblemObject {
  variables: string[];
  types?: PddlType[];
}

export interface Domain {
  name: "",
  predicates: Predicate[],
  operators: Action[],
}

export const emptyDomain = (): Domain => ({
  name: "",
  predicates: new Array<Predicate>(),
  operators: new Array<Action>(),
});

export interface Predicate {
    name: string;
    varNames: string[];
    types?: PddlType[];
    rawPredicate?: string;
  }

export interface Action {
    name: string;
    parameters: Parameters;
    preconditions: LogicalExpression | Predicate | string;
    effect: LogicalExpression | Predicate | string;
  }

export interface Parameters {
    types?: PddlType[];
    varName: string[];
    rawParameters?: string;
  }

export interface PddlType {
    name: string;
    subType?: PddlType;
  }

export interface LogicalExpression {
    operator: "and" | "or" | "imply" | "not";
    logicalArguments: LogicalExpression[];
    predicateArguments: Predicate[];
  }

export interface StateNodeValues {
    name: string;
    variables: string[];
  }

export interface ActionModifications {
    actionName: string;
    extraPreconditions: Predicate[];
    extraEffects: Predicate[];
  }

export const emptyActionModifications = (): ActionModifications => ({
  actionName: "",
  extraPreconditions: new Array<Predicate>(),
  extraEffects: new Array<Predicate>(),
});

export const emptyPddlDocument = (): PddlDocument => ({
  name: "",
  types: new Array<PddlType>(),
  predicates: new Array<Predicate>(),
  actions: new Array<Action>(),
});

export const emptyAction = (): Action => ({
  name: "",
  parameters: {varName: [], types: [], rawParameters: ""},
  preconditions: "",
  effect: "",
});

export const emptyPredicate = (): Predicate => ({
  name: "",
  varNames: [],
  types: [],
  rawPredicate: "",
});

export const emptyStateVals = (): StateNodeValues => ({
  name: "",
  variables: [],
});

export const emptyProblemObject = (): ProblemObject => ({
  variables: [],
  types: [],
});

export const negatePredicate = (predicate: string): string => {
  if (predicate.startsWith("(not ")) {
    return predicate.substring(4, predicate.length - 1);
  } else if (predicate.startsWith("eff(not ")) {
    return "eff" + predicate.substring(7, predicate.length - 1);
  } else if (predicate.startsWith("eff")) {
    return "eff(not " + predicate.substring(3, predicate.length) + ")";
  } else {
    return "(not " + predicate + ")";
  }
};

export const wrapPredicateInEffect = (predicate: string): string => {
  return "eff" + predicate;
};

export const removeEffectPrefix = (predicate: string): string => {
  if (predicate.startsWith("eff")) {
    return predicate.substring(3, predicate.length);
  }
  return predicate;
};

export const getPredicateFromString = (predicate: string): Predicate => {
  const values = predicate
      .replaceAll("(", " ")
      .replaceAll(")", " ")
      .split(" ")
      .filter((element) => {
        return element !== "";
      });
  const newPredicate = emptyPredicate();
  let index = 0;
  if (values[index] === "eff") {
    index += 1;
  }
  if (values[index] === "not") {
    index += 1;
  }
  newPredicate.rawPredicate = predicate;
  newPredicate.name = values[index];
  index += 1;
  let isTypeNext = false;
  for (let i = index; i < values.length; ++i) {
    if (values[i] === "-") {
      isTypeNext = true;
    } else if (!isTypeNext && values[i].startsWith("?")) {
      newPredicate.varNames.push(values[i]);
    } else {
      isTypeNext = false;
    }
  }
  return newPredicate;
};

export interface AttributedDCK {
  domain: Domain,
  states: AttributedState[],
  memory: AttributedMemory[],
  transitions: AttributedTransition[],
}

export const emptyAttributedDCK = (): AttributedDCK => ({
  domain: emptyDomain(),
  states: new Array<AttributedState>(),
  memory: new Array<AttributedMemory>(),
  transitions: new Array<AttributedTransition>(),
});

export interface AttributedState {
  name: string,
  numOfVars: number,
  specificVars?: string[],
}

export const emptyAttributedState = (): AttributedState => ({
  name: "",
  numOfVars: 0,
});

export interface AttributedMemory {
  name: string,
  numOfVars: number,
  specificVars?: string[],
}

export const emptyAttributedMemory = (): AttributedMemory => ({
  name: "",
  numOfVars: 0,
});

export interface AttributedTransition {
  originState: AttributedState,
  targetState: AttributedState,
  operator: Action,
  constraints: AttributedConstraint[],
}

export const emptyAttributedTransition = (): AttributedTransition => ({
  originState: emptyAttributedState(),
  targetState: emptyAttributedState(),
  operator: emptyAction(),
  constraints: new Array<AttributedConstraint>(),
});

export interface AttributedConstraint {
  predicate: string,
  variables: string[],
  negated: boolean,
}

export const emptyAttributedConstraint = (): AttributedConstraint => ({
  predicate: "",
  variables: [],
  negated: false,
});

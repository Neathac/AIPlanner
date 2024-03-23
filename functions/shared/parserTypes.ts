export interface PddlProblemDocument {
  name: string;
  parentDomain: string;
  rawObjects: string;
  objects: ProblemObject[];
  rawInit: string;
  init: Predicate[];
  rawGoal: string;
  goal: Array<LogicalExpression>;
}

export const emptyPddlProblemDocument = (): PddlProblemDocument => ({
  name: "",
  parentDomain: "",
  rawObjects: "",
  objects: new Array<ProblemObject>(),
  rawInit: "",
  init: new Array<Predicate>(),
  rawGoal: "",
  goal: new Array<LogicalExpression>(),
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
    rawText: string;
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
    predicateArguments: Predicate[];
    rawExpression: string;
    hasParent: boolean,
    parentIndex: number,
  }

export const emptyLogicalExpression = (): LogicalExpression => ({
  operator: "and",
  predicateArguments: new Array<Predicate>(),
  rawExpression: "",
  hasParent: false,
  parentIndex: -1,
});

export interface StateNodeValues {
    name: string;
    variables: string[];
  }

export interface ActionModification {
    actionName: string;
    extraPreconditions: Predicate[];
    extraEffects: Predicate[];
    extraParameters: string[];
    originalOperator: Action;
  }

export const emptyActionModification = (): ActionModification => ({
  actionName: "",
  extraPreconditions: new Array<Predicate>(),
  extraEffects: new Array<Predicate>(),
  extraParameters: new Array<string>(),
  originalOperator: emptyAction(),
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
  rawText: "",
});

export const EMPTY_OPERATOR = "empty_operator";

export const emptyNoOperator = (): Action => ({
  name: EMPTY_OPERATOR,
  parameters: {varName: [], types: [], rawParameters: ""},
  preconditions: "",
  effect: "",
  rawText: "",
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
  initRules: AttributedInitRule[],
}

export const emptyAttributedDCK = (): AttributedDCK => ({
  domain: emptyDomain(),
  states: new Array<AttributedState>(),
  memory: new Array<AttributedMemory>(),
  transitions: new Array<AttributedTransition>(),
  initRules: new Array<AttributedInitRule>(),
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
  omitFromProblem: boolean,
}

export const emptyAttributedMemory = (): AttributedMemory => ({
  name: "",
  numOfVars: 0,
  omitFromProblem: false,
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
  operator: emptyNoOperator(),
  constraints: new Array<AttributedConstraint>(),
});

export interface AttributedConstraint {
  predicate: string,
  variables: string[],
  negated: boolean,
  isInEffect: boolean,
}

export const POSSIBLE_PROLOG_FUNCTIONS = ["count", "max", "min"];

export interface PrologFunction {
  variable: string;
  operator: "count" | "max" | "min" ;
  predicateArguments: RulePredicate[];
  selectionVars: string[];
}

export const emptyPrologFunction = (): PrologFunction => ({
  variable: "?x",
  operator: "count",
  predicateArguments: new Array<RulePredicate>(),
  selectionVars: new Array<string>(),
});

export const NOT_EQUAL_CONSTRAINT = "DCK_not_equal";
export const EQUAL_CONSTRAINT = "DCK_equal";

export const notEqualConstraint = (): AttributedConstraint => ({
  predicate: NOT_EQUAL_CONSTRAINT,
  variables: ["?x", "?y"],
  negated: false,
  isInEffect: false,
});

export const equalConstraint = (): AttributedConstraint => ({
  predicate: EQUAL_CONSTRAINT,
  variables: ["?x", "?y"],
  negated: false,
  isInEffect: false,
});

export const emptyAttributedConstraint = (): AttributedConstraint => ({
  predicate: "",
  variables: [],
  negated: false,
  isInEffect: false,
});

export interface AttributedInitRule {
  rulePredicate: RulePredicate,
  orClause: LogicalOrRule[],
  hasSimpleValue: boolean,
  simpleDefaultValue?: boolean,
}

export const emptyAttributedInitRule = (): AttributedInitRule => ({
  rulePredicate: emptyRulePredicate(),
  orClause: [],
  hasSimpleValue: true,
  simpleDefaultValue: false,
});

export interface LogicalOrRule {
  anyVariables: string[],
  andClause: RulePredicate[],
  prologFunctions: PrologFunction[],
}

export const emptyLogicalOrRule = (): LogicalOrRule => ({
  anyVariables: [],
  andClause: new Array<RulePredicate>(),
  prologFunctions: new Array<PrologFunction>(),
});

export interface RulePredicate {
  name: string;
  varNames: string[];
  negated: boolean;
  isInGoal: boolean;
  isInInitial: boolean;
}

export const emptyRulePredicate = (): RulePredicate => ({
  name: "",
  varNames: [],
  negated: false,
  isInGoal: false,
  isInInitial: false,
});

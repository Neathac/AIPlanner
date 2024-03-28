import { getDocumentSyntaxTree } from "../parser/language";
import { SyntaxNodeRef } from "@lezer/common";
import {
  ActionModification,
  EMPTY_OPERATOR,
  emptyAction,
  emptyLogicalExpression,
  emptyNoOperator,
  emptyPddlDocument,
  emptyPddlProblemDocument,
  emptyPredicate,
  emptyProblemObject,
  PddlDocument,
  PddlProblemDocument,
  Predicate,
} from "@functions/parserTypes";
import { useDomainStore } from "../../stores/domainStore";
import {
  assembleActionReplacements,
  gatherActionModification,
  gatherPredicateModifications,
} from "./dckLoader";
import { getProblemDocumentSyntaxTree } from "../problemParser/language";
import { useProblemStore } from "../../stores/problemStore";
import {
  composeProblemKnowledgeBase,
  encodePredicateDefaults,
  getConsultResult,
} from "./prologLoader";
import { useAtbStore } from "../../stores/atbStore";

const NAME = "NAME";
const PARAMETERS = "Parameters";
const PREDICATE = "Predicate";
const VARIABLE = "VARIABLE";
const TYPE = "TYPE";
const DOMAIN_GROUP = "DomainGroup";
const DOMAIN_NAME_GROUP = "DomainNameGroup";
const DOMAIN_ACTION_GROUP = "DomainActionGroup";
const DOMAIN_PREDICATES_GROUP = "DomainPredicatesGroup";
const PREDICATES_SECTION = "PREDICATES_SECTION";
const PREDICATE_NAME = "PredicateName";
const OBJECT_NAME = "ObjectName";
const ACTION_SECTION = "ACTION_SECTION";
const ACTION_PARAMETERS_SUBGROUP = "ActionParametersSubgroup";
const ACTION_PRECONDITION_SUBGROUP = "ActionPreconditionSubgroup";
const PRECONDITION_CONTENT = "PreconditionContent";
const ACTION_EFFECT_SUBGROUP = "ActionEffectSubgroup";
const EFFECT_CONTENT = "EffectContent";
const PROBLEM_GROUP = "ProblemGroup";
const PROBLEM_NAME_GROUP = "ProblemNameGroup";
const PROBLEM_OBJECTS_GROUP = "ProblemObjectsGroup";
const PROBLEM_INIT_GROUP = "ProblemInitGroup";
const PROBLEM_DOMAIN_GROUP = "ProblemDomainGroup";
const PROBLEM_GOAL_GROUP = "ProblemGoalGroup";
const INIT_PREDICATE = "InitPredicate";
const INIT_VARIABLES = "InitVariables";
const LOGICAL_EXPRESSION = "LogicalExpression";
const CLAUSE_OPERATOR = "CLAUSE_OPERATOR";
const NOT_OPERATOR = "NOT_OPERATOR";
const IMPLY_OPERATOR = "IMPLY_OPERATOR";

export const loadActiveProblem = (problemCode: string): PddlProblemDocument => {
  const tree = getProblemDocumentSyntaxTree(problemCode);
  const problem: PddlProblemDocument = emptyPddlProblemDocument();
  let currentGroup: string;
  let isInGroup = false;
  let initAmount: number;
  let objectAmount: number;
  let sameTypeVars = 0;
  let activeLogicalExpressionParent = 0;

  tree.iterate({
    enter: (node: SyntaxNodeRef) => {
      const foundName = node.type.name;
      if (isInGroup) {
        if (foundName === PROBLEM_GROUP) {
          isInGroup = false;
        } else {
          switch (currentGroup) {
            case PROBLEM_NAME_GROUP:
              switch (foundName) {
                case NAME:
                  problem.name = getNodeValue(problemCode, node);
                  break;
                default:
                  break;
              }
              break;
            case PROBLEM_DOMAIN_GROUP:
              switch (foundName) {
                case NAME:
                  problem.parentDomain = getNodeValue(problemCode, node);
                  break;
                default:
                  break;
              }
              break;
            case PROBLEM_OBJECTS_GROUP:
              switch (foundName) {
                case NAME:
                  problem.objects[objectAmount].variables.push(
                    getNodeValue(problemCode, node)
                  );
                  break;
                case TYPE:
                  problem.objects[objectAmount].types.push({
                    name: getNodeValue(problemCode, node),
                  });
                  objectAmount = problem.objects.push(emptyProblemObject()) - 1;
                  break;
                default:
                  break;
              }
              break;
            case PROBLEM_INIT_GROUP:
              switch (foundName) {
                case INIT_PREDICATE:
                  initAmount = problem.init.push(emptyPredicate()) - 1;
                  problem.init[initAmount].rawPredicate = getNodeValue(
                    problemCode,
                    node
                  );
                  sameTypeVars = 0;
                  break;
                case PREDICATE_NAME:
                  problem.init[initAmount].name = getNodeValue(
                    problemCode,
                    node
                  );
                  break;
                case INIT_VARIABLES:
                  getNodeValue(problemCode, node)
                    .split(" ")
                    .forEach((val) => {
                      problem.init[initAmount].varNames.push(val);
                      sameTypeVars += 1;
                    });

                  break;
                case TYPE:
                  while (sameTypeVars > 0) {
                    problem.init[initAmount].types?.push({
                      name: getNodeValue(problemCode, node),
                    });
                    sameTypeVars -= 1;
                  }
                  break;
              }
              break;
            case PROBLEM_GOAL_GROUP:
              if (
                foundName === LOGICAL_EXPRESSION &&
                !(
                  getNodeValue(problemCode, node).startsWith("(and") ||
                  getNodeValue(problemCode, node).startsWith("(or") ||
                  getNodeValue(problemCode, node).startsWith("(not") ||
                  getNodeValue(problemCode, node).startsWith("(imply")
                )
              )
                break;
              switch (foundName) {
                case LOGICAL_EXPRESSION:
                  if (problem.goal.length > 1) {
                    // Check if current expression still has the same parent
                    // If not, try the parent of the current parent
                    while (
                      !problem.goal[
                        activeLogicalExpressionParent
                      ].rawExpression.includes(getNodeValue(problemCode, node))
                    ) {
                      activeLogicalExpressionParent =
                        problem.goal[activeLogicalExpressionParent].parentIndex;
                    }
                  }
                  // Add new logical expression and link it to parent
                  problem.goal.push(emptyLogicalExpression());
                  problem.goal[problem.goal.length - 1].parentIndex =
                    activeLogicalExpressionParent;
                  problem.goal[problem.goal.length - 1].hasParent = true;
                  problem.goal[problem.goal.length - 1].rawExpression =
                    getNodeValue(problemCode, node);
                  activeLogicalExpressionParent = problem.goal.length - 1;
                  // First expression has no parent
                  if (problem.rawGoal === "") {
                    problem.rawGoal = getNodeValue(problemCode, node);
                    problem.goal[problem.goal.length - 1].parentIndex = -1;
                    problem.goal[problem.goal.length - 1].hasParent = false;
                  }
                  break;
                case CLAUSE_OPERATOR:
                  if (getNodeValue(problemCode, node).includes("and"))
                    problem.goal[activeLogicalExpressionParent].operator =
                      "and";
                  else
                    problem.goal[activeLogicalExpressionParent].operator = "or";
                  break;
                case NOT_OPERATOR:
                  problem.goal[activeLogicalExpressionParent].operator = "not";
                  break;
                case IMPLY_OPERATOR:
                  problem.goal[activeLogicalExpressionParent].operator =
                    "imply";
                  break;
                case PREDICATE:
                  if (problem.rawGoal === "") {
                    problem.rawGoal = getNodeValue(problemCode, node);
                    problem.goal.push(emptyLogicalExpression());
                    problem.goal[problem.goal.length - 1].rawExpression =
                      getNodeValue(problemCode, node);
                    problem.goal[
                      problem.goal.length - 1
                    ].predicateArguments.push(emptyPredicate());
                    problem.goal[problem.goal.length - 1].predicateArguments[
                      activeLogicalExpressionParent
                    ].rawPredicate = getNodeValue(problemCode, node);
                  } else {
                    // Check if current expression still has the same parent
                    // If not, try the parent of the current parent
                    while (
                      !problem.goal[
                        activeLogicalExpressionParent
                      ].rawExpression.includes(getNodeValue(problemCode, node))
                    ) {
                      activeLogicalExpressionParent =
                        problem.goal[activeLogicalExpressionParent].parentIndex;
                    }
                    problem.goal[
                      activeLogicalExpressionParent
                    ].predicateArguments.push(emptyPredicate());
                    problem.goal[
                      activeLogicalExpressionParent
                    ].predicateArguments[
                      problem.goal[activeLogicalExpressionParent]
                        .predicateArguments.length - 1
                    ].rawPredicate = getNodeValue(problemCode, node);
                  }
                  break;
                case PREDICATE_NAME:
                  problem.goal[
                    activeLogicalExpressionParent
                  ].predicateArguments[
                    problem.goal[activeLogicalExpressionParent]
                      .predicateArguments.length - 1
                  ].name = getNodeValue(problemCode, node);
                  break;
                case OBJECT_NAME:
                  problem.goal[
                    activeLogicalExpressionParent
                  ].predicateArguments[
                    problem.goal[activeLogicalExpressionParent]
                      .predicateArguments.length - 1
                  ].varNames.push(getNodeValue(problemCode, node));
                  break;
                default:
                  break;
              }
              break;
            default:
              break;
          }
        }
      } else {
        isInGroup = true;
        currentGroup = foundName;
        if (foundName === PROBLEM_OBJECTS_GROUP) {
          objectAmount = problem.objects.push(emptyProblemObject()) - 1;
          problem.rawObjects = getNodeValue(problemCode, node);
        }
        if (foundName === PROBLEM_INIT_GROUP)
          problem.rawInit = getNodeValue(problemCode, node);
      }
    },
  });
  return problem;
};

export const loadActiveDomain = (domainCode: string): PddlDocument => {
  const tree = getDocumentSyntaxTree(domainCode);
  const domain: PddlDocument = emptyPddlDocument();
  let currentGroup: string;
  let isInGroup = false;
  let predicateAmount: number;
  let sameTypeVars = 0;
  let activeSubgroup: string;
  let actionsAmount: number;
  let groupText: string;

  tree.iterate({
    enter: (node: SyntaxNodeRef) => {
      const foundName = node.type.name;
      if (isInGroup) {
        if (foundName === DOMAIN_GROUP) {
          isInGroup = false;
        } else {
          switch (currentGroup) {
            case DOMAIN_NAME_GROUP:
              switch (foundName) {
                case NAME:
                  domain.name = getNodeValue(domainCode, node);
                  break;
                default:
                  break;
              }
              break;
            case DOMAIN_PREDICATES_GROUP:
              switch (foundName) {
                case PREDICATE:
                  predicateAmount =
                    domain.predicates.push(emptyPredicate()) - 1;
                  domain.predicates[predicateAmount].rawPredicate =
                    getNodeValue(domainCode, node);
                  sameTypeVars = 0;
                  break;
                case PREDICATE_NAME:
                  domain.predicates[predicateAmount].name = getNodeValue(
                    domainCode,
                    node
                  );
                  break;
                case VARIABLE:
                  domain.predicates[predicateAmount].varNames.push(
                    getNodeValue(domainCode, node)
                  );
                  sameTypeVars += 1;
                  break;
                case TYPE:
                  while (sameTypeVars > 0) {
                    domain.predicates[predicateAmount].types?.push({
                      name: getNodeValue(domainCode, node),
                    });
                    sameTypeVars -= 1;
                  }
                  break;
              }
              break;
            case DOMAIN_ACTION_GROUP:
              if (
                foundName === ACTION_PRECONDITION_SUBGROUP ||
                foundName === ACTION_PARAMETERS_SUBGROUP ||
                foundName === ACTION_EFFECT_SUBGROUP
              ) {
                activeSubgroup = foundName;
                sameTypeVars = 0;
              } else if (activeSubgroup) {
                switch (activeSubgroup) {
                  case ACTION_PARAMETERS_SUBGROUP:
                    switch (foundName) {
                      case PARAMETERS:
                        domain.actions[actionsAmount].parameters.rawParameters =
                          getNodeValue(domainCode, node);
                        break;
                      case VARIABLE:
                        domain.actions[actionsAmount].parameters.varName.push(
                          getNodeValue(domainCode, node)
                        );
                        sameTypeVars += 1;
                        break;
                      case TYPE:
                        while (sameTypeVars > 0) {
                          domain.actions[actionsAmount].parameters.types?.push({
                            name: getNodeValue(domainCode, node),
                          });
                          sameTypeVars -= 1;
                        }
                        break;
                      default:
                        break;
                    }
                    break;
                  case ACTION_PRECONDITION_SUBGROUP:
                    if (foundName === PRECONDITION_CONTENT) {
                      domain.actions[actionsAmount].preconditions =
                        getNodeValue(domainCode, node);
                    }
                    break;
                  case ACTION_EFFECT_SUBGROUP:
                    if (foundName === EFFECT_CONTENT) {
                      domain.actions[actionsAmount].effect = getNodeValue(
                        domainCode,
                        node
                      );
                    }
                    break;
                  default:
                    break;
                }
              } else if (foundName === PREDICATE_NAME) {
                actionsAmount = domain.actions.push(emptyAction()) - 1;
                domain.actions[actionsAmount].name = getNodeValue(
                  domainCode,
                  node
                );
                domain.actions[actionsAmount].rawText = groupText;
              }
              break;
            default:
              break;
          }
        }
      } else if (
        foundName === DOMAIN_NAME_GROUP ||
        foundName === DOMAIN_ACTION_GROUP ||
        foundName === DOMAIN_PREDICATES_GROUP
      ) {
        activeSubgroup = "";
        isInGroup = true;
        currentGroup = foundName;
        groupText = getNodeValue(domainCode, node);
      }
    },
  });
  domain.actions.push(emptyNoOperator());
  return domain;
};

const getNodeValue = (code: string, node: SyntaxNodeRef): string => {
  return code.substring(node.from, node.to);
};

export const encodeDck = (): void => {
  encodePredicatesToDomain(gatherPredicateModifications());
  redefineActions(assembleActionReplacements(gatherActionModification()));
};

export const encodeProblemDCK = async (): Promise<void> => {
  const domainBase = encodePredicateDefaults(
    useDomainStore().getStructure.predicates
  );
  const problemBase = composeProblemKnowledgeBase(
    useProblemStore().getStructure
  );

  const includedRules = [];
  useAtbStore().getDCKrules.forEach((rule) => {
    const foundMem = useAtbStore().getDCKmemory.find(
      (mem) => mem.name == rule.rulePredicate.name
    );
    if (!foundMem || !foundMem.omitFromProblem) includedRules.push(rule);
  });

  const problem_enhancement = await getConsultResult(
    problemBase + useAtbStore().getDCKprologInit + domainBase,
    includedRules,
    useProblemStore().getStructure.objects
  );
  redefineObjects(
    getRedefinition(
      useProblemStore().getStructure.rawObjects,
      problem_enhancement.objects
    )
  );
  redefineInit(
    getRedefinition(
      useProblemStore().getStructure.rawInit,
      problem_enhancement.inits
    )
  );
  /*encodePredicatesToProblem(gatherPredicateModifications());
  encodeInitialStatesToProblem(gatherInitStateModifications());
  encodeGoalModifications(gatherGoalModifications());*/
};

export const encodePredicatesToDomain = (
  predicates: Map<string, Predicate>
): void => {
  const domainStore = useDomainStore();
  const tree = getDocumentSyntaxTree(domainStore.rawActiveDomain);
  let domainText = domainStore.rawActiveDomain;
  let addedPredicates = "";
  predicates.forEach((predicate) => {
    addedPredicates = addedPredicates + predicate.rawPredicate + "\n\t";
  });
  let foundPredicates = false;
  tree.iterate({
    enter: (node: SyntaxNodeRef) => {
      if (node.type.name === PREDICATES_SECTION) {
        foundPredicates = true;
      } else if (foundPredicates && node.type.name === PREDICATE) {
        foundPredicates = false;
        domainText =
          domainText.slice(0, node.from) +
          addedPredicates +
          domainText.slice(node.from, domainText.length);
        domainStore.loadActiveDomain(loadActiveDomain(domainText), domainText);
        return;
      }
    },
  });
  return;
};

export const encodePredicatesToProblem = (
  predicates: Map<string, Predicate>
): void => {
  const problemStore = useProblemStore();
  const tree = getProblemDocumentSyntaxTree(problemStore.rawActiveProblem);
  let problemText = problemStore.rawActiveProblem;
  let addedPredicates = "";
  predicates.forEach((predicate) => {
    addedPredicates =
      addedPredicates + predicate.varNames.join(" ").replaceAll("?", "");
    if (predicate.types && predicate.types.length > 0)
      addedPredicates = addedPredicates + " - " + predicate.types.join(" ");
    addedPredicates = addedPredicates + "\n";
  });
  let foundPredicates = false;
  tree.iterate({
    enter: (node: SyntaxNodeRef) => {
      if (node.type.name === PROBLEM_OBJECTS_GROUP) {
        foundPredicates = true;
      } else if (foundPredicates && node.type.name === NAME) {
        foundPredicates = false;
        problemText =
          problemText.slice(0, node.from) +
          addedPredicates +
          problemText.slice(node.from, problemText.length);
        problemStore.loadActiveProblem(
          loadActiveProblem(problemText),
          problemText
        );
        return;
      }
    },
  });
  return;
};

export const encodeInitialStatesToProblem = (
  predicates: Map<string, Predicate>
): void => {
  const problemStore = useProblemStore();
  const tree = getProblemDocumentSyntaxTree(problemStore.rawActiveProblem);
  let problemText = problemStore.rawActiveProblem;
  let addedPredicates = "";
  predicates.forEach((predicate) => {
    addedPredicates =
      addedPredicates +
      "(" +
      predicate.name +
      " " +
      predicate.varNames.join(" ").replaceAll("?", "") +
      ")";
    addedPredicates = addedPredicates + "\n";
  });
  let foundPredicates = false;
  tree.iterate({
    enter: (node: SyntaxNodeRef) => {
      if (node.type.name === PROBLEM_INIT_GROUP) {
        foundPredicates = true;
      } else if (foundPredicates && node.type.name === INIT_PREDICATE) {
        foundPredicates = false;
        problemText =
          problemText.slice(0, node.from) +
          addedPredicates +
          problemText.slice(node.from, problemText.length);
        problemStore.loadActiveProblem(
          loadActiveProblem(problemText),
          problemText
        );
        return;
      }
    },
  });
  return;
};

export const getRedefinition = (
  toModify: string,
  extraInits: string[]
): string => {
  return (
    toModify.substring(0, toModify.length - 1) + extraInits.join(" ") + ")"
  );
};

export const getClauseRedefinition = (
  toModify: string,
  modifiers: Predicate[]
): string => {
  let predicatesToInsert = "";
  modifiers.forEach((predicate) => {
    predicatesToInsert += predicate.rawPredicate + "\n";
  });

  return (
    toModify.slice(0, toModify.indexOf("(")) +
    "(and " +
    toModify.slice(toModify.indexOf("("), toModify.length) +
    "\n" +
    predicatesToInsert +
    ")"
  );
};

export const encodeActionModifications = (
  actions: ActionModification[]
): void => {
  const domainStore = useDomainStore();
  const tree = getDocumentSyntaxTree(domainStore.rawActiveDomain);
  let foundActionGroup = false;
  let foundAction: undefined | ActionModification = undefined;
  const actionRedefinitions: Array<{
    original: string;
    redefinition: string;
  }> = new Array<{ original: string; redefinition: string }>();

  tree.iterate({
    enter: (node: SyntaxNodeRef) => {
      // TODO: There has to be a better way of doing this
      if (node.type.name === ACTION_SECTION) {
        foundActionGroup = true;
      } else if (node.type.name === PREDICATE_NAME && foundActionGroup) {
        foundActionGroup = false;
        foundAction = actions.find((action) => {
          return (
            action.actionName ===
            getNodeValue(domainStore.rawActiveDomain, node)
          );
        });
      } else if (
        node.type.name === ACTION_PRECONDITION_SUBGROUP &&
        foundAction
      ) {
        const preconditions = getNodeValue(domainStore.rawActiveDomain, node);

        actionRedefinitions.push({
          original: preconditions,
          redefinition: getClauseRedefinition(
            preconditions,
            foundAction.extraPreconditions
          ),
        });
        if (foundAction.extraEffects.length === 0) {
          foundAction = undefined;
        }
      } else if (node.type.name === ACTION_EFFECT_SUBGROUP && foundAction) {
        const effects = getNodeValue(domainStore.rawActiveDomain, node);

        actionRedefinitions.push({
          original: effects,
          redefinition: getClauseRedefinition(
            effects,
            foundAction.extraEffects
          ),
        });
      }
    },
  });
  redefineActions(actionRedefinitions);
  return;
};

export const redefineActions = (
  redefinitions: Array<{ original: string; redefinition: string }>
): void => {
  const domainStore = useDomainStore();
  let domain = domainStore.rawActiveDomain;
  redefinitions.forEach((redefinition) => {
    if (redefinition.original.includes(EMPTY_OPERATOR)) {
      const foundIndex = domain.indexOf("(action");
      domain = [
        domain.slice(0, foundIndex),
        "\n" + redefinition.redefinition + "\n",
        domain.slice(foundIndex),
      ].join("");
    } else {
      domain = domain.replace(redefinition.original, redefinition.redefinition);
    }
  });
  domainStore.loadActiveDomain(loadActiveDomain(domain), domain);
};

export const redefineInit = (redefinition: string): void => {
  const newProblem = useProblemStore().getRawValue.replace(
    useProblemStore().getStructure.rawInit,
    redefinition
  );
  useProblemStore().loadActiveProblem(
    loadActiveProblem(newProblem),
    newProblem
  );
};

export const redefineObjects = (redefinition: string): void => {
  const newProblem = useProblemStore().getRawValue.replace(
    useProblemStore().getStructure.rawObjects,
    redefinition
  );
  useProblemStore().loadActiveProblem(
    loadActiveProblem(newProblem),
    newProblem
  );
};

export const encodeGoalModifications = (
  predicates: Map<string, Predicate>
): void => {
  const problemStore = useProblemStore();
  const tree = getProblemDocumentSyntaxTree(problemStore.rawActiveProblem);
  let problemText = problemStore.rawActiveProblem;
  let addedPredicates = "\n(and\n";
  predicates.forEach((predicate) => {
    addedPredicates =
      addedPredicates +
      "(" +
      predicate.name +
      " " +
      predicate.varNames.join("\n") +
      ")";
    addedPredicates = addedPredicates + "\n";
  });
  let foundPredicates = false;
  tree.iterate({
    enter: (node: SyntaxNodeRef) => {
      if (node.type.name === PROBLEM_GOAL_GROUP) {
        foundPredicates = true;
      } else if (foundPredicates && node.type.name === LOGICAL_EXPRESSION) {
        foundPredicates = false;
        problemText =
          problemText.slice(0, node.from) +
          addedPredicates +
          problemText.slice(node.from, problemText.length) +
          ")";
        problemStore.loadActiveProblem(
          loadActiveProblem(problemText),
          problemText
        );
        return;
      }
    },
  });
  return;
};

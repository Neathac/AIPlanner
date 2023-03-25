import { getDocumentSyntaxTree } from "../parser/language";
import { SyntaxNodeRef } from "@lezer/common";
import {
  ActionModifications,
  emptyAction,
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
  gatherActionModifications,
  gatherPredicateModifications,
} from "./nodeLoader";
import { getProblemDocumentSyntaxTree } from "../problemParser/language";

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
const ACTION_SECTION = "ACTION_SECTION";
const ACTION_PARAMETERS_SUBGROUP = "ActionParametersSubgroup";
const ACTION_PRECONDITION_SUBGROUP = "ActionPreconditionSubgroup";
const ACTION_EFFECT_SUBGROUP = "ActionEffectSubgroup";
const PROBLEM_GROUP = "ProblemGroup";
const PROBLEM_NAME_GROUP = "ProblemNameGroup";
const PROBLEM_OBJECTS_GROUP = "ProblemObjectsGroup";
const PROBLEM_INIT_GROUP = "ProblemInitGroup";
const PROBLEM_DOMAIN_GROUP = "ProblemDomainGroup";
const PROBLEM_GOAL_GROUP = "ProblemGoalGroup";
const INIT_PREDICATE = "InitPredicate";
const INIT_VARIABLES = "InitVariables";
const LOGICAL_EXPRESSION = "LogicalExpression";

export const loadActiveProblem = (problemCode: string): PddlProblemDocument => {
  const tree = getProblemDocumentSyntaxTree(problemCode);
  const problem: PddlProblemDocument = emptyPddlProblemDocument();
  let currentGroup: string;
  let isInGroup = false;
  let initAmount: number;
  let objectAmount: number;
  let sameTypeVars = 0;
  let foundRootGoal = 0;

  tree.iterate({
    enter: (node: SyntaxNodeRef) => {
      const foundName = node.type.name;
      if (foundRootGoal === 1) {
        if (foundName === LOGICAL_EXPRESSION) {
          // This is kinda hacky Possible bug source
          // Does not cause inconsistencies in Group presence however
          problem.goal = getNodeValue(problemCode, node);
          foundRootGoal = 2;
        }
      } else if (isInGroup) {
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
                    "?" + getNodeValue(problemCode, node)
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
              foundRootGoal += 1;
              break;
            default:
              break;
          }
        }
      } else {
        isInGroup = true;
        currentGroup = foundName;
        if (foundName === PROBLEM_OBJECTS_GROUP)
          objectAmount = problem.objects.push(emptyProblemObject()) - 1;
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
                    domain.actions[actionsAmount].preconditions = getNodeValue(
                      domainCode,
                      node
                    );
                    break;
                  case ACTION_EFFECT_SUBGROUP:
                    domain.actions[actionsAmount].effect = getNodeValue(
                      domainCode,
                      node
                    );
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
      }
    },
  });
  return domain;
};

const getNodeValue = (code: string, node: SyntaxNodeRef): string => {
  return code.substring(node.from, node.to);
};

export const encodeDCK = (): void => {
  encodePredicatesToDomain(gatherPredicateModifications());
  encodeActionModifications(gatherActionModifications());
};

export const encodePredicatesToDomain = (
  predicates: Map<string, Predicate>
): void => {
  const domainStore = useDomainStore();
  const tree = getDocumentSyntaxTree(domainStore.rawActiveDomain);
  let domainText = domainStore.rawActiveDomain;
  let addedPredicates = "";
  predicates.forEach((predicate) => {
    addedPredicates = addedPredicates + predicate.rawPredicate + "\n";
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

export const getRedefinition = (
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
  actions: ActionModifications[]
): void => {
  const domainStore = useDomainStore();
  const tree = getDocumentSyntaxTree(domainStore.rawActiveDomain);
  let foundActionGroup = false;
  let foundAction: undefined | ActionModifications = undefined;
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
          redefinition: getRedefinition(
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
          redefinition: getRedefinition(effects, foundAction.extraEffects),
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
    domain = domain.replace(redefinition.original, redefinition.redefinition);
  });
  domainStore.loadActiveDomain(loadActiveDomain(domain), domain);
};

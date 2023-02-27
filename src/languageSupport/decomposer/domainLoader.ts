import { getDocumentSyntaxTree } from "../parser/language";
import { SyntaxNodeRef } from "@lezer/common";
import {
  ActionModifications,
  emptyAction,
  emptyPddlDocument,
  emptyPredicate,
  PddlDocument,
  Predicate,
} from "@functions/parserTypes";
import { useDomainStore } from "../../stores/domainStore";
import { gatherActionModifications, gatherPredicateModifications } from "./nodeLoader";

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
  encodePredicates(gatherPredicateModifications());
  encodeActionModifications(gatherActionModifications());
};

export const encodePredicates = (predicates: Map<string, Predicate>): void => {
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
            action.actionName === getNodeValue(domainStore.rawActiveDomain, node)
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

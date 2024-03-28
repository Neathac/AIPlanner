import {
  AttributedInitRule,
  LogicalExpression,
  PREDEFINED_CONSTRAINTS,
  PddlProblemDocument,
  Predicate,
  ProblemObject,
  PrologFunction,
  RulePredicate,
} from "@functions/parserTypes";
import { Answer, load, Prolog } from "trealla";
import { findOverlap } from "./dckLoader";
// https://github.com/guregu/trealla-js

export const GOAL_PREFIX = "goal_rule_";
export const NOT_GOAL_PREFIX = "not_" + GOAL_PREFIX;
export const OBJECT_PROLOG_PREDICATE = "atbObjectControl";
export const INIT_PREFIX = "init_rule_";
export const PROLOG_FAIL = "fail";
export const PROLOG_RULE_SYMBOL = ":-";
export const VAR_PROLOG_PREFIX = "V";
export const PROLOG_OR_SYMBOL = ";";
export const CARDINALITY_NAME = "cardinality_query";
export const CARDINALITY_QUERY =
  CARDINALITY_NAME +
  "(N, Predicate) :- findall(X, call(Predicate), L),length(L,N).";
export const PREDEFINED_FUNCTIONS = [CARDINALITY_QUERY];
export const FINDALL_PROLOG = "findall";
export const MAXLIST_PROLOG = "max_list";
export const MINLIST_PROLOG = "min_list";
export const SUPPORTED_OPERATORS = ["+", "-", "*", "/", "**", "//", "mod"];

export const getConsultResult = async (
  fileContent: string,
  dckRules: Array<AttributedInitRule>,
  objects: ProblemObject[]
): Promise<{ inits: Array<string>; objects: Array<string> }> => {
  const result = { inits: new Array<string>(), objects: new Array<string>() };
  const tempInit = new Array<string>();
  const newObjectsMapping = new Map<string, string>();
  const flatObjects = [];
  objects.forEach((obj) => {
    obj.variables.forEach((val) => flatObjects.push(val));
  });
  await load();
  const session = new Prolog();

  await session.consultText(fileContent);
  // await session.consultText(PROLOG_TEST);

  for await (const rule of dckRules) {
    const query = session.query(branchRuleTypeQueries(rule));
    for await (const answer of query) {
      if (answer.status == "success") {
        Object.entries(answer.answer).forEach(([_, val]) => {
          const temp = val.toString().replaceAll("'", "");
          if (!flatObjects.includes(temp) && !newObjectsMapping.has(temp)) {
            if (/^\d+$/.test(temp))
              newObjectsMapping.set(temp, "DCK_num_" + temp);
            else newObjectsMapping.set(temp, temp);
            result.objects.push(newObjectsMapping.get(temp));
          }
        });
      }

      tempInit.push(decodeAnswer(rule, answer, newObjectsMapping));
    }
  }

  tempInit.forEach((newInit) => {
    if (!result.inits.includes(newInit)) result.inits.push(newInit);
  });
  return result;
};

export const encodeInitPredicatesToPrologFormat = (
  initPredicates: Array<Predicate>
): string => {
  let result = "\n";
  initPredicates.forEach((val) => {
    result += INIT_PREFIX + convertInstantiatedPredicateToProlog(val) + ".\n";
  });
  return result;
};

export const convertInstantiatedPredicateToProlog = (
  pred: Predicate
): string => {
  let res = pred.name;
  if (pred.varNames.length > 0) res += "(" + pred.varNames.join(",") + ")";
  return res;
};

export const encodeGoalPredicatesToPrologFormat = (
  expressions: Array<LogicalExpression>
): string => {
  let result = "\n";
  expressions.forEach((expression) => {
    let negationDepth = 0;
    let currentParent = expression.parentIndex;
    if (expression.operator === "not") negationDepth += 1;
    while (currentParent !== -1) {
      if (expressions[currentParent].operator === "not") negationDepth += 1;
      currentParent = expressions[currentParent].parentIndex;
    }
    expression.predicateArguments.forEach((predicate) => {
      if (negationDepth % 2 === 1)
        result +=
          NOT_GOAL_PREFIX +
          convertInstantiatedPredicateToProlog(predicate) +
          ".\n";
      else
        result +=
          GOAL_PREFIX + convertInstantiatedPredicateToProlog(predicate) + ".\n";
    });
  });
  return result;
};

export const encodeObjectsToPrologFormat = (
  objects: Array<ProblemObject>
): string => {
  let result = "\n";
  objects.forEach((object) => {
    object.variables.forEach((variable) => {
      result += OBJECT_PROLOG_PREDICATE + "(" + variable + ").\n";
    });
  });
  return result;
};

export const encodePredefinedFunctions = (): string => {
  let result = "";
  PREDEFINED_FUNCTIONS.forEach((func) => (result += func + "\n"));
  return result;
};

export const composeProblemKnowledgeBase = (
  problem: PddlProblemDocument
): string => {
  let knowledgeBase = "";

  knowledgeBase += encodeObjectsToPrologFormat(problem.objects);
  knowledgeBase += encodeInitPredicatesToPrologFormat(problem.init);
  knowledgeBase += encodeGoalPredicatesToPrologFormat(problem.goal);

  return knowledgeBase;
};

export const composeDomainKnowledgeBase = (
  dckRules: Array<AttributedInitRule>
): string => {
  let knowledgeBase = "";
  knowledgeBase += "% Cardinality function \n";
  knowledgeBase += encodePredefinedFunctions();
  knowledgeBase +=
    "% Initialization rules of states and memory for encoding to problems \n";
  knowledgeBase += encodeInitRules(dckRules);
  return knowledgeBase;
};

export const branchRuleTypeQueries = (atbRule: AttributedInitRule): string => {
  if (atbRule) return composeSimpleRuleQuery(atbRule);
  else return "fail.";
};

export const composeSimpleValueInitRule = (
  atbRule: AttributedInitRule
): string => {
  let rules = "";
  if (atbRule.simpleDefaultValue && atbRule.simpleDefaultValue == "Constant") {
    rules = INIT_PREFIX + atbRule.rulePredicate.name;
    if (atbRule.rulePredicate.varNames.length > 0) {
      rules += "(" + atbRule.rulePredicate.varNames.join(",") + ")";
    }
    rules += ".\n";
  } else if (atbRule.rulePredicate.varNames.length > 0) {
    let leftSide = INIT_PREFIX + atbRule.rulePredicate.name + "(";
    let rightSide = PROLOG_RULE_SYMBOL + " ";
    atbRule.rulePredicate.varNames.forEach((_, index) => {
      leftSide += VAR_PROLOG_PREFIX + "_" + index;
      rightSide +=
        OBJECT_PROLOG_PREDICATE + "(" + VAR_PROLOG_PREFIX + "_" + index + ")";
      if (index != atbRule.rulePredicate.varNames.length - 1) {
        leftSide += ", ";
        rightSide += ", ";
      }
    });
    if (atbRule.simpleDefaultValue == "False")
      rules += leftSide + ") " + PROLOG_RULE_SYMBOL + " " + PROLOG_FAIL + ".\n";
    else rules += leftSide + ") " + rightSide + ".\n";
  } else {
    if (atbRule.simpleDefaultValue == "False")
      rules +=
        INIT_PREFIX +
        atbRule.rulePredicate.name +
        " " +
        PROLOG_RULE_SYMBOL +
        " " +
        PROLOG_FAIL +
        ".\n";
    else rules += INIT_PREFIX + atbRule.rulePredicate.name + ".\n";
  }
  return rules;
};

export const encodeInitRules = (
  initRules: Array<AttributedInitRule>
): string => {
  let rules = "";
  initRules.forEach((rule) => {
    if (rule.hasSimpleValue) {
      rules += composeSimpleValueInitRule(rule);
    } else rules += composeOrRule(rule);
  });
  return rules;
};

export const composeCardinalityQuery = (
  func: PrologFunction,
  mapping: Map<string, string>
): string => {
  let result = "";
  if (func.predicateArguments.length > 0) {
    result += CARDINALITY_NAME + "(";
    result += mapping.get(func.variable.trim()) + ",(";
    func.predicateArguments.forEach((arg, argIndex) => {
      if (arg.negated) result += "\\+ ";
      if (arg.isInGoal) result += GOAL_PREFIX;
      else result += INIT_PREFIX;
      result += arg.name;
      // Adding arguements
      result += getArgumentsFromMapping(arg, mapping);
      if (argIndex != func.predicateArguments.length - 1) result += ",";
    });
    result += "))";
  }
  return result;
};

export const composeMinMaxQuery = (
  func: PrologFunction,
  funcIndex: number,
  mapping: Map<string, string>
): string => {
  let result = "";

  func.predicateArguments.forEach((arg, argIndex) => {
    const overlap = findOverlap(arg.varNames, func.selectionVars);
    if (overlap.length != 1) return;

    result += FINDALL_PROLOG + "(" + mapping.get(overlap[0]) + ", ";
    if (arg.isInGoal) result += GOAL_PREFIX;
    else result += INIT_PREFIX;
    result +=
      arg.name +
      getArgumentsFromMapping(arg, mapping) +
      ", F" +
      funcIndex +
      "A" +
      argIndex +
      "), ";
    if (func.operator == "max") result += MAXLIST_PROLOG + "(";
    else result += MINLIST_PROLOG + "(";
    result +=
      "F" + funcIndex + "A" + argIndex + ", " + mapping.get(overlap[0]) + "), ";
  });

  if (func.operator == "max") result += MAXLIST_PROLOG + "(";
  else result += MINLIST_PROLOG + "(";
  result += "[";
  func.selectionVars.forEach((variable, varIndex) => {
    result += mapping.get(variable.trim());
    if (varIndex != func.selectionVars.length - 1) result += ", ";
  });
  result += "], " + mapping.get(func.variable.trim()) + ")";
  return result;
};

export const composeOrRule = (rule: AttributedInitRule): string => {
  let result = "";
  const varMapping = createVariableMapping(rule);
  rule.orClause.forEach((orRule, orIndex) => {
    if (orRule.andClause.length > 0 || orRule.prologFunctions.length > 0) {
      // Setting left side of rule
      result += INIT_PREFIX + rule.rulePredicate.name;
      result += getArgumentsFromMapping(
        rule.rulePredicate,
        varMapping[orIndex]
      );
      result += " " + PROLOG_RULE_SYMBOL + " ";

      // Setting right side of rule
      orRule.andClause.forEach((andRule, andIndex) => {
        let foundOperator = false;
        PREDEFINED_CONSTRAINTS.forEach((cons) => {
          if (cons == andRule.name) foundOperator = true;
        });
        if (foundOperator) {
          result +=
            varMapping[orIndex].get(andRule.varNames[0].trim()) +
            " " +
            andRule.name +
            " " +
            varMapping[orIndex].get(andRule.varNames[1].trim());
        } else {
          if (andRule.negated) result += "\\+ ";
          if (andRule.isInGoal) result += GOAL_PREFIX;
          else result += INIT_PREFIX;
          result += andRule.name;
          // Adding arguements
          result += getArgumentsFromMapping(andRule, varMapping[orIndex]);
        }

        if (andIndex != orRule.andClause.length - 1) result += ",";
      });
      // special function queries
      orRule.prologFunctions.forEach((func, funcIndex) => {
        if (func.operator == "count" && func.predicateArguments.length > 0) {
          result += composeCardinalityQuery(func, varMapping[orIndex]);
          if (
            funcIndex != orRule.prologFunctions.length - 1 ||
            orRule.andClause.length > 0
          )
            result += ",";
        } else if (func.operator == "max" || func.operator == "min") {
          result += composeMinMaxQuery(func, funcIndex, varMapping[orIndex]);
          if (
            funcIndex != orRule.prologFunctions.length - 1 ||
            orRule.andClause.length > 0
          )
            result += ",";
        }
      });
      if (result.endsWith(",")) result = result.slice(0, -1);
      result += ".\n";
    }
  });
  return result;
};

export const getArgumentsFromMapping = (
  rulePredicate: RulePredicate,
  varMapping: Map<string, string>
): string => {
  let result = "";
  if (rulePredicate.varNames.length > 0) result += "(";
  rulePredicate.varNames.forEach((variable, index) => {
    result += varMapping.get(variable.trim());
    if (index != rulePredicate.varNames.length - 1) result += ",";
    else result += ")";
  });
  return result;
};

export const deconstructExpression = (expression: string): string[] => {
  const splitWords = [];
  let temp = "";
  let skipNext = false;
  Array.from(expression).forEach((char, ind) => {
    let t = false;
    if (
      (char === "/" || char === "*") &&
      expression.length >= ind + 1 &&
      (expression.substring(ind, ind + 1) === "//" ||
        expression.substring(ind, ind + 1) === "**")
    ) {
      if (temp.length > 0) splitWords.push(temp);
      splitWords.push(expression.substring(ind, ind + 1));
      temp = "";
      skipNext = true;
    } else if (skipNext) {
      skipNext = false;
    } else if (char === " ") {
      if (temp.length > 0) splitWords.push(temp);
      temp = "";
    } else {
      SUPPORTED_OPERATORS.forEach((val) => {
        if (char === val) {
          if (temp.length > 0) splitWords.push(temp);
          splitWords.push(char);
          temp = "";
          t = true;
        }
      });
      if (!t) temp += char;
    }
  });
  splitWords.push(temp);

  return splitWords;
};

export const createVariableMapping = (
  rule: AttributedInitRule
): Array<Map<string, string>> => {
  const mappingArray = new Array<Map<string, string>>();
  rule.orClause.forEach((orRule, orIndex) => {
    mappingArray.push(new Map<string, string>());

    rule.rulePredicate.varNames.forEach((variable, varIndex) => {
      const expressions = deconstructExpression(variable);
      if (expressions.length > 1) {
        let rightSide = "";
        expressions.forEach((ex, exInd) => {
          if (!mappingArray[orIndex].has(ex.trim())) {
            if (!ex.trim().startsWith("?")) {
              mappingArray[orIndex].set(ex.trim(), ex.trim());
            }
            if (!mappingArray[orIndex].has(ex.trim()))
              mappingArray[orIndex].set(
                ex.trim(),
                "V" + varIndex + "O" + orIndex + "E" + exInd
              );
          }
          rightSide += mappingArray[orIndex].get(ex.trim()) + " ";
        });
        if (!mappingArray[orIndex].has(variable.trim()))
          mappingArray[orIndex].set(variable.trim(), rightSide);
      } else {
        if (!variable.trim().startsWith("?")) {
          mappingArray[orIndex].set(variable.trim(), variable.trim());
        }
        if (!mappingArray[orIndex].has(variable.trim()))
          mappingArray[orIndex].set(
            variable.trim(),
            "V" + varIndex + "O" + orIndex
          );
      }
    });

    orRule.anyVariables.forEach((anyVar) => {
      if (!mappingArray[orIndex].has(anyVar.trim()))
        mappingArray[orIndex].set(anyVar.trim(), "_");
    });
    // And clause substitutions
    orRule.andClause.forEach((andRule, andIndex) => {
      andRule.varNames.forEach((variable, varIndex) => {
        const expressions = deconstructExpression(variable);
        if (expressions.length > 1) {
          let rightSide = "";
          expressions.forEach((ex, exInd) => {
            if (!mappingArray[orIndex].has(ex.trim())) {
              if (!ex.trim().startsWith("?")) {
                mappingArray[orIndex].set(ex.trim(), ex.trim());
              }
              if (!mappingArray[orIndex].has(ex.trim()))
                mappingArray[orIndex].set(
                  ex.trim(),
                  "O" + orIndex + "A" + andIndex + "V" + varIndex + "E" + exInd
                );
            }
            rightSide += mappingArray[orIndex].get(ex.trim()) + " ";
          });
          if (!mappingArray[orIndex].has(variable.trim()))
            mappingArray[orIndex].set(variable.trim(), rightSide);
        } else {
          if (!variable.trim().startsWith("?")) {
            mappingArray[orIndex].set(variable.trim(), variable.trim());
          }
          if (!mappingArray[orIndex].has(variable.trim()))
            mappingArray[orIndex].set(
              variable.trim(),
              "O" + orIndex + "A" + andIndex + "V" + varIndex
            );
        }
      });
    });
    // Populate function substitutions
    orRule.prologFunctions.forEach((func, funcIndex) => {
      if (!func.variable.trim().startsWith("?")) {
        mappingArray[orIndex].set(func.variable.trim(), func.variable.trim());
      } else if (!mappingArray[orIndex].has(func.variable.trim())) {
        mappingArray[orIndex].set(
          func.variable.trim(),
          "O" + orIndex + "F" + funcIndex
        );
      }

      func.selectionVars.forEach((variable, varIndex) => {
        const expressions = deconstructExpression(variable);
        if (expressions.length > 1) {
          let rightSide = "";
          expressions.forEach((ex, exInd) => {
            if (!mappingArray[orIndex].has(ex.trim())) {
              if (!ex.trim().startsWith("?")) {
                mappingArray[orIndex].set(ex.trim(), ex.trim());
              }
              if (!mappingArray[orIndex].has(ex.trim()))
                mappingArray[orIndex].set(
                  ex.trim(),
                  "O" + orIndex + "F" + funcIndex + "S" + varIndex + "E" + exInd
                );
            }
            rightSide += mappingArray[orIndex].get(ex.trim()) + " ";
          });
          if (!mappingArray[orIndex].has(variable.trim()))
            mappingArray[orIndex].set(variable.trim(), rightSide);
        } else {
          if (!variable.trim().startsWith("?")) {
            mappingArray[orIndex].set(variable.trim(), variable.trim());
            return;
          }
          if (!mappingArray[orIndex].has(variable.trim()))
            mappingArray[orIndex].set(
              variable.trim(),
              "O" + orIndex + "F" + funcIndex + "S" + varIndex
            );
        }
      });

      func.predicateArguments.forEach((pred, predIndex) => {
        pred.varNames.forEach((variable, varIndex) => {
          const expressions = deconstructExpression(variable);
          if (expressions.length > 1) {
            let rightSide = "";
            expressions.forEach((ex, exInd) => {
              if (!mappingArray[orIndex].has(ex.trim())) {
                if (!ex.trim().startsWith("?")) {
                  mappingArray[orIndex].set(ex.trim(), ex.trim());
                }
                if (!mappingArray[orIndex].has(ex.trim()))
                  mappingArray[orIndex].set(
                    ex.trim(),
                    "O" +
                      orIndex +
                      "F" +
                      funcIndex +
                      "P" +
                      predIndex +
                      "V" +
                      varIndex +
                      "E" +
                      exInd
                  );
              }
              rightSide += mappingArray[orIndex].get(ex.trim()) + " ";
            });
            if (!mappingArray[orIndex].has(variable.trim()))
              mappingArray[orIndex].set(variable.trim(), rightSide);
          } else {
            if (!variable.trim().startsWith("?")) {
              mappingArray[orIndex].set(variable.trim(), variable.trim());
            }
            if (!mappingArray[orIndex].has(variable.trim()))
              mappingArray[orIndex].set(
                variable.trim(),
                "O" +
                  orIndex +
                  "F" +
                  funcIndex +
                  "P" +
                  predIndex +
                  "V" +
                  varIndex
              );
          }
        });
      });
    });
  });

  return mappingArray;
};

export const composeSimpleRuleQuery = (rule: AttributedInitRule): string => {
  let result = "";
  if (rule.rulePredicate.varNames.length > 0) {
    let leftSide = INIT_PREFIX + rule.rulePredicate.name + "(";
    rule.rulePredicate.varNames.forEach((_, index) => {
      leftSide += VAR_PROLOG_PREFIX + "_" + index;
      if (index != rule.rulePredicate.varNames.length - 1) {
        leftSide += ", ";
      } else result += leftSide + ").";
    });
  } else {
    result = INIT_PREFIX + rule.rulePredicate.name + ".";
  }
  return result;
};

export const decodeAnswer = (
  rule: AttributedInitRule,
  answer: Answer,
  newObjects: Map<string, string>
): string => {
  let result = "";
  if (answer.status === "error" || answer.status === "failure") return result;
  if (rule.rulePredicate.varNames.length > 0) {
    result = "(" + rule.rulePredicate.name + " ";
    Object.entries(answer.answer).forEach(([_, val]) => {
      const temp = val.toString().replaceAll("'", "");
      if (newObjects.has(temp)) result += newObjects.get(temp) + " ";
      else result += temp + " ";
    });
    result = result.substring(0, result.length - 1) + ")\n";
  } else if (answer.status === "success") {
    result = "(" + rule.rulePredicate.name + ")\n";
  }
  return result;
};

export const encodePredicateDefaults = (
  predicates: Array<Predicate>
): string => {
  let result = "\n";
  predicates.forEach((pred) => (result += composeSinglePredicateDefault(pred)));
  return result;
};

export const composeSinglePredicateDefault = (predicate: Predicate): string => {
  let result = "";
  if (predicate.varNames.length > 0) {
    let args = "(";
    predicate.varNames.forEach((_, index) => {
      args += "_";
      if (index != predicate.varNames.length - 1) args += ",";
    });
    args += ") " + PROLOG_RULE_SYMBOL + " " + PROLOG_FAIL + ".\n";
    result += INIT_PREFIX + predicate.name + args;
    result += GOAL_PREFIX + predicate.name + args;
    result += NOT_GOAL_PREFIX + predicate.name + args;
  } else {
    result += INIT_PREFIX + predicate.name + ".\n";
    result += GOAL_PREFIX + predicate.name + ".\n";
    result += NOT_GOAL_PREFIX + predicate.name + ".\n";
  }
  return result;
};

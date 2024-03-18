import {
  AttributedInitRule,
  EQUAL_CONSTRAINT,
  LogicalExpression,
  NOT_EQUAL_CONSTRAINT,
  PddlProblemDocument,
  Predicate,
  ProblemObject,
  RulePredicate,
} from "@functions/parserTypes";
import { Answer, load, Prolog } from "trealla";
// https://github.com/guregu/trealla-js

export const GOAL_PREFIX = "goal_rule_";
export const NOT_GOAL_PREFIX = "not_" + GOAL_PREFIX;
export const OBJECT_PROLOG_PREDICATE = "atbObjectControl";
export const INIT_PREFIX = "init_rule_";
export const PROLOG_FAIL = "fail";
export const PROLOG_RULE_SYMBOL = ":-";
export const VAR_PROLOG_PREFIX = "V";
export const PROLOG_OR_SYMBOL = ";";

export const getConsultResult = async (
  fileContent: string,
  dckRules: Array<AttributedInitRule>
): Promise<{ inits: Array<string>; objects: Array<string> }> => {
  const result = { inits: new Array<string>(), objects: new Array<string>() };
  await load();
  const session = new Prolog();

  await session.consultText(fileContent);

  for await (const rule of dckRules) {
    console.log(branchRuleTypeQueries(rule));
    const query = session.query(branchRuleTypeQueries(rule));
    for await (const answer of query) {
      result.inits.push(branchAnswerDecode(rule, answer));
    }
  }
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

export const composeKnowledgeBase = (
  problem: PddlProblemDocument,
  dckRules: Array<AttributedInitRule>
): string => {
  let knowledgeBase = "";
  knowledgeBase += encodeObjectsToPrologFormat(problem.objects);
  knowledgeBase += encodeInitPredicatesToPrologFormat(problem.init);
  knowledgeBase += encodeGoalPredicatesToPrologFormat(problem.goal);
  knowledgeBase += encodeInitRules(dckRules);
  console.log(knowledgeBase);
  return knowledgeBase;
};

export const branchRuleTypeQueries = (atbRule: AttributedInitRule): string => {
  if (atbRule.hasSimpleValue) return composeSimpleRuleQuery(atbRule);
  else return "fail.";
};

export const branchAnswerDecode = (
  atbRule: AttributedInitRule,
  answer: Answer
): string => {
  if (atbRule.hasSimpleValue) return decodeSimpleAnswer(atbRule, answer);
  return "";
};

export const composeSimpleValueInitRule = (
  atbRule: AttributedInitRule
): string => {
  let rules = "";
  if (atbRule.rulePredicate.varNames.length > 0) {
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
    rules += leftSide + ") " + rightSide + ".\n";
  } else {
    if (!atbRule.simpleDefaultValue)
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

export const composeOrRule = (rule: AttributedInitRule): string => {
  let result = INIT_PREFIX + rule.rulePredicate.name;
  const varMapping = createVariableMapping(rule);

  rule.orClause.forEach((orRule, orIndex) => {
    // Setting left side of rule
    result += getArgumentsFromMapping(rule.rulePredicate, varMapping[orIndex]);
    result += " " + PROLOG_RULE_SYMBOL + " ";
    // Setting right side of rule
    orRule.andClause.forEach((andRule, andIndex) => {
      if (andRule.name === EQUAL_CONSTRAINT) {
        result +=
          varMapping[orIndex].get(andRule.varNames[0]) +
          "=" +
          varMapping[orIndex].get(andRule.varNames[1]);
      } else if (andRule.name === NOT_EQUAL_CONSTRAINT) {
        result +=
          varMapping[orIndex].get(andRule.varNames[0]) +
          "\\=" +
          varMapping[orIndex].get(andRule.varNames[1]);
      } else {
        if (andRule.negated && andRule.isInGoal) {
          result += NOT_GOAL_PREFIX;
        } else {
          if (andRule.negated) result += "\\+ ";
          if (andRule.isInGoal) result += GOAL_PREFIX;
          else result += INIT_PREFIX;
        }
        result += andRule.name;
        // Adding arguements
        result += getArgumentsFromMapping(andRule, varMapping[orIndex]);
      }

      if (andIndex != orRule.andClause.length - 1) result += ",";
      else result += ".\n";
    });
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
    result += varMapping.get(variable);
    if (index != rulePredicate.varNames.length - 1) result += ",";
    else result += ")";
  });
  return result;
};

export const createVariableMapping = (
  rule: AttributedInitRule
): Array<Map<string, string>> => {
  const mappingArray = new Array<Map<string, string>>();
  rule.orClause.forEach((orRule, orIndex) => {
    mappingArray.push(new Map<string, string>());

    rule.rulePredicate.varNames.forEach((variable, varIndex) => {
      if (!mappingArray[orIndex].has(variable))
        mappingArray[orIndex].set(variable, "V" + varIndex + "O" + orIndex);
    });
    orRule.anyVariables.forEach((anyVar) => {
      if (!mappingArray[orIndex].has(anyVar))
        mappingArray[orIndex].set(anyVar, "_");
    });
    orRule.andClause.forEach((andRule, andIndex) => {
      andRule.varNames.forEach((variable, varIndex) => {
        if (!mappingArray[orIndex].has(variable))
          mappingArray[orIndex].set(
            variable,
            "O" + orIndex + "A" + andIndex + "V" + varIndex
          );
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

export const decodeSimpleAnswer = (
  rule: AttributedInitRule,
  answer: Answer
): string => {
  let result = "";
  if (answer.status === "error" || answer.status === "failure") return result;
  if (rule.rulePredicate.varNames.length > 0) {
    result = "(" + rule.rulePredicate.name + " ";
    Object.entries(answer.answer).forEach(([_, val]) => {
      console.log(val);
      result += val.toString().replaceAll("'", "") + " ";
    });
    result = result.substring(0, result.length - 1) + ")\n";
  } else if (answer.status === "success") {
    result = "(" + rule.rulePredicate.name + ")\n";
  }
  return result;
};

export const composePredicateDefaults = (
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
  } else {
    result += INIT_PREFIX + predicate.name + ".\n";
    result += GOAL_PREFIX + predicate.name + ".\n";
  }
  return result;
};

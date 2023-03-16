export default `
@top Problem { "(" KEYWORD ProblemGroup* ")" }
ProblemGroup { 
    ProblemObjectsGroup |
    ProblemNameGroup | 
    ProblemInitGroup | 
    ProblemGoalGroup |
    ProblemDomainGroup |
    ProblemSituationGroup
}
ProblemNameGroup {
    "(" KEYWORD NAME ")"
}
ProblemDomainGroup { "(" DOMAIN_SECTION NAME ")" }
ProblemSituationGroup { "(" SITUATION_SECTION NAME ")" }
ProblemObjectsGroup {
    "(" OBJECTS_SECTION ((NAME)+ TYPE)+ ")"
}
ProblemGoalGroup {
    "(" GOAL_SECTION LogicalExpression ")"
}
ProblemInitGroup {
    "(" INIT_SECTION (InitPredicate)+ ")"
}
InitPredicate {
    "(" PredicateName InitVariables ")"
}
InitVariables {
    (NAME (TYPE)?)+
}
Predicate {
    "(" PredicateName (VARIABLE (TYPE)?)+ ")"
}
PredicateName {
    NAME ("-" NAME)?
}
Parameters {
    "(" (VARIABLE (TYPE)? )+ ")"
}
Parameter {
    "(" VARIABLE (TYPE)? ")"
}
LogicalExpression {
    ( 
        Predicate |
        "(" NOT_OPERATOR LogicalExpression ")" |
        "(" CLAUSE_OPERATOR (LogicalExpression)+ ")" |
        "(" IMPLY_OPERATOR Predicate Predicate ")" |
        "(" FOR_OPERATOR Parameter (WHEN_OPERATOR Predicate)? LogicalExpression ")" |
        "(" EXISTS_OPERATOR Parameter LogicalExpression ")"
    )
}
OBJECTS_SECTION { @specialize<SECTION, ":objects"> }
INIT_SECTION { @specialize<SECTION, ":init"> }
GOAL_SECTION { @specialize<SECTION, ":goal"> }
DOMAIN_SECTION { @specialize<SECTION, ":domain"> }
SITUATION_SECTION { @specialize<SECTION, ":situation"> }
NOT_OPERATOR { @specialize<NAME,"not"> }
CLAUSE_OPERATOR { @specialize<NAME,"or"> | @specialize<NAME,"and"> }
IMPLY_OPERATOR { @specialize<NAME,"imply"> }
FOR_OPERATOR { @specialize<NAME,"forall"> }
WHEN_OPERATOR { @specialize<NAME,"when"> }
EXISTS_OPERATOR { @specialize<NAME,"exists"> }
@tokens {
    NAME { $[a-zA-Z_0-9éèâùûôïîöëç\\.\\+\\'’&]+ }
    KEYWORD { "define" | "domain" | "problem" }
    SPACE { @whitespace }
    LINE_COMMENT { ";" ![\n]* }
    SECTION { ":" $[a-zA-Z_0-9éèâùûôïîöëç\\.\\+\\-\\'’&]+ }
    TYPE { "- " $[a-zA-Z_0-9éèâùûôïîöëç\\.\\+\\-\\'’&]+ }
    VARIABLE { "?" $[a-zA-Z_0-9éèâùûôïîöëç\\.\\+\\-\\'’&]+ }
}
@skip { SPACE | LINE_COMMENT }
`;

export default `
@top Domain { "(" KEYWORD DomainGroup* ")" }
DomainGroup { 
    DomainTypesGroup |
    DomainRequirementsGroup |
    DomainExtensionGroup | 
    DomainNameGroup | 
    DomainConstantsGroup | 
    DomainPredicatesGroup | 
    DomainTimelessGroup |
    DomainActionGroup |
    DomainAxiomGroup
}
DomainExtensionGroup { "(" EXTENDS_SECTION NAME ")" }
DomainNameGroup {
    "(" KEYWORD NAME ")"
}
DomainRequirementsGroup {
    "(" REQUIREMENTS_SECTION SECTION+ ")"
}
DomainTypesGroup {
    "(" TYPES_SECTION ((NAME)+ TYPE)+ ")"
}
DomainConstantsGroup {
    "(" CONSTANTS_SECTION ((NAME)+ TYPE)+ ")"
}
DomainPredicatesGroup {
    "(" PREDICATES_SECTION (Predicate)+ ")"
}
Predicate {
    "(" PredicateName (VARIABLE (TYPE)?)+ ")"
}
PredicateName {
    NAME ("-" NAME)?
}
DomainTimelessGroup {
    "(" TIMELESS_SECTION (Timeless)+ ")"
}
Timeless {
    "(" NAME (NAME)+ ")"
}
DomainActionGroup {
    "(" ACTION_SECTION PredicateName ActionParametersSubgroup ActionPreconditionSubgroup ActionEffectSubgroup ")"
}
ActionParametersSubgroup {
    PARAMETERS_SUBSECTION Parameters
}
Parameters {
    "(" (VARIABLE (TYPE)? )+ ")"
}
Parameter {
    "(" VARIABLE (TYPE)? ")"
}
ActionPreconditionSubgroup {
    PRECONDITION_SUBSECTION LogicalExpression
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
ActionEffectSubgroup {
    EFFECT_SUBSECTION LogicalExpression
}
DomainAxiomGroup {
    "(" AXIOM_SECTION AxiomVarsSubgroup AxiomContextSubgroup AxiomImpliesSubgroup ")"
}
AxiomVarsSubgroup {
    VARS_SUBSECTION Parameters
}
AxiomContextSubgroup {
    CONTEXT_SUBSECTION LogicalExpression
}
AxiomImpliesSubgroup {
    IMPLIES_SUBSECTION LogicalExpression
}
REQUIREMENTS_SECTION { @specialize<SECTION, ":requirements"> }
EXTENDS_SECTION { @specialize<SECTION, ":extends"> }
CONSTANTS_SECTION { @specialize<SECTION, ":constants"> }
TYPES_SECTION { @specialize<SECTION, ":types"> }
PREDICATES_SECTION { @specialize<SECTION, ":predicates"> }
TIMELESS_SECTION { @specialize<SECTION, ":timeless"> }
ACTION_SECTION { @specialize<SECTION, ":action"> }
PARAMETERS_SUBSECTION { @specialize<SECTION, ":parameters"> }
PRECONDITION_SUBSECTION { @specialize<SECTION, ":precondition"> }
EFFECT_SUBSECTION { @specialize<SECTION, ":effect">}
AXIOM_SECTION { @specialize<SECTION, ":axiom"> }
VARS_SUBSECTION { @specialize<SECTION, ":vars"> }
CONTEXT_SUBSECTION { @specialize<SECTION, ":context"> }
IMPLIES_SUBSECTION { @specialize<SECTION, ":implies">}
NOT_OPERATOR { @specialize<NAME,"not"> }
CLAUSE_OPERATOR { @specialize<NAME,"or"> | @specialize<NAME,"and"> }
IMPLY_OPERATOR { @specialize<NAME,"imply"> }
FOR_OPERATOR { @specialize<NAME,"forall"> }
WHEN_OPERATOR { @specialize<NAME,"when"> }
EXISTS_OPERATOR { @specialize<NAME,"exists"> }
@tokens {
    NAME { @asciiLetter+ }
    KEYWORD { "define" | "domain" }
    SPACE { @whitespace }
    LINE_COMMENT { ";" ![\n]* }
    SECTION { ":" $[a-zA-Z_0-9éèâùûôïîöëç\\.\\+\\-\\'’&]+ }
    TYPE { "- " $[a-zA-Z_0-9éèâùûôïîöëç\\.\\+\\-\\'’&]+ }
    VARIABLE { "?" $[a-zA-Z_0-9éèâùûôïîöëç\\.\\+\\-\\'’&]+ }
}
@skip { SPACE | LINE_COMMENT }
`;

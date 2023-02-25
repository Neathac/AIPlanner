import {
  LRLanguage,
  LanguageSupport,
  indentNodeProp,
} from "@codemirror/language";
// import { indentNodeProp } from "@codemirror/language";
import { styleTags, tags as t } from "@lezer/highlight";
import parser from "./parser";

const extendedParser = parser.configure({
  props: [
    indentNodeProp.add({
      DomainGroup(context) {
        return context.column(context.node.from) + 1; //delimitedIndent({ closing: ')', align: true })
      },
      Domain(context) {
        return context.column(context.node.from) + 1; //delimitedIndent({ closing: ')', align: true })
      },
      SECTION(context) {
        return context.column(context.node.from) + 1;
      },
    }),
    styleTags({
      SECTION: t.literal,
      REQUIREMENTS_SECTION: t.literal,
      CONSTANTS_SECTION: t.literal,
      EXTENDS_SECTION: t.literal,
      TYPES_SECTION: t.literal,
      PREDICATES_SECTION: t.literal,
      TIMELESS_SECTION: t.literal,
      ACTION_SECTION: t.literal,
      PARAMETERS_SUBSECTION: t.literal,
      PRECONDITION_SUBSECTION: t.literal,
      EFFECT_SUBSECTION: t.literal,
      AXIOM_SECTION: t.literal,
      VARS_SUBSECTION: t.literal,
      CONTEXT_SUBSECTION: t.literal,
      IMPLIES_SUBSECTION: t.literal,
      LINE_COMMENT: t.comment,
      NAME: t.variableName,
      KEYWORD: t.controlKeyword,
      TYPE: t.className,
      VARIABLE: t.atom,
      NOT_OPERATOR: t.bool,
      CLAUSE_OPERATOR: t.bool,
      IMPLY_OPERATOR: t.bool,
      FOR_OPERATOR: t.bool,
      WHEN_OPERATOR: t.bool,
      EXISTS_OPERATOR: t.bool,
    }),
  ],
});
const pddl = LRLanguage.define({
  parser: extendedParser,
});

export const getDocumentSyntaxTree = (document: string) => {
  return extendedParser.parse(document);
};

export const pddlLanguage = () => {
  return new LanguageSupport(pddl);
};

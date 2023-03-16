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
      ProblemGroup(context) {
        return context.column(context.node.from) + 1; //delimitedIndent({ closing: ')', align: true })
      },
      Problem(context) {
        return context.column(context.node.from) + 1; //delimitedIndent({ closing: ')', align: true })
      },
      SECTION(context) {
        return context.column(context.node.from) + 1;
      },
    }),
    styleTags({
      SECTION: t.literal,
      OBJECTS_SECTION: t.literal,
      INIT_SECTION: t.literal,
      GOAL_SECTION: t.literal,
      DOMAIN_SECTION: t.literal,
      SITUATION_SECTION: t.literal,
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

export const getProblemDocumentSyntaxTree = (document: string) => {
  return extendedParser.parse(document);
};

export const pddlProblemLanguage = () => {
  return new LanguageSupport(pddl);
};

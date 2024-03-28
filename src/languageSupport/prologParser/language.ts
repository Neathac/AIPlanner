import parser from "./parser";
import { LRLanguage, LanguageSupport } from "@codemirror/language";
import { styleTags, tags as t } from "@lezer/highlight";

export const prolog = LRLanguage.define({
  parser: parser.configure({
    props: [
      styleTags({
        "Comma FullStop": t.separator,
        "( )": t.paren,
        "[ ]": t.squareBracket,
        "{ }": t.bracket,
        '"!"': t.operator,
        '"#/\\\\" "#\\\\/" "*" "**" "*->" "/" "//" "/\\\\" "\\\\/" #< #<== #<==> #= #=< #==> #> #>= #\\ #\\= $ + , - --> -> .. : :- :< := ; < << = =.. =:= =< == => =@= =\\= > >:< >= >> ?- @< @=< @> @>= Dot \\ \\+ \\= \\== \\=@= ^ as discontiguous div dynamic in in_set initialization ins is meta_predicate mod module_transparent multifile public rdiv rem table thread_initialization thread_local volatile xor |':
          t.operator,
        "Functor/Atom": t.function(t.variableName),
        Atom: t.constant(t.name),
        BackQuoteString: t.string,
        BinaryNumber: t.number,
        BlockComment: t.blockComment,
        Float: t.number,
        HexNumber: t.number,
        LineComment: t.lineComment,
        Number: t.number,
        OctalNumber: t.number,
        QuotedAtom: t.constant(t.name),
        Rational: t.number,
        String: t.string,
        String2: t.string,
        String3: t.string,
        Variable: t.variableName,
      }),
    ],
  }),
  languageData: {
    commentTokens: { line: "%" },
  },
});

export function prologLanguage() {
  return new LanguageSupport(prolog);
}

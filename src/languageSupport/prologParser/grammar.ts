export default `
@top Program { sentence* }

@skip { SPACE | LineComment }

sentence {
  baseterm Dot
}

baseterm {
 Atom
}

@tokens {
  Atom { $[a-z] $[a-zA-Z_0-9]* }
  SPACE { @whitespace }
  Variable { ($[A-Z] | "_") $[a-zA-Z_0-9]* }
  LineComment { "%" ![\n]* }
  Dot { "." }
}

Comma { "," }

`;

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
  LineComment { "%" ![\n]* }
  Dot { "." }
}

`;

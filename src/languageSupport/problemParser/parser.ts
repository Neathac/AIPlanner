import { buildParser } from "@lezer/generator";
import grammar from "./grammar";

export default buildParser(grammar);

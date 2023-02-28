import { IBaklavaViewModel, useBaklava } from "baklavajs";
import { StateNode } from "./StateNodeBeta";

export default function editorFactory(): IBaklavaViewModel {
  const baklava = useBaklava();
  baklava.editor.registerNodeType(StateNode);

  return baklava;
}

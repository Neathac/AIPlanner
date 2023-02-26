import { Editor } from "@baklavajs/core";
import { InterfaceTypePlugin } from "@baklavajs/plugin-interface-types";
import { StateNode } from "./StateNode";
import { ActionNode } from "./ActionNode";
import { GoalNode } from "./GoalNode";
import { StateConstraintNode } from "./StateConstraintNode";

export default function editorFactory(): Editor {
  const editor = new Editor();
  const interfaceTypes = new InterfaceTypePlugin();

  editor.use(interfaceTypes);

  editor.registerNodeType("ActionNode", ActionNode);
  editor.registerNodeType("StateNode", StateNode);
  editor.registerNodeType("GoalNode", GoalNode);
  editor.registerNodeType("StateConstraintNode", StateConstraintNode);

  interfaceTypes.addType("StateNode", "cyan");

  return editor;
}

import { Node, NodeOption } from "@baklavajs/core";
import { getNodeVariables, getOriginNode } from "../..//helpers/editorHelper";
import {
  STATE_NAME,
  STATE_NODE_TYPE,
  STATE_OUTPUT_TRANSITION,
} from "./StateNode";
import { emptyStateVals, StateNodeValues } from "@functions/parserTypes";
import { useNodeStore } from "../../stores/nodeStore";

export const STATE_CONSTRAINT_NODE_TYPE = "StateConstraintNode";
export const INPUT_STATE = "Origin State";
export const CONSTRAINT_OPTION_NAME_START = "Constraint ";

export class StateConstraintNode extends Node {
  type = STATE_CONSTRAINT_NODE_TYPE;
  name = this.type;

  constructor() {
    super();
    this.addInputInterface(INPUT_STATE, "TransitionOption", undefined, {
      type: "StateNode",
    });
    this.addOutputInterface("Transition to");
    this.addOption(
      "Set Constraints",
      "ButtonOption",
      undefined,
      "StateConstraintSidebarOption"
    );
  }

  getInputVars(): StateNodeValues {
    const origin = getOriginNode(
      this.getInterface(INPUT_STATE),
      STATE_OUTPUT_TRANSITION,
      useNodeStore().getActiveEditorState
    );
    const result = emptyStateVals();
    if (origin && origin.type === STATE_NODE_TYPE) {
      const vars = getNodeVariables(origin);
      const nameOpt = origin.options.find((value) => {
        return value[0] === STATE_NAME;
      });
      if (nameOpt) {
        result.name = nameOpt[1];
      }
      if (vars) {
        result.variables = vars;
      }
    }
    return result;
  }

  addConstraintOption(): void {
    const inputState = this.getInputVars();
    if (inputState.name && inputState.variables.length) {
      this.addOption(
        CONSTRAINT_OPTION_NAME_START + this.options.size,
        "InputOption",
        "(" + inputState.name + " " + inputState.variables.join(" ") + ")"
      );
    }
    return;
  }

  getConstraintOptions(): Map<string, NodeOption> {
    const returnOptions: Map<string, NodeOption> = new Map<
      string,
      NodeOption
    >();
    this.options.forEach((value, key) => {
      if (key.startsWith(CONSTRAINT_OPTION_NAME_START)) {
        returnOptions.set(key, value);
      }
    });
    return returnOptions;
  }

  resetConstraints(): void {
    Object.keys(this.getConstraintOptions()).forEach((value) => {
      this.removeOption(value);
    });
  }
}

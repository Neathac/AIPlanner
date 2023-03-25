import { Node } from "@baklavajs/core";
export const STATE_NODE_TYPE = "StateNode";
export const VARIABLES_OPTION = "Variables";
export const STATE_OUTPUT_TRANSITION = "Transition to";
export const INITIAL_STATE_OPTION = "Initial state";
export const STATE_NAME = "Name";

export class StateNode extends Node {
  type = STATE_NODE_TYPE;
  name = this.type;

  constructor() {
    super();
    this.addInputInterface("Transition from", "TransitionOption", undefined);
    this.addOutputInterface(STATE_OUTPUT_TRANSITION, {
      type: "StateNode",
    });
    this.addOption(INITIAL_STATE_OPTION, "CheckboxOption");
    this.addOption(STATE_NAME, "InputOption", "");
    this.addOption(VARIABLES_OPTION, "InputOption", "?s ?more");
  }
}

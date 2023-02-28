/*import { Node, NodeOption } from "@baklavajs/core";
import { useDomainStore } from "../../stores/domainStore";

export const ACTION_OPTION = "Actions";
export const ACTION_NODE_TYPE = "ActionNode";
export const PREDICATE_OPTION_NAME_START = "Predicate ";

export class ActionNode extends Node {
  type = ACTION_NODE_TYPE;
  name = this.type;

  constructor() {
    super();
    const domainStore = useDomainStore();
    const structure = domainStore.getStructure;
    const actions: string[] = [];
    Object.entries(structure.actions).forEach(([, value]) => {
      actions.push(value.name);
    });
    this.addInputInterface("StartingState", "StateOption", undefined);
    this.addOutputInterface("ResultingState");
    this.addOption(ACTION_OPTION, "SelectOption", actions[0], undefined, {
      items: actions,
    });
    this.addOption(
      "Set Predicates",
      "ButtonOption",
      undefined,
      "ActionSidebarOption"
    );
  }

  getPredicateOptions(): Map<string, NodeOption> {
    const returnOptions: Map<string, NodeOption> = new Map<
      string,
      NodeOption
    >();
    this.options.forEach((value, key) => {
      if (key.startsWith(PREDICATE_OPTION_NAME_START)) {
        returnOptions.set(key, value);
      }
    });
    return returnOptions;
  }

  addNewPredicate() {
    const domainStore = useDomainStore();
    this.addOption(
      PREDICATE_OPTION_NAME_START + this.options.size,
      "InputOption",
      domainStore.getStructure.predicates[0].rawPredicate,
      undefined
    );
  }
}
*/

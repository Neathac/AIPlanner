/*import { Node, NodeOption } from "baklavajs";
import { useDomainStore } from "../../stores/domainStore";

export const GOAL_NODE_TYPE = "GoalNode";
export const GOAL_OPTION_NAME_START = "Goal ";

export class GoalNode extends Node {
  type = GOAL_NODE_TYPE;
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
    this.addOption("Set Goals", "ButtonOption", undefined, "GoalSidebarOption");
  }

  getPredicateOptions(): Map<string, NodeOption> {
    const returnOptions: Map<string, NodeOption> = new Map<
      string,
      NodeOption
    >();
    this.options.forEach((value, key) => {
      if (key.startsWith(GOAL_OPTION_NAME_START)) {
        returnOptions.set(key, value);
      }
    });
    return returnOptions;
  }

  addNewPredicate() {
    const domainStore = useDomainStore();
    let val = "";
    domainStore.getGoalifiedPredicates.forEach((value, key) => {
      val = key;
    });
    this.addOption(
      GOAL_OPTION_NAME_START + this.options.size,
      "InputOption",
      val,
      undefined
    );
  }
}
*/

/*import { useNodeStore } from "../../stores/nodeStore";
import {
  ActionModifications,
  emptyActionModifications,
  getPredicateFromString,
  negatePredicate,
  Predicate,
  removeEffectPrefix,
} from "@functions/parserTypes";
import { INodeState } from "@baklavajs/core/dist/baklavajs-core/types";
import {
  exploreInputDirection,
  exploreOutputDirection,
  getNodeInputs,
  getNodeOptionsValues,
  getNodeOutputs,
  getNodeTypes,
  getPredicateFromState,
  isStateInitial,
} from "../../helpers/editorHelper";
import { STATE_NODE_TYPE } from "../nodeFactory/StateNode";
import {
  ACTION_NODE_TYPE,
  ACTION_OPTION,
  PREDICATE_OPTION_NAME_START,
} from "../nodeFactory/ActionNode";
import {
  CONSTRAINT_OPTION_NAME_START,
  STATE_CONSTRAINT_NODE_TYPE,
} from "../nodeFactory/StateConstraintNode";
import {
  GOAL_NODE_TYPE,
  GOAL_OPTION_NAME_START,
} from "../nodeFactory/GoalNode";
import { useDomainStore } from "../../stores/domainStore";

export const populateActionModification = (
  actionNode: INodeState,
  nodeGroup: INodeState[]
): ActionModifications => {
  const modification = emptyActionModifications();
  const actionOption = actionNode.options.find(([actionName]) => {
    return actionName === ACTION_OPTION;
  });
  if (actionOption) {
    modification.actionName = actionOption[1];
  }
  const actionModification = getPredicatesFromNode(actionNode);
  modification.extraEffects = modification.extraEffects.concat(
    actionModification.extraEffects
  );
  modification.extraPreconditions = modification.extraPreconditions.concat(
    actionModification.extraPreconditions
  );
  nodeGroup.forEach((value) => {
    const newModification = getPredicatesFromNode(value);
    modification.extraEffects = modification.extraEffects.concat(
      newModification.extraEffects
    );
    modification.extraPreconditions = modification.extraPreconditions.concat(
      newModification.extraPreconditions
    );
  });
  return modification;
};

export const getPredicatesFromNode = (
  node: INodeState
): ActionModifications => {
  const modification = emptyActionModifications();
  switch (node.type) {
    case ACTION_NODE_TYPE:
      getNodeOptionsValues(PREDICATE_OPTION_NAME_START, node).forEach(
        (value) => {
          modification.extraPreconditions.push(
            getPredicateFromString(removeEffectPrefix(value))
          );
        }
      );
      break;
    case STATE_CONSTRAINT_NODE_TYPE:
      getNodeOptionsValues(CONSTRAINT_OPTION_NAME_START, node).forEach(
        (value) => {
          modification.extraPreconditions.push(
            getPredicateFromString(removeEffectPrefix(value))
          );
          if (value.startsWith("eff")) {
            const newPredicate = getPredicateFromString(
              removeEffectPrefix(value)
            );
            if (newPredicate.rawPredicate) {
              newPredicate.rawPredicate = negatePredicate(
                newPredicate.rawPredicate
              );
              modification.extraEffects.push(newPredicate);
            }
          }
        }
      );
      break;
    case GOAL_NODE_TYPE:
      getNodeOptionsValues(GOAL_OPTION_NAME_START, node).forEach((value) => {
        modification.extraPreconditions.push(
          getPredicateFromString(removeEffectPrefix(value))
        );
      });
      break;
    default:
      break;
  }
  return modification;
};

export const gatherActionModifications = (): ActionModifications[] => {
  const modifications: ActionModifications[] = [];
  const transitionGroups = gatherTransitionGroups();
  transitionGroups.forEach((valueStates, keyAction) => {
    modifications.push(populateActionModification(keyAction, valueStates));
  });

  return modifications;
};

export const gatherPredicateModifications = (): Map<string, Predicate> => {
  const nodeStore = useNodeStore();
  const domainStore = useDomainStore();
  const editorState = nodeStore.getActiveEditorState;
  const states = getNodeTypes(editorState.nodes, STATE_NODE_TYPE);
  const goals = getNodeTypes(editorState.nodes, GOAL_NODE_TYPE);
  const result = new Map<string, Predicate>();
  const existingPredicates = domainStore.getPredicatesByName;

  states.forEach((state) => {
    const statePredicate = getPredicateFromState(state);
    if (
      statePredicate &&
      statePredicate.rawPredicate &&
      !existingPredicates.has(statePredicate.name)
    ) {
      // TODO: Replace in the future. Extracting Predicate from string supports type parsing
      const statePredicateWithTypes = getPredicateFromString(
        statePredicate.rawPredicate
      );
      result.set(statePredicateWithTypes.name, statePredicateWithTypes);
    }
  });
  goals.forEach((goal) => {
    getNodeOptionsValues(GOAL_OPTION_NAME_START, goal).forEach((value) => {
      const goalPredicate = getPredicateFromString(value);
      if (goalPredicate && !existingPredicates.has(goalPredicate.name)) {
        result.set(goalPredicate.name, goalPredicate);
      }
    });
  });

  return result;
};

export const gatherGoalModifications = (): Map<string, Predicate> => {
  const nodeStore = useNodeStore();
  const domainStore = useDomainStore();
  const editorState = nodeStore.getActiveEditorState;
  const goals = getNodeTypes(editorState.nodes, GOAL_NODE_TYPE);
  const result = new Map<string, Predicate>();
  const existingPredicates = domainStore.getPredicatesByName;

  goals.forEach((goal) => {
    getNodeOptionsValues(GOAL_OPTION_NAME_START, goal).forEach((value) => {
      const goalPredicate = getPredicateFromString(value);
      if (goalPredicate && !existingPredicates.has(goalPredicate.name)) {
        result.set(goalPredicate.name, goalPredicate);
      }
    });
  });

  return result;
};

export const gatherInitStateModifications = (): Map<string, Predicate> => {
  const nodeStore = useNodeStore();
  const domainStore = useDomainStore();
  const editorState = nodeStore.getActiveEditorState;
  const states = getNodeTypes(editorState.nodes, STATE_NODE_TYPE);
  const result = new Map<string, Predicate>();
  const existingPredicates = domainStore.getPredicatesByName;

  states.forEach((state) => {
    if (isStateInitial(state)) {
      const statePredicate = getPredicateFromState(state);
      if (
        statePredicate &&
        statePredicate.rawPredicate &&
        !existingPredicates.has(statePredicate.name)
      ) {
        // TODO: Replace in the future. Extracting Predicate from string supports type parsing
        const statePredicateWithTypes = getPredicateFromString(
          statePredicate.rawPredicate
        );
        result.set(statePredicateWithTypes.name, statePredicateWithTypes);
      }
    }
  });

  return result;
};

export const gatherTransitionGroups = (): Map<INodeState, INodeState[]> => {
  const nodeStore = useNodeStore();
  const editorState = nodeStore.getActiveEditorState;
  const actions = getNodeTypes(editorState.nodes, ACTION_NODE_TYPE);
  const nodeGroups = new Map<INodeState, INodeState[]>();
  // Map Action nodes to all associated nodes
  actions.forEach((action) => {
    nodeGroups.set(
      action,
      exploreInputDirection(action, editorState, STATE_NODE_TYPE).concat(
        exploreOutputDirection(action, editorState, STATE_NODE_TYPE)
      )
    );
  });
  return nodeGroups;
};

export const getEmptyStateTransition = (node: INodeState): INodeState[] => {
  const nodeStore = useNodeStore();
  const inputDirection: INodeState[] = [];
  let inputStates = getNodeTypes(
    getNodeInputs(node, nodeStore.getActiveEditorState),
    STATE_NODE_TYPE
  );
  do {
    const tempStates: Array<INodeState> = [];
    inputStates.forEach((inputNode) =>
      tempStates.concat(
        getNodeTypes(
          getNodeInputs(inputNode, nodeStore.getActiveEditorState),
          STATE_NODE_TYPE
        )
      )
    );
    inputDirection.concat(tempStates);
    inputStates = tempStates;
  } while (inputStates.length > 0);
  const outputDirection: INodeState[] = [];
  let outputStates = getNodeTypes(
    getNodeOutputs(node, nodeStore.getActiveEditorState),
    STATE_NODE_TYPE
  );
  do {
    const tempStates: Array<INodeState> = [];
    outputStates.forEach((outputNode) =>
      tempStates.concat(
        getNodeTypes(
          getNodeInputs(outputNode, nodeStore.getActiveEditorState),
          STATE_NODE_TYPE
        )
      )
    );
    outputDirection.concat(tempStates);
    outputStates = tempStates;
  } while (outputStates.length > 0);
  return inputDirection.concat(outputDirection).flat();
};
*/
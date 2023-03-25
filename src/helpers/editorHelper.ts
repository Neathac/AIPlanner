import { emptyPredicate, Predicate } from "@functions/parserTypes";
import {
  INITIAL_STATE_OPTION,
  STATE_NAME,
  VARIABLES_OPTION,
} from "../languageSupport/nodeFactory/StateNode";
import { NodeInterface } from "@baklavajs/core";
import { INodeState, IState } from "@baklavajs/core/dist/baklavajs-core/types";

export function getOriginNode(
  inputInterface: NodeInterface,
  soughtOrigin: string,
  editorState: IState
): INodeState | void {
  if (inputInterface.connectionCount === 1 && inputInterface.isInput) {
    const connection = editorState.connections.find((connection) => {
      return connection.to === inputInterface.id;
    });

    if (connection) {
      const originNode = editorState.nodes.find((node) => {
        const transitionFromInterface = node.interfaces.find(
          ([interfaceName, nodeInterface]) => {
            return (
              interfaceName === soughtOrigin &&
              nodeInterface.id === connection.from
            );
          }
        );
        return transitionFromInterface;
      });
      if (originNode) {
        return originNode;
      }
    }
  }
  return;
}

export function getTargetNode(
  inputInterface: NodeInterface,
  soughtTarget: string,
  editorState: IState
): INodeState | void {
  if (inputInterface.connectionCount === 1 && inputInterface.isInput) {
    const connection = editorState.connections.find((connection) => {
      return connection.from === inputInterface.id;
    });

    if (connection) {
      const originNode = editorState.nodes.find((node) => {
        const transitionToInterface = node.interfaces.find(
          ([interfaceName, nodeInterface]) => {
            return (
              interfaceName === soughtTarget &&
              nodeInterface.id === connection.to
            );
          }
        );
        return transitionToInterface;
      });
      if (originNode) {
        return originNode;
      }
    }
  }
  return;
}

export function getNodeOptionsValues(
  nameStart: string,
  node: INodeState
): string[] {
  const result: string[] = [];
  node.options.forEach(([optName, value]) => {
    if (optName.startsWith(nameStart)) {
      result.push(value as string);
    }
  });
  return result;
}

export function getNodeVariables(node: INodeState): string[] | void {
  const varOption = node.options.find(([optName]) => {
    return optName === VARIABLES_OPTION;
  });
  if (varOption) {
    return (varOption[1] as string).split(" ");
  }
  return;
}

export function isStateInitial(node: INodeState): boolean {
  // TODO: Debug
  return node.options.find(([optName]) => {
    return optName === INITIAL_STATE_OPTION;
  })[1];
}

export function getPredicateFromState(node: INodeState): Predicate | void {
  const stateName = node.options.find(([optName]) => {
    return optName === STATE_NAME;
  });
  const stateVars = getNodeVariables(node);
  if (stateName && stateVars) {
    const result = emptyPredicate();
    result.name = stateName[1];
    result.varNames = stateVars;
    result.rawPredicate =
      "(" + result.name + " " + result.varNames.join(" ") + ")";
    return result;
  }
  return;
}

export function getNodeInputs(
  node: INodeState,
  editorState: IState
): INodeState[] {
  const filteredConnections = editorState.connections.filter((connection) => {
    return node.interfaces.some(([, state]) => {
      // Interface of input node is the end of a connection
      return state.id === connection.to;
    });
  });
  return editorState.nodes.filter((exploredNode) => {
    return exploredNode.interfaces.some(([, exploredInterface]) => {
      return filteredConnections.some((connection) => {
        return connection.from === exploredInterface.id;
      });
    });
  });
}

export function getNodeOutputs(
  node: INodeState,
  editorState: IState
): INodeState[] {
  const filteredConnections = editorState.connections.filter((connection) => {
    return node.interfaces.some(([, state]) => {
      // Interface of output node is the end of a connection
      return state.id === connection.from;
    });
  });
  return editorState.nodes.filter((exploredNode) => {
    return exploredNode.interfaces.some(([, exploredInterface]) => {
      return filteredConnections.some((connection) => {
        return connection.to === exploredInterface.id;
      });
    });
  });
}

export function getNodeTypes(nodes: INodeState[], type: string): INodeState[] {
  return nodes.filter((node) => {
    return node.type === type;
  });
}

export function exploreInputDirection(
  node: INodeState,
  editorState: IState,
  stopType: string
): INodeState[] {
  let frontierNodes = [node];
  const result: INodeState[] = [];
  do {
    const newFrontier: INodeState[] = [];
    frontierNodes.forEach((value) => {
      getNodeInputs(value, editorState)
        .filter((state) => {
          return state.type !== stopType;
        })
        .forEach((state) => {
          newFrontier.push(state);
          result.push(state);
        });
    });
    frontierNodes = newFrontier;
  } while (frontierNodes.length > 0);
  return result;
}

export function exploreOutputDirection(
  node: INodeState,
  editorState: IState,
  stopType: string
): INodeState[] {
  let frontierNodes = [node];
  const result: INodeState[] = [];
  do {
    const newFrontier: INodeState[] = [];
    frontierNodes.forEach((value) => {
      getNodeOutputs(value, editorState)
        .filter((state) => {
          return state.type !== stopType;
        })
        .forEach((state) => {
          newFrontier.push(state);
          result.push(state);
        });
    });
    frontierNodes = newFrontier;
  } while (frontierNodes.length > 0);
  return result;
}

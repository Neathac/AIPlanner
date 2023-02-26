import { defineStore } from "pinia";
import { IState, INodeState } from "@baklavajs/core/dist/baklavajs-core/types";
import { Editor } from "@baklavajs/core";
import { STATE_NODE_TYPE } from "../languageSupport/nodeFactory/StateNode";

export const useNodeStore = defineStore("nodeStore", {
  state: () => ({
    editorState: new Editor().save(),
  }),
  getters: {
    getEditorState: (state) => {
      return state.editorState;
    },
    getStateNodes: (state) => {
      const stateNodes: INodeState[] = [];
      Object.entries(state.editorState.nodes).forEach(([, object]) => {
        if (object.type === STATE_NODE_TYPE) {
          stateNodes.push(object);
        }
      });
      return stateNodes;
    },
  },
  actions: {
    loadEditorState(state: IState) {
      this.editorState = state;
    },
  },
});

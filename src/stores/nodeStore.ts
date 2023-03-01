import { defineStore } from "pinia";
import { IState, INodeState } from "@baklavajs/core/dist/baklavajs-core/types";
import { STATE_NODE_TYPE } from "../languageSupport/nodeFactory/StateNode";
import editorFactory from "../languageSupport/nodeFactory/nodeFactory";

export const useNodeStore = defineStore("nodeStore", {
  state: () => ({
    editorState: editorFactory().save(),
  }),
  getters: {
    getActiveEditorState: (state) => {
      return state.editorState;
    },
    getActiveStateNodes: (state) => {
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
    loadActiveEditorState(state: IState) {
      this.editorState = state;
    },
  },
});

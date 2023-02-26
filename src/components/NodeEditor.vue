<template>
  <PrimeButton label="Load states" @click="load()" class="saveButton" />
  <div style="height: 100vh; width: 100vw">
    <baklava-editor :plugin="viewPlugin" />
  </div>
</template>

<script lang="ts">
import { defineComponent, h } from "vue";
import { OptionPlugin } from "@baklavajs/plugin-options-vue3";
import { ViewPlugin } from "@baklavajs/plugin-renderer-vue3";
import editorFactory from "../languageSupport/nodeFactory/nodeFactory";
import ActionSidebarOption from "./Sidebars/ActionSidebarOption.vue";
import GoalSidebarOption from "./Sidebars/GoalSidebarOption.vue";
import StateConstraintSidebarOption from "./Sidebars/StateConstraintSidebarOption.vue";
import { useNodeStore } from "../stores/nodeStore";
import { Engine } from "@baklavajs/plugin-engine";
import {
  gatherActionModifications,
  gatherPredicateModifications,
} from "../languageSupport/decomposer/nodeLoader";
export default defineComponent({
  data() {
    return {
      nodeStore: useNodeStore(),
      editor: editorFactory(),
      viewPlugin: new ViewPlugin(),
      engine: new Engine(true),
    };
  },
  created() {
    this.editor.use(this.viewPlugin);
    this.editor.use(new OptionPlugin());
    this.editor.use(this.engine);
    // NEVER touch this ever. Oficially legacy code as of today
    this.viewPlugin.registerOption("ActionSidebarOption", {
      components: ActionSidebarOption,
      render: () => h(ActionSidebarOption),
    });
    this.viewPlugin.registerOption("StateConstraintSidebarOption", {
      components: StateConstraintSidebarOption,
      render: () => h(StateConstraintSidebarOption),
    });
    this.viewPlugin.registerOption("GoalSidebarOption", {
      components: GoalSidebarOption,
      render: () => h(GoalSidebarOption),
    });
    this.engine.events.calculated.addListener(this, () => {
      this.nodeStore.loadEditorState(this.editor.save());
    });
  },
  methods: {
    load() {
      this.nodeStore.loadEditorState(this.editor.save());
      console.log(gatherActionModifications());
      console.log(gatherPredicateModifications());
    },
  },
});
</script>

<style scoped>
.saveButton {
  z-index: 1000;
  position: fixed;
  left: 20px;
  top: 10%;
}
</style>

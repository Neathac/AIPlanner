<template>
  <v-container style="height: 80vh; overflow: auto">
    <h3>State constraints</h3>
    <v-label
      >Please connect node to a State node before adding constraints</v-label
    >
    <br />
    <v-label>Replace variable names with variables of connected action</v-label>
    <br />
    <state-constraint-interface
      v-for="option in stateOptions"
      :key="option[0]"
      :nodeOption="option[1].value"
      class="mt-3"
      @remove="removeStateOption(option[0])"
      @change="changeOption(option[0], $event)"
    />
    <v-btn
      @click="addConstraintOption()"
      class="dark-button mt-3 w-100"
      variant="tonal"
    >
      Add State constraint
    </v-btn>
  </v-container>
</template>

<script lang="ts">
import { StateConstraintNode } from "../../languageSupport/nodeFactory/StateConstraintNode";
import { defineComponent } from "vue";
import StateConstraintInterface from "./SidebarContent/StateConstraintInterface.vue";
export default defineComponent({
  components: {
    StateConstraintInterface,
  },
  props: {
    node: {
      type: StateConstraintNode,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      stateOptions: this.$props.node.getConstraintOptions(),
    };
  },
  mounted() {
    this.$props.node.events.addOption.addListener(this, () => {
      this.$forceUpdate();
    });
    this.$props.node.events.removeOption.addListener(this, () => {
      this.$forceUpdate();
    });
  },
  methods: {
    addConstraintOption() {
      this.$props.node.addConstraintOption();
      this.$data.stateOptions = this.$props.node.getConstraintOptions();
    },
    removeStateOption(name: string) {
      this.$props.node.options.delete(name);
      this.$data.stateOptions.delete(name);
    },
    changeOption(optionName: string, newValue: string) {
      this.$props.node.setOptionValue(optionName, newValue);
    },
  },
});
</script>

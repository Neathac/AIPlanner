<template>
  <v-container style="height: 80vh; overflow: auto">
    <h2>Parameters of node</h2>
    <v-label style="margin-bottom: 10px;">{{ currentParameters }}</v-label>
    <h2>Predicates</h2>
    <action-interface
      v-for="option in predicateOptions"
      :key="option[0]"
      :node="option[1]"
      class="mt-3"
      @remove="removePredicateOption(option[0])"
      @changeValue="changeOption(option[0], $event)"
      @change="emitChange"
    />
    <v-btn
      @click="addPredicateOption()"
      class="dark-button ml-2 w-100"
      variant="tonal"
    >
      Add Predicate
    </v-btn></v-container
  >
</template>

<script lang="ts">
import ActionInterface from "./SidebarContent/ActionInterface.vue";
import {
  ActionNode,
  ACTION_OPTION,
} from "../../languageSupport/nodeFactory/ActionNode";
import { defineComponent } from "vue";
import { useDomainStore } from "../../stores/domainStore";
export default defineComponent({
  components: {
    ActionInterface,
  },
  props: {
    node: {
      type: ActionNode,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
  },
  data() {
    const domainStore = useDomainStore();
    const currentParameters =
      domainStore.getActions[this.$props.node.getOptionValue(ACTION_OPTION)]
        .parameters.rawParameters;
    const predicateOptions = this.$props.node.getPredicateOptions();
    return {
      domainStore,
      currentParameters,
      predicateOptions,
    };
  },
  mounted() {
    this.$props.node.events.addOption.addListener(this, () => {
      this.$forceUpdate();
    });
    this.$props.node.events.removeOption.addListener(this, () => {
      this.$forceUpdate();
    });
    // In case user changes the action a node is referring to
    this.$props.node.events.update.addListener(this, () => {
      this.$data.currentParameters =
        this.$data.domainStore.getActions[
          this.$props.node.getOptionValue(ACTION_OPTION)
        ].parameters.rawParameters;
      this.$data.predicateOptions = this.$props.node.getPredicateOptions();
    });
  },
  methods: {
    addPredicateOption() {
      this.$props.node.addNewPredicate();
      this.predicateOptions = this.$props.node.getPredicateOptions();
    },
    removePredicateOption(name: string) {
      this.$props.node.options.delete(name);
      this.$data.predicateOptions.delete(name);
    },
    changeOption(optionName: string, newValue: string) {
      this.$props.node.setOptionValue(optionName, newValue);
    },
    emitChange() {
      this.$emit("change");
    }
  },
});
</script>

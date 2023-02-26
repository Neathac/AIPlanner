<template>
  <div>
    <h3>Parameters of node</h3>
    <label>{{ currentParameters }}</label>
    <h3>Predicates</h3>
    <action-interface
      v-for="option in predicateOptions"
      :key="option[0]"
      :node="option[1]"
      class="mt-3"
      @remove="removePredicateOption(option[0])"
      @change="changeOption(option[0], $event)"
    />
    <button @click="addPredicateOption()" class="dark-button mt-3 w-100">
      Add Predicate
    </button>
  </div>
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
  },
});
</script>

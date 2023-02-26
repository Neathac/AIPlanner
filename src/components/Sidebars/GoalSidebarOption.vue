<template>
  <div>
    <h3>Predicates</h3>
    <goal-interface
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
import GoalInterface from "./SidebarContent/GoalInterface.vue";
import { GoalNode } from "../../languageSupport/nodeFactory/GoalNode";
import { defineComponent } from "vue";
import { useDomainStore } from "../../stores/domainStore";
export default defineComponent({
  components: {
    GoalInterface,
  },
  props: {
    node: {
      type: GoalNode,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
  },
  data() {
    const domainStore = useDomainStore();
    const predicateOptions = this.$props.node.getPredicateOptions();
    return {
      domainStore,
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

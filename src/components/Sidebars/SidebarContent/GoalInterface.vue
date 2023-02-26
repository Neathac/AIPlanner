<template>
  <div v-if="!editMode" class="flex-grow-1">{{ node.value }}</div>
  <v-select
    v-else
    class="p-inputtext-sm"
    v-model="tempGoalPredicate"
    :items="goalPredicateValues"
  ></v-select>
  <div class="d-flex align-items-center">
    <button class="dark-button ml-2 pl-2 pr-2" @click="toggle">
      {{ editMode ? "Save" : "Edit" }}
    </button>

    <button class="dark-button ml-2 pl-2 pr-2" @click="$emit('remove')">
      Remove
    </button>
    <br />
    <PrimeCheckbox name="negation" value="Negate" v-model="negate" />
    <label for="negate">Negate</label>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useDomainStore } from "../../../stores/domainStore";
import { NodeOption } from "@baklavajs/core";
import { negatePredicate } from "@functions/parserTypes";
export default defineComponent({
  props: {
    node: {
      type: NodeOption,
      required: true,
    },
  },
  data() {
    const domainStore = useDomainStore();
    const goalPredicates = domainStore.getGoalifiedPredicates;
    const goalPredicateValues: string[] = [];
    const negate = false;
    goalPredicates.forEach((value, rawPredicate) => {
      goalPredicateValues.push(rawPredicate);
    });
    return {
      negate,
      goalPredicates,
      goalPredicateValues,
      domainStore,
      editMode: false,
      tempGoalPredicate: "",
    };
  },
  methods: {
    toggle() {
      if (!this.editMode) {
        this.tempGoalPredicate = this.$props.node.value;
        this.editMode = true;
      } else {
        this.editMode = false;
        if (this.$data.negate) {
          this.$data.tempGoalPredicate = negatePredicate(
            this.$data.tempGoalPredicate
          );
        }
        this.$emit("change", this.tempGoalPredicate);
      }
    },
  },
});
</script>

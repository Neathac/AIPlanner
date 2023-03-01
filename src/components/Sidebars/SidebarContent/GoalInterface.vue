<template>
  <v-container
    style="padding: 0; padding-top: 0px; margin-top: 0; margin-bottom: 8px"
    class="mt-0"
  >
    <v-row no-gutters>
      <v-label v-if="!editMode" class="flex-grow-1">{{ node.value }}</v-label>
      <v-autocomplete
        v-else
        class="p-inputtext-sm"
        size="small"
        v-model="tempGoalPredicate"
        :items="goalPredicateValues"
      ></v-autocomplete>
    </v-row>
    <v-row no-gutters>
      <v-btn
        class="dark-button ml-2 pl-2 pr-2"
        @click="toggle"
        variant="tonal"
        size="small"
      >
        {{ editMode ? "Save" : "Edit" }}
      </v-btn>

      <v-btn
        variant="tonal"
        size="small"
        class="dark-button ml-2 pl-2 pr-2"
        @click="$emit('remove')"
      >
        Remove
      </v-btn>
      <v-checkbox
        name="negation"
        value="Negate"
        v-model="negate"
        label="Negate"
        density="compact"
        v-if="editMode"
      />
    </v-row>
  </v-container>
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
          this.$data.negate = false;
        }
        this.$emit("changeValue", this.tempGoalPredicate);
      }
    },
  },
});
</script>

<style scoped>
.mt-0.mt-3 {
  margin-top: 0 !important;
}
</style>

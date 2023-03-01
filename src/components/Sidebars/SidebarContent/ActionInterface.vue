<template>
  <v-container>
    <v-row no-gutters>
      <v-label v-if="!editMode" class="flex-grow-1">{{ node.value }}</v-label>
      <v-select
        v-else
        class="p-inputtext-sm"
        size="small"
        v-model="tempPredicate"
        :items="predicateValues"
      ></v-select>
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
    const predicates = domainStore.getPredicates;
    const predicateValues: string[] = [];
    const negate = false;
    predicates.forEach((value, rawPredicate) => {
      predicateValues.push(rawPredicate);
    });
    return {
      negate,
      predicates,
      predicateValues,
      domainStore,
      editMode: false,
      tempPredicate: "",
    };
  },
  methods: {
    toggle() {
      if (!this.editMode) {
        this.tempPredicate = this.$props.node.value;
        this.editMode = true;
      } else {
        this.editMode = false;
        if (this.$data.negate) {
          this.$data.tempPredicate = negatePredicate(this.$data.tempPredicate);
        }
        this.$emit("change", this.tempPredicate);
      }
    },
  },
});
</script>

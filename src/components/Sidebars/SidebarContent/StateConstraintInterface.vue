<template>
  <v-container
    style="padding: 0; padding-top: 0px; margin-top: 0; margin-bottom: 8px"
    class="mt-0"
  >
    <v-row no-gutters>
      <v-label v-if="!editMode" class="flex-grow-1">{{ nodeOption }}</v-label>
      <v-text-field
        v-else
        class="p-inputtext-sm"
        v-model="tempConstraint"
      ></v-text-field>
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
    </v-row>
    <v-row no-gutters>
      <v-checkbox
        name="negation"
        value="Negate"
        v-model="negate"
        label="Negate"
        v-if="editMode"
      />
      <v-checkbox
        name="effect"
        value="Effect"
        v-model="effect"
        label="Is action effect"
        v-if="editMode"
      />
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { negatePredicate, wrapPredicateInEffect } from "@functions/parserTypes";
import { defineComponent } from "vue";
export default defineComponent({
  props: {
    nodeOption: {
      type: String,
      required: true,
    },
  },
  emits: ["change", "remove"],
  data() {
    return {
      editMode: false,
      tempConstraint: this.$props.nodeOption,
      negate: false,
      effect: false,
    };
  },
  methods: {
    toggle() {
      if (!this.editMode) {
        this.tempConstraint = this.$props.nodeOption;
        this.editMode = true;
      } else {
        this.editMode = false;
        if (this.$data.negate) {
          this.$data.tempConstraint = negatePredicate(
            this.$data.tempConstraint
          );
        }
        if (this.$data.effect) {
          this.$data.tempConstraint = wrapPredicateInEffect(
            this.$data.tempConstraint
          );
        }
        this.$emit("change", this.tempConstraint);
      }
    },
  },
});
</script>

<template>
  <div v-if="!editMode" class="flex-grow-1">{{ nodeOption }}</div>
  <v-text-field
    v-else
    class="p-inputtext-sm"
    v-model="tempConstraint"
  ></v-text-field>
  <div class="d-flex align-items-center">
    <button class="dark-button ml-2 pl-2 pr-2" @click="toggle">
      {{ editMode ? "Save" : "Edit" }}
    </button>

    <button class="dark-button ml-2 pl-2 pr-2" @click="$emit('remove')">
      Remove
    </button>
    <br />
    <v-checkbox name="negation" value="Negate" v-model="negate" />
    <label for="negate">Negate</label>
    <v-checkbox name="effect" value="Effect" v-model="effect" />
    <label for="effect">Negate in effect</label>
  </div>
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

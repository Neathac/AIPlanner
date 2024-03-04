<template>
  <v-container>
    <v-form @submit.prevent="submit" ref="form">
      <v-row>
        <v-col cols="4">
          <v-autocomplete
            ref="originState"
            v-model="originState"
            :items="atbStates"
            item-title="name"
            :rules="[() => !!originState || 'This field is required']"
            label="Initial state"
            placeholder="Select..."
            required
          ></v-autocomplete>
        </v-col>
        <v-col cols="4">
          <v-select
            v-model="e6"
            :items="states"
            :menu-props="{ maxHeight: '400' }"
            label="Select"
            :multiple="true"
            hint="Pick the order of variables"
            persistent-hint
          ></v-select>
        </v-col>
        <v-col cols="4">
          <v-btn type="submit" class="me-4" color="primary">Save</v-btn>
          <v-btn
            color="error"
            icon="mdi-delete"
            class="me-4"
            @click="this.$emit('deleteEvent')"
          ></v-btn>
        </v-col>
      </v-row>
    </v-form>
  </v-container>
</template>

<script lang="ts">
import { useAtbStore } from "../stores/atbStore";
import { defineComponent, ref } from "vue";

export default defineComponent({
  props: {
    index: {
      type: Number,
      required: true,
    },
    atbTransition: {
      required: true,
    },
  },
  setup() {
    return {
      form: ref(),
    };
  },
  data() {
    return {
      name: "",
      numVars: null,
      atbStore: useAtbStore(),
      originState: null,
      targetState: null,
      atbStates: [],
      nameRules: [
        (value: string) => {
          if (value.length > 0) return true;
          return "You must enter a unique non-empty name.";
        },
      ],
    };
  },
  mounted() {
    this.atbStates = this.atbStore.getDCKstates;
    this.originState = this.atbTransition.originState;
    this.targetState = this.atbTransition.targetState;
  },
  methods: {
    async submit(event: { preventDefault: () => any }) {
      await event.preventDefault();
      const { valid } = await this.form.validate();
      if (valid) {
        // eslint-disable-next-line vue/no-mutating-props
        this.atbState.name = this.name;
        // eslint-disable-next-line vue/no-mutating-props
        this.atbState.numOfVars = this.numVars;
        this.$emit("saveEvent");
      }
    },
  },
});
</script>

<template>
  <v-container>
    <v-form @submit.prevent="submit" ref="form">
      <v-row>
        <v-col cols="4">
          <v-text-field
            v-model="name"
            :rules="nameRules"
            label="Name"
          ></v-text-field>
        </v-col>
        <v-col cols="2">
          <v-text-field
            v-model="numVars"
            label="Number of variables"
            type="number"
            :rules="varRules"
          ></v-text-field>
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
import { defineComponent, ref } from "vue";

export default defineComponent({
  props: {
    index: {
      type: Number,
      required: true,
    },
    atbState: {
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
      nameRules: [
        (value: string) => {
          if (value.length > 0) return true;
          return "You must enter a unique non-empty name.";
        },
      ],
      varRules: [
        (value: number) => {
          if (value < 0) return "Number of variables musn't be negative.";
          return true;
        },
      ],
    };
  },
  mounted() {
    this.name = this.atbState.name;
    this.numVars = Number(this.atbState.numOfVars);
  },
  methods: {
    async submit(event: { preventDefault: () => any }) {
      await event.preventDefault();
      const { valid } = await this.form.validate();
      if (valid) {
        // eslint-disable-next-line vue/no-mutating-props
        this.atbState.name = this.name;
        // eslint-disable-next-line vue/no-mutating-props
        this.atbState.numOfVars = Number(this.numVars);
        this.$emit("saveEvent");
      }
    },
  },
});
</script>

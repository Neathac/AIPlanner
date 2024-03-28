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
        <v-col cols="2">
          <v-checkbox label="Don't encode to problem" v-model="omitFromProblem">
          </v-checkbox>
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
    atbMemory: {
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
      omitFromProblem: false,
      nameRules: [
        (value: string) => {
          if (
            value.length > 0 &&
            useAtbStore().getDCKmemory.filter((mem) => mem.name == value)
              .length < 2
          )
            return true;
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
    this.name = this.atbMemory.name;
    this.numVars = Number(this.atbMemory.numOfVars);
    this.omitFromProblem = this.atbMemory.omitFromProblem;
  },
  methods: {
    async submit(event: { preventDefault: () => any }) {
      await event.preventDefault();
      const { valid } = await this.form.validate();
      if (valid) {
        // eslint-disable-next-line vue/no-mutating-props
        this.atbMemory.name = this.name;
        // eslint-disable-next-line vue/no-mutating-props
        this.atbMemory.numOfVars = Number(this.numVars);
        // eslint-disable-next-line vue/no-mutating-props
        this.atbMemory.omitFromProblem = this.omitFromProblem;
        this.$emit("saveEvent");
      }
    },
  },
});
</script>

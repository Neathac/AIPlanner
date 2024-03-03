<template>
  <v-container>
    <v-row>
      <!-- Text Field -->
      <v-col cols="4">
        <v-text-field
          v-model="textFieldValue"
          label="Text Field"
        ></v-text-field>
      </v-col>

      <!-- Numeric-only Text Field -->
      <v-col cols="4">
        <v-text-field
          v-model="numericFieldValue"
          label="Numeric Field"
          type="number"
        ></v-text-field>
      </v-col>

      <!-- Save Button -->
      <v-col cols="4">
        <v-btn @click="saveForm" color="primary">Save</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  data() {
    return {
      textFieldValue: "",
      numericFieldValue: null,
    };
  },
  methods: {
    saveForm() {
      // Handle saving form data
      console.log("Text Field:", this.textFieldValue);
      console.log("Numeric Field:", this.numericFieldValue);
      // Add your save logic here
    },
  },
});
</script>

<template>
  <div class="about">
    <v-app-bar></v-app-bar>
    <FileStructure />
    <h1>This is an about page</h1>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import FileStructure from "../components/FileStructure.vue";

export default defineComponent({
  name: "ProtectedView",
  data() {
    return {
      menuVisible: true,
    };
  },
  components: {
    FileStructure,
  },
});
</script>

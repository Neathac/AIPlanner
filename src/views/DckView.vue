<template>
  <div class="about">
    <v-app-bar></v-app-bar>
    <FileStructure />
    <v-main>
      <DomainEditor />
    </v-main>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import FileStructure from "../components/FileStructure.vue";
import DomainEditor from "../components/DomainEditor.vue";

export default defineComponent({
  name: "DckView",
  data() {
    return {
      menuVisible: true,
    };
  },
  components: {
    FileStructure,
    DomainEditor,
  },
});
</script>

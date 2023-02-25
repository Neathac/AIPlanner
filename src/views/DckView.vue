<template>
  <div class="dck">
    <v-app-bar></v-app-bar>
    <DomainEditor />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import DomainEditor from "../components/DomainEditor.vue";

export default defineComponent({
  name: "DckView",
  data() {
    return {
      menuVisible: true,
    };
  },
  components: {
    DomainEditor,
  },
});
</script>

<style>
.dck {
}
</style>

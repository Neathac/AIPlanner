<template>
  <div class="dck">
    <v-app-bar>
      <v-btn-toggle
        v-model="editor"
        rounded="0"
        color="deep-purple-accent-3"
        group
      >
        <v-btn value="Domain"> Domain Editor </v-btn>
        <v-btn value="DCK"> DCK Encoder </v-btn>
      </v-btn-toggle>
    </v-app-bar>
    <DomainEditor v-if="editor == 'Domain'" />
    <NodeEditor v-if="editor == 'DCK'" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import DomainEditor from "../components/DomainEditor.vue";
import NodeEditor from "../components/NodeEditor.vue";

export default defineComponent({
  name: "DckView",
  data() {
    return {
      menuVisible: true,
      editor: "Domain",
    };
  },
  components: {
    DomainEditor,
    NodeEditor,
  },
});
</script>

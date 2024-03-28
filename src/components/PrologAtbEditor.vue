<template>
  <codemirror
    v-model="code"
    placeholder="Code goes here..."
    :autofocus="true"
    :style="{ height: '90vh' }"
    :indent-with-tab="true"
    :tab-size="2"
    :extensions="extensions"
    @change="onChanged"
  >
  </codemirror>
</template>

<script lang="ts">
import { defineComponent, ref, shallowRef } from "vue";
import { Codemirror } from "vue-codemirror";
import { prologLanguage } from "../languageSupport/prologParser/language";
import { useAtbStore } from "../stores/atbStore";

export default defineComponent({
  components: {
    Codemirror,
  },
  setup() {
    const atbStore = useAtbStore();
    const code = ref(atbStore.getDCKprologInit);
    const extensions = [prologLanguage()];

    // Codemirror EditorView instance ref
    const view = shallowRef();
    const handleReady = (payload) => {
      view.value = payload.view;
    };

    return {
      code,
      extensions,
      handleReady,
      log: console.log,
    };
  },
  methods: {
    onChanged() {
      const atbStore = useAtbStore();
      atbStore.loadPrologInit(this.code);
    },
  },
});
</script>

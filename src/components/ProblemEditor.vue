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
import { pddlLanguage } from "../languageSupport/parser/language";
import { oneDark } from "../languageSupport/parser/theme";
import { useProblemStore } from "../stores/problemStore";
import { store } from "../store";

export default defineComponent({
  components: {
    Codemirror,
  },
  setup() {
    const problemStore = useProblemStore();
    problemStore.loadRawActiveProblem(store.activeProblem);
    const code = ref(problemStore.rawActiveProblem);
    const extensions = [pddlLanguage(), oneDark];

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
      store.activeProblem = this.code;
      const problemStore = useProblemStore();
      problemStore.loadRawActiveProblem(store.activeDomain);
    },
  },
});
</script>

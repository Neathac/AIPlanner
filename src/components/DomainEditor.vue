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
import { defineComponent, shallowRef, ref } from "vue";
import { Codemirror } from "vue-codemirror";
import { pddlLanguage } from "../languageSupport/parser/language";
import { oneDark } from "../languageSupport/parser/theme";
import { useDomainStore } from "../stores/domainStore";
import { store } from "../store";
import { loadActiveDomain } from "../languageSupport/decomposer/domainLoader";

export default defineComponent({
  components: {
    Codemirror,
  },
  setup() {
    const domainStore = useDomainStore();
    domainStore.loadRawActiveDomain(store.activeDomain);
    const code = ref(domainStore.rawActiveDomain);
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
      store.activeDomain = this.code;
      useDomainStore().loadActiveDomain(loadActiveDomain(this.code), this.code);
    },
  },
});
</script>

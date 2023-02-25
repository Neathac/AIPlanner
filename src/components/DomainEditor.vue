<template>
  <codemirror
    v-model="code"
    placeholder="Code goes here..."
    :autofocus="true"
    :indent-with-tab="true"
    :tab-size="2"
    :extensions="extensions"
  >
  </codemirror>
</template>

<script lang="ts">
import { defineComponent, ref, shallowRef } from "vue";
import { Codemirror } from "vue-codemirror";
import {
  pddlLanguage,
  getDocumentSyntaxTree,
} from "../languageSupport/parser/language";
import { loadDomain } from "../languageSupport/decomposer/domainLoader";
import { SyntaxNodeRef } from "@lezer/common";
import { useDomainStore } from "../stores/domainStore";

export default defineComponent({
  components: {
    Codemirror,
  },
  setup() {
    const domainStore = useDomainStore();
    const code = ref(`console.log('Hello, world!')`);
    const extensions = [pddlLanguage()];

    // Codemirror EditorView instance ref
    const view = shallowRef();
    const handleReady = (payload) => {
      view.value = payload.view;
    };

    // Status is available at all times via Codemirror EditorView
    const getCodemirrorStates = () => {
      const state = view.value.state;
      const ranges = state.selection.ranges;
      const selected = ranges.reduce(
        (r, range) => r + range.to - range.from,
        0
      );
      const cursor = ranges[0].anchor;
      const length = state.doc.length;
      const lines = state.doc.lines;
      // more state info ...
      // return ...
    };

    return {
      code,
      extensions,
      handleReady,
      log: console.log,
    };
  },
});
</script>

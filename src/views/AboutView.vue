<template>
  <!--
    By default, the editor completely fills its parent HTML element.
    If you directly use the editor in the <body> element, make sure to use
    a wrapper <div> with specified width and height properties:
          -->
  <div style="width: 100vw; height: 100vh">
    <baklava-editor :view-model="baklava" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  EditorComponent,
  useBaklava,
  DependencyEngine,
  applyResult,
} from "baklavajs";
import "@baklavajs/themes/dist/syrup-dark.css";

export default defineComponent({
  components: {
    "baklava-editor": EditorComponent,
  },
  setup() {
    const baklava = useBaklava();
    const engine = new DependencyEngine(baklava.editor);

    const token = Symbol();
    engine.events.afterRun.subscribe(token, (result) => {
      engine.pause();
      applyResult(result, baklava.editor);
      engine.resume();
    });

    engine.start();

    return { baklava };
  },
});
</script>

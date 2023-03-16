<template>
  <div class="dck" style="position: relative">
    <v-app-bar>
      <template v-slot:append>
        <div class="d-flex justify-center align-baseline" style="gap: 1rem">
          <v-dialog v-model="dialogProblemSave" persistent width="auto">
            <template v-slot:activator="{ props }">
              <v-btn
                v-if="user"
                color="blue-grey"
                v-bind="props"
                variant="flat"
                prepend-icon="mdi-check-bold"
              >
                Save Problem
              </v-btn>
            </template>
            <v-card>
              <v-card-title class="text-h5"> Save problem? </v-card-title>
              <v-card-text
                >This action is irreversible! Previous versions of the file will
                be discarded and the current changes will become
                permanent.</v-card-text
              >
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  color="green-darken-1"
                  variant="text"
                  @click="dialogProblemSave = false"
                >
                  Save
                </v-btn>
                <v-btn
                  color="error"
                  variant="text"
                  @click="dialogProblemSave = false"
                >
                  Cancel
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-dialog v-model="dialogProblemRestore" persistent width="auto">
            <template v-slot:activator="{ props }">
              <v-btn
                v-if="user"
                color="blue-grey"
                v-bind="props"
                prepend-icon="mdi-rotate-left"
                variant="flat"
              >
                Restore to previous version
              </v-btn>
            </template>
            <v-card>
              <v-card-title class="text-h5"> Discard changes? </v-card-title>
              <v-card-text
                >This action is irreversible. Any changes you made to this file
                after last save will be discarded.</v-card-text
              >
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  color="green-darken-1"
                  variant="text"
                  @click="dialogProblemRestore = false"
                >
                  Restore
                </v-btn>
                <v-btn
                  color="error"
                  variant="text"
                  @click="dialogProblemRestore = false"
                >
                  Cancel
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-btn
            :loading="loading[2]"
            :disabled="loading[2]"
            color="blue-grey"
            variant="flat"
            prepend-icon="mdi-auto-fix"
            @click="encodeDCK"
          >
            Encode DCK to Problem
          </v-btn>
        </div>
      </template>
    </v-app-bar>
    <ProblemEditor ref="editor" />
  </div>
</template>

<script lang="ts">
import {
  loadActiveDomain,
  encodeDCK,
loadActiveProblem,
} from "../languageSupport/decomposer/domainLoader";
import { defineComponent } from "vue";
import ProblemEditor from "../components/ProblemEditor.vue";
import { useProblemStore } from "../stores/problemStore";
import { useNodeStore } from "../stores/nodeStore";
import { getAuth } from "firebase/auth";

export default defineComponent({
  name: "ProblemView",
  data() {
    return {
      user: getAuth().currentUser,
      menuVisible: true,
      loading: [],
      dialogProblemSave: false,
      dialogProblemRestore: false,
      problemStore: useProblemStore(),
    };
  },
  mounted() {
    this.loadToDck();
  },
  methods: {
    load(i: number) {
      this.loading[i] = true;
      setTimeout(() => (this.loading[i] = false), 3000);
    },
    loadToDck() {
      this.problemStore.loadActiveProblem(
        loadActiveProblem(this.$refs.editor.code),
        this.$refs.editor.code
      );
    },
    encodeDCK() {
      // TODO: Transitioning to a state via an effect doesn't work
      encodeDCK();
      this.$refs.editor.code = this.problemStore.rawActiveProblem;
    },
    saveEncoderState() {
      this.editorState = this.$refs.encoder.editor.save();
      useNodeStore().loadActiveEditorState(this.editorState);
    },
  },
  components: {
    ProblemEditor,
  },
});
</script>

<style>
.custom-loader {
  animation: loader 1s infinite;
  display: flex;
}
@-moz-keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
@-webkit-keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
@-o-keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
@keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>

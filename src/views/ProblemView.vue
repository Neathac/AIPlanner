<template>
  <div class="dck" style="position: relative">
    <v-app-bar>
      <template v-slot:append>
        <div class="d-flex justify-center align-baseline" style="gap: 1rem">
          <v-container v-if="loggedIn">
            <v-dialog v-model="dialogSaveAsNew" persistent>
              <template v-slot:activator="{ props }">
                <v-btn v-bind="props" :loading="loading" :disabled="loading">
                  Save as new Problem
                </v-btn>
              </template>
              <v-card>
                <v-card-title class="text-h5"> Create Problem </v-card-title>
                <v-card-item>
                  <v-text-field
                    v-model="newName"
                    label="Domain name"
                  ></v-text-field>
                </v-card-item>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    color="green-darken-1"
                    variant="text"
                    @click="createAsNew(newName)"
                  >
                    Save
                  </v-btn>
                  <v-btn
                    color="error"
                    variant="text"
                    @click="dialogSaveAsNew = false"
                  >
                    Cancel
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-container>
          <v-container v-if="loggedIn">
            <v-dialog v-model="dialogProblemSave" persistent width="auto">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-if="loggedIn"
                  :loading="loading"
                  :disabled="loading"
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
                  >This action is irreversible! Previous versions of the file
                  will be discarded and the current changes will become
                  permanent.</v-card-text
                >
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    color="green-darken-1"
                    variant="text"
                    @click="saveProblem"
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
          </v-container>
          <v-container>
            <v-dialog v-model="dialogProblemRestore" persistent width="auto">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-if="loggedIn"
                  :loading="loading"
                  :disabled="loading"
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
                  >This action is irreversible. Any changes you made to this
                  file after last save will be discarded.</v-card-text
                >
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    color="green-darken-1"
                    variant="text"
                    @click="restoreProblem"
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
          </v-container>
          <v-container>
            <v-btn
              :loading="loading"
              :disabled="loading"
              color="blue-grey"
              variant="flat"
              prepend-icon="mdi-auto-fix"
              @click="encodeDCK"
            >
              Encode DCK to Problem
            </v-btn>
          </v-container>
        </div>
      </template>
    </v-app-bar>
    <template v-if="editorType == 'Problem'">
      <ProblemEditor ref="editor" />
    </template>
  </div>
</template>

<script lang="ts" setup>
import {
  encodeProblemDCK,
  //encodeProblemDCK,
  loadActiveProblem,
} from "../languageSupport/decomposer/domainLoader";
import { Ref, nextTick, onMounted, ref } from "vue";
import ProblemEditor from "../components/ProblemEditor.vue";
import { useProblemStore } from "../stores/problemStore";
//import { useNodeStore } from "../stores/nodeStore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Manager } from "../stores/resourceManager";
import { useDocumentStore } from "../stores/documentStore";
import { EMPTY_PROBLEM } from "@functions/systemTypes";
import EventBus from "../lib/EventBus";
import { NEW_FILE, NEW_PROBLEM } from "../helpers/consts";
import { store } from "../store";
const loading: Ref<boolean> = ref(false);
const loggedIn: Ref<boolean> = ref(false);
const dialogProblemSave: Ref<boolean> = ref(false);
const dialogProblemRestore: Ref<boolean> = ref(false);
const editor = ref(null);
const auth = ref(getAuth());
const dialogSaveAsNew: Ref<boolean> = ref(false);
const newName: Ref<string> = ref("Default name");
const editorType: Ref<string> = ref("Problem");

onMounted(() => {
  loadToDck();
  EventBus.on(NEW_PROBLEM, async (_) => {
    editorType.value = "a";
    await nextTick();
    editorType.value = "Problem";
  });
  if (getAuth().currentUser) loggedIn.value = true;
});

onAuthStateChanged(auth.value, (user) => {
  if (user) {
    loggedIn.value = true;
  } else {
    loggedIn.value = false;
  }
});

function loadToDck() {
  useProblemStore().loadActiveProblem(
    loadActiveProblem(editor.value.code),
    editor.value.code
  );
  store.activeProblem = editor.value.code;
}

async function encodeDCK() {
  loadToDck();
  await encodeProblemDCK();
  editor.value.code = useProblemStore().rawActiveProblem;
}

async function saveProblem() {
  loading.value = true;
  dialogProblemSave.value = false;
  const prob = useDocumentStore().getActiveProblemById(
    useDocumentStore().activeProblem
  );
  prob.rawProblem = editor.value.code;
  await Manager.updateProblem(prob).then((prob) => {
    useProblemStore().rawActiveProblem = prob.rawProblem;
    useDocumentStore().modifyActiveProblem(prob);
    store.activeProblem = prob.rawProblem;
    loading.value = false;
  });
}

async function restoreProblem() {
  loading.value = true;
  Manager.renewProblem(useDocumentStore().activeProblem).then((prob) => {
    editor.value.code = prob.rawProblem;
    dialogProblemRestore.value = false;
    loading.value = false;
  });
}

async function createAsNew(problemName: string) {
  loading.value = true;
  dialogSaveAsNew.value = false;
  const dummyProblem = EMPTY_PROBLEM;
  dummyProblem.name = problemName;
  dummyProblem.parentDomain = useDocumentStore().activeDomain;
  dummyProblem.rawProblem = useProblemStore().getRawValue;
  Manager.createProblem(dummyProblem).then((res) => {
    useProblemStore().loadActiveProblem(
      loadActiveProblem(res.rawProblem),
      res.rawProblem
    );
    store.activeProblem = res.rawProblem;
    EventBus.emit(NEW_FILE);
    loading.value = false;
  });
}
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

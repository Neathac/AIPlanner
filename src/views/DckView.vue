<template>
  <div class="dck" style="position: relative">
    <v-app-bar>
      <template v-slot:prepend>
        <v-btn-toggle
          v-model="editorType"
          rounded="0"
          color="deep-purple-accent-3"
          group
          mandatory
          variant="outlined"
          ><v-btn value="Domain"> Domain Editor </v-btn>
          <v-btn value="ATB" @click="loadToDck"> ATB </v-btn>
        </v-btn-toggle>
      </template>
      <template v-slot:append>
        <div class="d-flex justify-center align-baseline" style="gap: 1rem">
          <template v-if="editorType == 'Domain'">
            <template v-if="loggedIn">
              <v-dialog v-model="dialogSaveAsNew" persistent>
                <template v-slot:activator="{ props }">
                  <v-btn v-bind="props"> Save as new Domain </v-btn>
                </template>
                <v-card>
                  <v-card-title class="text-h5"> Create domain </v-card-title>
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
              <v-dialog v-model="dialogDomainSave" persistent width="auto">
                <template v-slot:activator="{ props }">
                  <v-btn
                    :loading="loading"
                    :disabled="loading"
                    color="blue-grey"
                    v-bind="props"
                    variant="flat"
                    prepend-icon="mdi-check-bold"
                  >
                    Save Domain
                  </v-btn>
                </template>
                <v-card>
                  <v-card-title class="text-h5"> Save domain? </v-card-title>
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
                      @click="updateDomainState()"
                    >
                      Save
                    </v-btn>
                    <v-btn
                      color="error"
                      variant="text"
                      @click="dialogDomainSave = false"
                    >
                      Cancel
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
              <v-dialog v-model="dialogDomainRestore" persistent width="auto">
                <template v-slot:activator="{ props }">
                  <v-btn
                    color="blue-grey"
                    v-bind="props"
                    prepend-icon="mdi-rotate-left"
                    variant="flat"
                  >
                    Restore to previous version
                  </v-btn>
                </template>
                <v-card>
                  <v-card-title class="text-h5">
                    Discard changes?
                  </v-card-title>
                  <v-card-text
                    >This action is irreversible. Any changes you made to this
                    file after last save will be discarded.</v-card-text
                  >
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                      color="green-darken-1"
                      variant="text"
                      @click="restoreDomain"
                    >
                      Restore
                    </v-btn>
                    <v-btn
                      color="error"
                      variant="text"
                      @click="dialogDomainRestore = false"
                    >
                      Cancel
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </template>
            <v-btn
              :loading="loading"
              :disabled="loading"
              color="blue-grey"
              variant="flat"
              prepend-icon="mdi-auto-fix"
              @click="encodeDCK"
            >
              Encode DCK to Domain
            </v-btn>
          </template>
        </div>
      </template>
    </v-app-bar>
    <DomainEditor v-if="editorType == 'Domain'" ref="editor" />
    <AtbEditor v-if="editorType == 'ATB'" ref="encoder" />
  </div>
</template>

<script setup lang="ts">
import {
  encodeDck,
  loadActiveDomain,
} from "../languageSupport/decomposer/domainLoader";
import { nextTick, ref, Ref, onMounted } from "vue";
import DomainEditor from "../components/DomainEditor.vue";
import AtbEditor from "../components/AtbEditor.vue";
import { useDomainStore } from "../stores/domainStore";
import EventBus from "../lib/EventBus";
import { NEW_DOMAIN, NEW_FILE } from "../helpers/consts";
import { Manager } from "../stores/resourceManager";
import { useDocumentStore } from "../stores/documentStore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useAtbStore } from "../stores/atbStore";
import { EMPTY_DOMAIN } from "@functions/systemTypes";
import { store } from "../store";

const editorType: Ref<string> = ref("Domain");
const loading: Ref<boolean> = ref(false);
const dialogDomainSave: Ref<boolean> = ref(false);
const dialogDomainRestore: Ref<boolean> = ref(false);
const loggedIn: Ref<boolean> = ref(false);
const editor = ref(null);
const auth = ref(getAuth());
const dialogSaveAsNew: Ref<boolean> = ref(false);
const newName: Ref<string> = ref("Default name");

onAuthStateChanged(auth.value, (user) => {
  if (user) {
    loggedIn.value = true;
  } else {
    loggedIn.value = false;
  }
});

onMounted(() => {
  EventBus.on(NEW_DOMAIN, async (_) => {
    editorType.value = "a";
    await nextTick();
    editorType.value = "Domain";
  });
  if (getAuth().currentUser) loggedIn.value = true;
});

function loadToDck() {
  useDomainStore().loadActiveDomain(
    loadActiveDomain(editor.value.code),
    editor.value.code
  );
}

async function restoreDomain() {
  loading.value = true;
  await Manager.renewDomain(useDocumentStore().getActiveDomain.id);
  editor.value.code = useDomainStore().rawActiveDomain;
  dialogDomainRestore.value = false;
  loading.value = false;
}

function encodeDCK() {
  encodeDck();
  editor.value.code = useDomainStore().rawActiveDomain;
}

async function updateDomainState() {
  dialogDomainSave.value = false;
  loading.value = true;
  await Manager.updateDomain({
    id: useDocumentStore().getActiveDomain.id,
    rawDomain: editor.value.code,
    atbDck: useAtbStore().dck,
  }).then((dom) => {
    editor.value.code = dom.rawDomain;
    useAtbStore().dck = dom.atbDck;
    useDocumentStore().modifyDomain(dom);
    useDomainStore().rawActiveDomain = dom.rawDomain;
    store.activeDomain = dom.rawDomain;
    loading.value = false;
  });
}

async function createAsNew(domainName: string) {
  loading.value = true;
  const dummyDomain = EMPTY_DOMAIN;
  dummyDomain.name = domainName;
  dummyDomain.rawDomain = useDomainStore().getRawValue;
  dummyDomain.atbDck = useAtbStore().dck;
  Manager.createDomain(dummyDomain).then((res) => {
    useDomainStore().loadActiveDomain(
      loadActiveDomain(res.rawDomain),
      res.rawDomain
    );
    EventBus.emit(NEW_FILE);
    loading.value = false;
    dialogSaveAsNew.value = false;
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

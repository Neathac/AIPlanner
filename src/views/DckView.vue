<template>
  <div class="dck">
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
          <v-btn value="DCK"> DCK Encoder </v-btn>
        </v-btn-toggle>
      </template>
      <template v-slot:append>
        <div class="d-flex justify-center align-baseline" style="gap: 1rem">
          <template v-if="editorType == 'Domain'">
            <v-dialog v-model="dialogDomainSave" persistent width="auto">
              <template v-slot:activator="{ props }">
                <v-btn
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
                    @click="dialogDomainSave = false"
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
                    @click="dialogDomainRestore = false"
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
            <v-btn
              :loading="loading[2]"
              :disabled="loading[2]"
              color="blue-grey"
              variant="flat"
              prepend-icon="mdi-auto-fix"
            >
              Encode DCK to Domain
            </v-btn>
            <v-btn
              :loading="loading[2]"
              :disabled="loading[2]"
              color="blue-grey"
              prepend-icon="mdi-cloud-upload"
              variant="flat"
              @click="loadToDck"
            >
              Load to DCK Encoder
            </v-btn>
          </template>
          <template v-if="editorType == 'DCK'">
            <v-btn
              :loading="loading[2]"
              :disabled="loading[2]"
              color="blue-grey"
              prepend-icon="mdi-check-bold"
              variant="flat"
            >
              Save ATB-DCK
            </v-btn>
            <v-btn
              :loading="loading[2]"
              :disabled="loading[2]"
              color="blue-grey"
              prepend-icon="mdi-check-bold"
              variant="flat"
            >
              Load ATB-DCK
            </v-btn>
          </template>
        </div>
      </template>
    </v-app-bar>
    <DomainEditor v-if="editorType == 'Domain'" ref="editor" />
    <NodeEditor v-if="editorType == 'DCK'" ref="encoder" />
  </div>
</template>

<script lang="ts">
import { loadActiveDomain } from "../languageSupport/decomposer/domainLoader";
import { defineComponent, h } from "vue";
import DomainEditor from "../components/DomainEditor.vue";
import NodeEditor from "../components/NodeEditor.vue";
import { useDomainStore } from "../stores/domainStore";

export default defineComponent({
  name: "DckView",
  data() {
    return {
      menuVisible: true,
      editorType: "Domain",
      loading: [],
      dialogDomainSave: false,
      dialogDomainRestore: false,
      domainStore: useDomainStore(),
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
      this.domainStore.loadActiveDomain(
        loadActiveDomain(this.$refs.editor.code),
        this.$refs.editor.code
      );
    },
    /*encodeDCK() {
      encodeDCK();
    },
    saveEncoderState() {
      this.editorState = this.$refs.encoder.editor.save();
      useNodeStore().loadActiveEditorState(this.editorState);
    },
    loadEncoderState() {
      this.$refs.encoder.editor.load(this.editorState);
    },*/
  },
  components: {
    DomainEditor,
    NodeEditor,
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

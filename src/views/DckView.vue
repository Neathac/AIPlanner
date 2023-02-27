<template>
  <div class="dck">
    <v-app-bar>
      <template v-slot:prepend>
        <v-btn-toggle
          v-model="editor"
          rounded="0"
          color="deep-purple-accent-3"
          group
          mandatory
          variant="outlined"
          ><v-btn value="Domain" variant="flat"> Domain Editor </v-btn>
          <v-btn value="DCK" variant="flat"> DCK Encoder </v-btn>
        </v-btn-toggle>
      </template>
      <template v-slot:append>
        <div class="d-flex justify-center align-baseline" style="gap: 1rem">
          <template v-if="editor == 'Domain'">
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
              @click="load(1)"
            >
              Encode DCK to Domain
            </v-btn>
            <v-btn
              :loading="loading[2]"
              :disabled="loading[2]"
              color="blue-grey"
              prepend-icon="mdi-cloud-upload"
              variant="tonal"
              @click="load(1)"
            >
              Upload File
            </v-btn>
          </template>
          <template v-if="editor == 'DCK'">
            <v-btn
              :loading="loading[2]"
              :disabled="loading[2]"
              color="blue-grey"
              prepend-icon="mdi-check-bold"
              variant="flat"
              @click="load(1)"
            >
              Save ATB-DCK
            </v-btn>
          </template>
        </div>
      </template>
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
      loading: [],
      dialogDomainSave: false,
      dialogDomainRestore: false,
    };
  },
  methods: {
    load(i) {
      this.loading[i] = true;
      setTimeout(() => (this.loading[i] = false), 3000);
    },
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

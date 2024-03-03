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
          <!--<v-btn value="DCK"> DCK Encoder </v-btn>-->
          <v-btn value="ATB"> ATB </v-btn>
        </v-btn-toggle>
      </template>
      <template v-slot:append>
        <div class="d-flex justify-center align-baseline" style="gap: 1rem">
          <template v-if="editorType == 'Domain'">
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
              :loading="loading"
              :disabled="loading"
              color="blue-grey"
              variant="flat"
              prepend-icon="mdi-auto-fix"
              @click="encodeDCK"
            >
              Encode DCK to Domain
            </v-btn>
            <v-btn
              :loading="loading"
              :disabled="loading"
              color="blue-grey"
              prepend-icon="mdi-cloud-upload"
              variant="flat"
              @click="loadToDck"
            >
              Load to DCK Encoder
            </v-btn>
          </template>
          <!--<template v-if="editorType == 'DCK'">
            <v-btn
              :loading="loading"
              :disabled="loading"
              color="blue-grey"
              prepend-icon="mdi-check-bold"
              variant="flat"
              @click="saveEncoderState"
            >
              Save ATB-DCK
            </v-btn>
            <v-btn
              :loading="loading"
              :disabled="loading"
              color="blue-grey"
              prepend-icon="mdi-check-bold"
              variant="flat"
              @click="loadEncoderState"
            >
              Load ATB-DCK
            </v-btn>
          </template>-->
        </div>
      </template>
    </v-app-bar>
    <DomainEditor v-if="editorType == 'Domain'" ref="editor" />
    <!--<NodeEditor
      v-if="editorType == 'DCK'"
      ref="encoder"
      @encoderChanged="saveEncoderState"
      @askForState="loadEncoderState"
    />-->
    <AtbEditor
      v-if="editorType == 'ATB'"
      ref="encoder"
      @encoderChanged="saveEncoderState"
    />
  </div>
</template>

<script lang="ts">
import {
  loadActiveDomain,
  encodeDCK,
} from "../languageSupport/decomposer/domainLoader";
import { defineComponent, nextTick, h } from "vue";
import DomainEditor from "../components/DomainEditor.vue";
//import NodeEditor from "../components/NodeEditor.vue";
import AtbEditor from "../components/AtbEditor.vue";
import { useDomainStore } from "../stores/domainStore";
import { useNodeStore } from "../stores/nodeStore";
import { OptionPlugin } from "@baklavajs/plugin-options-vue3";
import { ViewPlugin } from "@baklavajs/plugin-renderer-vue3";
import editorFactory from "../languageSupport/nodeFactory/nodeFactory";
import ActionSidebarOption from "../components/Sidebars/ActionSidebarOption.vue";
import GoalSidebarOption from "../components/Sidebars/GoalSidebarOption.vue";
import StateConstraintSidebarOption from "../components/Sidebars/StateConstraintSidebarOption.vue";
import { Engine } from "@baklavajs/plugin-engine";
//import { deepCopy } from "@firebase/util";
//import { ACTION_NODE_TYPE } from "../languageSupport/nodeFactory/ActionNode";
//import { STATE_CONSTRAINT_NODE_TYPE } from "../languageSupport/nodeFactory/StateConstraintNode";
//import { GOAL_NODE_TYPE } from "../languageSupport/nodeFactory/GoalNode";
import EventBus from "../lib/EventBus";
import { NEW_DOMAIN } from "../helpers/consts";
import { Manager } from "../stores/resourceManager";
import { useDocumentStore } from "../stores/documentStore";

export default defineComponent({
  name: "DckView",
  data() {
    /*
      This whole stupid useless bit is so that the editor instance can remember its state upon changing the viewed editor. 
      The save/load methods don't function properly with plugins it would seem.
    */
   /*
    const editor = editorFactory();
    const viewPlugin = new ViewPlugin();
    const engine = new Engine(true);
    editor.use(viewPlugin);
    editor.use(new OptionPlugin());
    editor.use(engine);
    // NEVER touch this ever. Oficially legacy code as of today
    viewPlugin.registerOption("ActionSidebarOption", {
      components: ActionSidebarOption,
      render: () => h(ActionSidebarOption),
    });
    viewPlugin.registerOption("StateConstraintSidebarOption", {
      components: StateConstraintSidebarOption,
      render: () => h(StateConstraintSidebarOption),
    });
    viewPlugin.registerOption("GoalSidebarOption", {
      components: GoalSidebarOption,
      render: () => h(GoalSidebarOption),
    });

    if (useNodeStore().getActiveStateNodes.length > 0)
      editor.load(useNodeStore().getActiveEditorState);
    */
    return {
      menuVisible: true,
      editorType: "Domain",
      loading: false,
      dialogDomainSave: false,
      dialogDomainRestore: false,
      domainStore: useDomainStore(),
      //editorState: editor.save(),
    };
  },
  mounted() {
    // this.loadToDck();
    EventBus.on(NEW_DOMAIN, async (_e) => {
      this.editorType = "a";
      await nextTick();
      this.editorType = "Domain";
    });
  },
  methods: {
    load() {
      this.loading = true;
      setTimeout(() => (this.loading = false), 3000);
    },
    loadToDck() {
      this.domainStore.loadActiveDomain(
        loadActiveDomain(this.$refs.editor.code),
        this.$refs.editor.code
      );
    },
    encodeDCK() {
      // TODO: Transitioning to a state via an effect doesn't work
      encodeDCK();
      this.$refs.editor.code = this.domainStore.rawActiveDomain;
    },
    saveEncoderState() {
      this.editorState = this.$refs.encoder.editor.save();
      useNodeStore().loadActiveEditorState(this.editorState);
    },
    updateDomainState() {
      this.dialogDomainSave = false;
      this.loading = true;
      Manager.updateDomain({
        id: useDocumentStore().getActiveDomain.id,
        rawDomain: this.$refs.editor.code,
      }).then(() => {
        this.loading = false;
      });
    },
    updateEncoderState() {
      this.dialogDomainSave = false;
      this.loading = true;
      Manager.updateDomain({
        id: useDocumentStore().getActiveDomain.id,
        dckState: JSON.stringify(this.$refs.encoder.editor.save()),
      }).then(() => {
        this.loading = false;
      });
    },
    /*loadEncoderState() {
      // We need to manually fill in the options, as load doesn't consider them
      const stateCopy = deepCopy(this.editorState);
      this.$refs.encoder.editor.load(this.editorState);
      for (const node of stateCopy.nodes) {
        const nodeRef = this.$refs.encoder.editor.nodes.find((val) => {
          return val.id === node.id;
        });
        if (nodeRef) {
          node.options.forEach((option) => {
            if (!nodeRef.options.has(option[0])) {
              if (node.type === ACTION_NODE_TYPE) {
                nodeRef.addNewPredicate();
                nodeRef.setOptionValue(option[0], option[1]);
              } else if (node.type === STATE_CONSTRAINT_NODE_TYPE) {
                nodeRef.addConstraintOption();
                nodeRef.setOptionValue(option[0], option[1]);
              } else if (node.type === GOAL_NODE_TYPE) {
                nodeRef.addNewPredicate();
                nodeRef.setOptionValue(option[0], option[1]);
              }
            }
          });
        }
      }
    },*/
  },
  components: {
    DomainEditor,
    //NodeEditor,
    AtbEditor,
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

<template>
  <v-card>
    <v-tabs v-model="tab" color="deep-purple-accent-4" align-tabs="center">
      <v-tab :value="1">Attributed states</v-tab>
      <v-tab :value="2">DCK memory</v-tab>
      <v-tab :value="3">DCK transitions</v-tab>
    </v-tabs>
    <v-window v-model="tab">
      <v-window-item :key="1" :value="1">
        <v-container fluid style="max-height: 80vh; overflow-y: scroll">
          <v-row v-for="(dckState, i) in DCKstates" :key="dckState.name">
            <DckPredForm
              :atb-state="dckState"
              :index="i"
              @deleteEvent="deleteState(i)"
            />
          </v-row>
          <v-row class="justify-center">
            <v-btn color="green" icon="mdi-plus" @click="addDckState"></v-btn>
          </v-row>
        </v-container>
      </v-window-item>
      <v-window-item :key="2" :value="2">
        <v-container fluid style="max-height: 80vh; overflow-y: scroll">
          <v-row v-for="(dckMem, i) in DCKmemory" :key="dckMem.name">
            <DckPredForm
              :atb-state="dckMem"
              :index="i"
              @deleteEvent="deleteMemory(i)"
            />
          </v-row>
          <v-row class="justify-center">
            <v-btn color="green" icon="mdi-plus" @click="addDckMemory"></v-btn>
          </v-row>
        </v-container>
      </v-window-item>
      <v-window-item :key="3" :value="3">
        <v-container fluid style="max-height: 80vh; overflow-y: scroll">
          <v-row v-for="(dckTransition, i) in DCKtransitions" :key="i">
            <TransitionForm
              :atb-transition="dckTransition"
              :index="i"
              @deleteEvent="deleteTransition(i)"
            />
          </v-row>
          <v-row class="justify-center">
            <v-btn
              color="green"
              icon="mdi-plus"
              @click="addDckTransition"
            ></v-btn>
          </v-row>
        </v-container>
      </v-window-item>
    </v-window>
  </v-card>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import DckPredForm from "./DckPredForm.vue";
import { useAtbStore } from "../stores/atbStore";
import {
  emptyAction,
  emptyAttributedMemory,
  emptyAttributedState,
  emptyAttributedTransition,
} from "@functions/parserTypes";
import TransitionForm from "./TransitionForm.vue";

export default defineComponent({
  data() {
    return {
      atbStore: useAtbStore(),
      tab: null,
      DCKstates: useAtbStore().getDCKstates,
      DCKmemory: useAtbStore().getDCKmemory,
      DCKtransitions: useAtbStore().getDCKtransitions,
    };
  },
  methods: {
    addDckState() {
      const temp = emptyAttributedState();
      temp.name = "State_" + this.DCKstates.length;
      temp.numOfVars = 0;
      this.DCKstates.push(temp);
      this.atbStore.loadNewDckStates(this.DCKstates);
    },
    deleteState(i: number) {
      this.DCKstates.splice(i, 1);
      this.atbStore.loadNewDckStates(this.DCKstates);
    },
    addDckMemory() {
      const temp = emptyAttributedMemory();
      temp.name = "Memory_" + this.DCKmemory.length;
      temp.numOfVars = 0;
      this.DCKmemory.push(temp);
      this.atbStore.loadNewDckMemory(this.DCKmemory);
    },
    deleteMemory(i: number) {
      this.DCKmemory.splice(i, 1);
      this.atbStore.loadNewDckMemory(this.DCKmemory);
    },
    addDckTransition() {
      const temp = emptyAttributedTransition();
      console.log(this.DCKstates);
      temp.originState = this.DCKstates[0];
      temp.targetState = this.DCKstates[0];
      temp.operator = emptyAction();
      this.DCKtransitions.push(temp);
      this.atbStore.loadNewDckTransitions(this.DCKtransitions);
    },
    deleteTransition(i: number) {
      this.DCKtransitions.splice(i, 1);
      this.atbStore.loadNewDckTransitions(this.DCKtransitions);
    },
  },
  components: {
    DckPredForm,
    TransitionForm,
  },
});
</script>

<template>
  <v-card>
    <v-tabs v-model="tab" color="deep-purple-accent-4" align-tabs="center">
      <v-tab :value="1">Attributed states</v-tab>
      <v-tab :value="2">DCK memory</v-tab>
      <v-tab :value="3" v-if="DCKstates.length > 0">DCK transitions</v-tab>
      <v-tab :value="4" v-if="DCKstates.length > 0"
        >State initialization rules</v-tab
      >
    </v-tabs>
    <v-window v-model="tab">
      <v-window-item :key="1" :value="1">
        <v-container fluid style="max-height: 80vh; overflow-y: scroll">
          <v-row v-for="(dckState, i) in DCKstates" :key="dckState.name">
            <DckPredForm
              :atb-state="dckState"
              :index="i"
              @saveEvent="save()"
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
              @saveEvent="save()"
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
              @saveEvent="save()"
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
      <v-window-item :key="4" :value="4">
        <v-container fluid style="max-height: 80vh; overflow-y: scroll">
          <v-row v-for="(rule, i) in initRules" :key="i">
            <StateInitRule :rule="rule" :index="i" @saveEvent="save()" />
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
  AttributedConstraint,
  AttributedInitRule,
  emptyAttributedInitRule,
  emptyAttributedMemory,
  emptyAttributedState,
  emptyAttributedTransition,
  emptyNoOperator,
} from "@functions/parserTypes";
import TransitionForm from "./TransitionForm.vue";
import StateInitRule from "./StateInitRule.vue";

export default defineComponent({
  data() {
    return {
      atbStore: useAtbStore(),
      tab: null,
      DCKstates: useAtbStore().getDCKstates,
      DCKmemory: useAtbStore().getDCKmemory,
      DCKtransitions: useAtbStore().getDCKtransitions,
      initRules: useAtbStore().getDCKrules,
    };
  },
  methods: {
    updatePossibleRules() {
      this.initRules = [...new Set(this.initRules)];
      const possibleRules = new Array<AttributedConstraint>();
      const newInitRules = new Array<AttributedInitRule>();
      useAtbStore().getDCKmemory.forEach((val) =>
        possibleRules.push({
          predicate: val.name,
          variables: val.specificVars ?? this.dummyVariables(val.numOfVars),
          negated: false,
          isInEffect: false,
        })
      );
      useAtbStore().getDCKstates.forEach((val) =>
        possibleRules.push({
          predicate: val.name,
          variables: val.specificVars ?? this.dummyVariables(val.numOfVars),
          negated: false,
          isInEffect: false,
        })
      );
      possibleRules.forEach((val) => {
        const index = this.initRules.findIndex(
          (rule) => rule.rulePredicate.name == val.predicate
        );
        if (index < 0) {
          const dummyRule = emptyAttributedInitRule();
          dummyRule.rulePredicate.name = val.predicate;
          dummyRule.rulePredicate.varNames = val.variables;
          this.initRules.push(dummyRule);
        } else if (
          this.initRules[index].rulePredicate.varNames.length !=
          val.variables.length
        ) {
          this.initRules[index].rulePredicate.varNames = val.variables;
        }
      });
      this.initRules.forEach((rule) => {
        const found = possibleRules.find(
          (val) => val.predicate == rule.rulePredicate.name
        );
        if (found) newInitRules.push(rule);
      });
      this.initRules = [...new Set(newInitRules)];
    },
    dummyVariables(numOfVars: number): String[] {
      if (numOfVars === 0) return [];
      let str = [];
      for (let i = 0; i < numOfVars; i++) {
        str.push("?var_" + i);
      }
      return str;
    },
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
      temp.originState = this.DCKstates[0];
      temp.targetState = this.DCKstates[0];
      temp.operator = emptyNoOperator();
      this.DCKtransitions.push(temp);
      this.atbStore.loadNewDckTransitions(this.DCKtransitions);
    },
    deleteTransition(i: number) {
      this.DCKtransitions.splice(i, 1);
      this.atbStore.loadNewDckTransitions(this.DCKtransitions);
    },
    save() {
      this.atbStore.loadNewDckStates(this.DCKstates);
      this.atbStore.loadNewDckMemory(this.DCKmemory);
      this.atbStore.loadNewDckTransitions(this.DCKtransitions);
      this.atbStore.loadNewDckRules(this.initRules);
      this.updatePossibleRules();
    },
  },
  components: {
    DckPredForm,
    TransitionForm,
    StateInitRule,
  },
});
</script>

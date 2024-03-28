<template>
  <v-card>
    <v-tabs v-model="tab" color="deep-purple-accent-4" align-tabs="center">
      <v-tab :value="1">Attributed states</v-tab>
      <v-tab :value="2">DCK memory</v-tab>
      <v-tab :value="3" v-if="DCKstates.length > 0">DCK transitions</v-tab>
      <v-tab :value="4" v-if="DCKstates.length > 0"
        >State initialization rules</v-tab
      >
      <v-tab :value="5" v-if="DCKstates.length > 0">Edit rules in Prolog</v-tab>
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
            <DckMemoryForm
              :atb-memory="dckMem"
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
          <v-row class="justify-center">
            <v-expansion-panels multiple>
              <v-expansion-panel
                v-for="(dckTransition, i) in DCKtransitions"
                :key="i"
                :title="
                  dckTransition.originState.name +
                  ' ' +
                  dckTransition.operator.name +
                  ' ' +
                  dckTransition.targetState.name
                "
              >
                <v-expansion-panel-text>
                  <TransitionForm
                    :atb-transition="dckTransition"
                    :index="i"
                    @saveEvent="save()"
                    @deleteEvent="deleteTransition(i)"
                  />
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-row>
          <v-divider vertical></v-divider>
          <v-row class="justify-center mt-3">
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
          <v-row class="justify-center">
            <v-expansion-panels multiple>
              <v-expansion-panel
                v-for="(rule, i) in initRules"
                :key="i"
                :title="rule.rulePredicate.name"
              >
                <v-expansion-panel-text>
                  <StateInitRule :rule="rule" :index="i" @saveEvent="save()" />
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-row>
        </v-container>
      </v-window-item>
      <v-window-item :key="5" :value="5">
        <v-container fluid style="max-height: 80vh; overflow-y: scroll">
          <PrologAtbEditor ref="editor" />
        </v-container>
      </v-window-item>
    </v-window>
  </v-card>
</template>

<script lang="ts" setup>
import { Ref, ref } from "vue";
import DckPredForm from "./DckPredForm.vue";
import { useAtbStore } from "../stores/atbStore";
import {
  AttributedConstraint,
  AttributedInitRule,
  AttributedMemory,
  AttributedState,
  AttributedTransition,
  emptyAttributedInitRule,
  emptyAttributedMemory,
  emptyAttributedState,
  emptyAttributedTransition,
  emptyNoOperator,
} from "@functions/parserTypes";
import TransitionForm from "./TransitionForm.vue";
import StateInitRule from "./StateInitRule.vue";
import DckMemoryForm from "./DckMemoryForm.vue";
import PrologAtbEditor from "./PrologAtbEditor.vue";
import { composeDomainKnowledgeBase } from "../languageSupport/decomposer/prologLoader";
import { useDocumentStore } from "../stores/documentStore";

const tab: Ref<number> = ref(null);
const DCKstates: Ref<Array<AttributedState>> = ref(useAtbStore().getDCKstates);
const DCKmemory: Ref<Array<AttributedMemory>> = ref(useAtbStore().getDCKmemory);
const DCKtransitions: Ref<Array<AttributedTransition>> = ref(
  useAtbStore().getDCKtransitions
);
const initRules: Ref<Array<AttributedInitRule>> = ref(
  useAtbStore().getDCKrules
);
const editor = ref(null);

function updatePossibleRules() {
  initRules.value = [...new Set(initRules.value)];
  const possibleRules = new Array<AttributedConstraint>();
  const newInitRules = new Array<AttributedInitRule>();
  useAtbStore().getDCKmemory.forEach((val) =>
    possibleRules.push({
      predicate: val.name,
      variables: val.specificVars ?? dummyVariables(val.numOfVars),
      negated: false,
      isInEffect: false,
    })
  );
  useAtbStore().getDCKstates.forEach((val) =>
    possibleRules.push({
      predicate: val.name,
      variables: val.specificVars ?? dummyVariables(val.numOfVars),
      negated: false,
      isInEffect: false,
    })
  );
  possibleRules.forEach((val) => {
    const index = initRules.value.findIndex(
      (rule) => rule.rulePredicate.name == val.predicate
    );
    if (index < 0) {
      const dummyRule = emptyAttributedInitRule();
      dummyRule.rulePredicate.name = val.predicate;
      dummyRule.rulePredicate.varNames = val.variables;
      initRules.value.push(dummyRule);
    } else if (
      initRules.value[index].rulePredicate.varNames.length !=
      val.variables.length
    ) {
      initRules.value[index].rulePredicate.varNames = val.variables;
    }
  });
  initRules.value.forEach((rule) => {
    const found = possibleRules.find(
      (val) => val.predicate == rule.rulePredicate.name
    );
    if (found) newInitRules.push(rule);
  });
  initRules.value = [...new Set(newInitRules)];
  useAtbStore().loadNewDckRules(initRules.value);
}
function dummyVariables(numOfVars: number): string[] {
  if (numOfVars === 0) return [];
  let str = [];
  for (let i = 0; i < numOfVars; i++) {
    str.push("?var_" + i);
  }
  return str;
}
function addDckState() {
  const temp = emptyAttributedState();
  temp.name = "State_" + DCKstates.value.length;
  temp.numOfVars = 0;
  DCKstates.value.push(temp);
  useAtbStore().loadNewDckStates(DCKstates.value);
}
function deleteState(i: number) {
  DCKstates.value.splice(i, 1);
  useAtbStore().loadNewDckStates(DCKstates.value);
}
function addDckMemory() {
  const temp = emptyAttributedMemory();
  temp.name = "Memory_" + DCKmemory.value.length;
  temp.numOfVars = 0;
  DCKmemory.value.push(temp);
  useAtbStore().loadNewDckMemory(DCKmemory.value);
}
function deleteMemory(i: number) {
  DCKmemory.value.splice(i, 1);
  useAtbStore().loadNewDckMemory(DCKmemory.value);
}
function addDckTransition() {
  const temp = emptyAttributedTransition();
  temp.originState = DCKstates.value[0];
  temp.targetState = DCKstates.value[0];
  temp.operator = emptyNoOperator();
  DCKtransitions.value.push(temp);
  useAtbStore().loadNewDckTransitions(DCKtransitions.value);
}
function deleteTransition(i: number) {
  DCKtransitions.value.splice(i, 1);
  useAtbStore().loadNewDckTransitions(DCKtransitions.value);
}
function save() {
  useAtbStore().loadNewDckStates(DCKstates.value);
  useAtbStore().loadNewDckMemory(DCKmemory.value);
  useAtbStore().loadNewDckTransitions(DCKtransitions.value);
  useAtbStore().loadNewDckRules(initRules.value);
  useAtbStore().loadPrologInit(
    composeDomainKnowledgeBase(useAtbStore().getDCKrules)
  );
  if (useDocumentStore().getActiveDomain) {
    const tempDomain = useDocumentStore().getActiveDomain;
    tempDomain.atbDck = useAtbStore().dck;
    useDocumentStore().modifyDomain(tempDomain);
  }

  if (editor.value) editor.value.code = useAtbStore().getDCKprologInit;
  updatePossibleRules();
}
</script>

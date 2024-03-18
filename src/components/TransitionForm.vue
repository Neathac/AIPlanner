<template>
  <v-container>
    <v-form @submit.prevent="submit" ref="form">
      <v-row>
        <v-col cols="5">
          <v-autocomplete
            v-model="originState"
            :items="atbStates"
            item-title="name"
            return-object
            :rules="[() => !!originState || 'This field is required']"
            :update:modelValue="updateOriginVars()"
            label="Initial state"
            placeholder="Select..."
            required
          ></v-autocomplete>
        </v-col>
        <v-col cols="5">
          <v-text-field
            v-model="originStateStringVariables"
            :rules="originVariableRules"
            label="Variables"
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="5">
          <v-autocomplete
            v-model="targetState"
            :items="atbStates"
            item-title="name"
            return-object
            :rules="[() => !!targetState || 'This field is required']"
            :update:modelValue="updateTargetVars()"
            label="Target state"
            placeholder="Select..."
            required
          ></v-autocomplete>
        </v-col>
        <v-col cols="5">
          <v-text-field
            v-model="targetStateStringVariables"
            :rules="targetVariableRules"
            label="Variables"
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="5">
          <v-autocomplete
            v-model="chosenOperator"
            :items="operators"
            :update:modelValue="updateOperatorVars()"
            return-object
            item-title="name"
            label="Operator"
            placeholder="Select..."
            required
          ></v-autocomplete>
        </v-col>
        <v-col cols="5">
          <v-text-field
            v-model="operatorStringVariables"
            disabled
            label="Variables"
          ></v-text-field>
        </v-col>
      </v-row>

      <v-row v-for="(dckConstraint, i) in constraints" :key="i">
        <v-col cols="3">
          <v-autocomplete
            v-model="constraints[i]"
            :update:modelValue="updateConstraintVars(i)"
            :items="possibleConstraints"
            item-title="predicate"
            return-object
            label="Constraint condition"
          ></v-autocomplete>
        </v-col>
        <v-col cols="3">
          <v-text-field
            v-model="constraintStringVariables[i]"
            label="Variable names"
          ></v-text-field>
        </v-col>
        <v-col cols="2">
          <v-checkbox
            v-model="constraints[i].negated"
            label="Negate"
          ></v-checkbox>
        </v-col>
        <v-col cols="2">
          <v-checkbox
            v-model="constraints[i].isInEffect"
            label="Transition effect"
          ></v-checkbox>
        </v-col>
        <v-col cols="2">
          <v-btn
            color="error"
            icon="mdi-delete"
            class="me-4"
            @click="deleteConstraint(i)"
          ></v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="3">
          <v-btn
            append-icon="mdi-plus"
            class="me-4"
            color="green"
            @click="addConstraint()"
            >Add constraint</v-btn
          >
        </v-col>
        <v-col cols="4">
          <v-btn type="submit" class="me-4" color="primary">Save</v-btn>
          <v-btn
            color="error"
            append-icon="mdi-delete"
            class="me-4"
            @click="$emit('deleteEvent')"
            >Delete constraint</v-btn
          >
        </v-col>
        <v-col cols="1">
          <v-tooltip location="bottom">
            <template v-slot:activator="{ props }">
              <v-icon v-bind="props" icon="mdi-help-circle-outline"></v-icon>
            </template>
            Identical variables have to have matching names set.
          </v-tooltip>
        </v-col>
      </v-row>
    </v-form>
  </v-container>
</template>

<script setup lang="ts">
import { useDomainStore } from "../stores/domainStore";
import { useAtbStore } from "../stores/atbStore";
import { ref, Ref, defineProps, onMounted } from "vue";
import {
  Action,
  AttributedConstraint,
  AttributedState,
  AttributedTransition,
  emptyNoOperator,
} from "@functions/parserTypes";
import {
  decomposeStringToVariables,
  composeVariablesToString,
  dummyVariableString,
} from "../languageSupport/decomposer/dckLoader";

const form = ref();

const originState: Ref<AttributedState> = ref({} as AttributedState);
const originStateStringVariables: Ref<String> = ref("");
const originStateNumVariables: Ref<number> = ref(0);
const targetState: Ref<AttributedState> = ref({} as AttributedState);
const targetStateStringVariables: Ref<String> = ref("");
const targetStateNumVariables: Ref<number> = ref(0);
const atbStates: Ref<Array<AttributedState>> = ref(useAtbStore().getDCKstates);
const operators: Ref<Array<Action>> = ref(
  useDomainStore().getStructure.actions
);
const chosenOperator: Ref<Action> = ref({} as Action);
const operatorStringVariables: Ref<String> = ref("");
const constraints: Ref<Array<AttributedConstraint>> = ref([]);
const constraintStringVariables: Ref<Array<String>> = ref([]);
const possibleConstraints: Ref<Array<AttributedConstraint>> = ref([]);

const props = defineProps({
  atbTransition: {
    type: Object as () => AttributedTransition,
    required: true,
  },
});

const emit = defineEmits(["deleteEvent", "saveEvent"]);

const originVariableRules = [
  (value: string) => {
    if (
      decomposeStringToVariables(value).filter((val) => val.trim() != "")
        .length == originStateNumVariables.value
    )
      return true;
    return "You must enter a unique non-empty name.";
  },
];
const targetVariableRules = [
  (value: string) => {
    if (
      decomposeStringToVariables(value).filter((val) => val.trim() != "")
        .length == targetStateNumVariables.value
    )
      return true;
    return "You must enter a unique non-empty name.";
  },
];

onMounted(() => {
  atbStates.value = useAtbStore().getDCKstates;
  // Setting up constraint variables
  constraints.value = props.atbTransition.constraints;
  constraints.value.forEach((val) =>
    constraintStringVariables.value.push(
      composeVariablesToString(val.variables)
    )
  );
  useDomainStore().getStructure.predicates.forEach((val) =>
    possibleConstraints.value.push({
      predicate: val.name,
      variables: val.varNames,
      negated: false,
      isInEffect: false,
    })
  );
  useAtbStore().getDCKmemory.forEach((val) =>
    possibleConstraints.value.push({
      predicate: val.name,
      variables:
        val.specificVars ??
        decomposeStringToVariables(dummyVariableString(val.numOfVars)),
      negated: false,
      isInEffect: false,
    })
  );
  useAtbStore().getDCKstates.forEach((val) =>
    possibleConstraints.value.push({
      predicate: val.name,
      variables:
        val.specificVars ??
        decomposeStringToVariables(dummyVariableString(val.numOfVars)),
      negated: false,
      isInEffect: false,
    })
  );
  // Updating operator variables
  chosenOperator.value =
    props.atbTransition.operator ?? operators.value[operators.value.length - 1];
  updateOperatorVars();
  // Setting up originState values
  originState.value = props.atbTransition.originState;
  updateOriginVars();
  // Setting up targetState values
  targetState.value = props.atbTransition.targetState;
  updateTargetVars();
});

function deleteConstraint(index: number): void {
  constraints.value.splice(index, 1);
  constraintStringVariables.value.splice(index, 1);
}

function updateOriginVars() {
  originStateStringVariables.value =
    originState.value.specificVars && originState.value.specificVars.length > 0
      ? composeVariablesToString(originState.value.specificVars)
      : dummyVariableString(originState.value.numOfVars);
  originStateNumVariables.value = originState.value.numOfVars;
}

function updateTargetVars() {
  targetStateStringVariables.value =
    targetState.value.specificVars && targetState.value.specificVars.length > 0
      ? composeVariablesToString(targetState.value.specificVars)
      : dummyVariableString(targetState.value.numOfVars);
  targetStateNumVariables.value = targetState.value.numOfVars;
}

function updateOperatorVars() {
  operatorStringVariables.value =
    chosenOperator.value &&
    chosenOperator.value.parameters &&
    chosenOperator.value.parameters.varName.length > 0
      ? chosenOperator.value.parameters.varName.join(", ")
      : "";
}

function addConstraint() {
  constraints.value.push(Object.assign({}, possibleConstraints.value[0]));
  constraintStringVariables.value.push(
    composeVariablesToString(possibleConstraints.value[0].variables)
  );
}

function updateConstraintVars(i: number) {
  const found = possibleConstraints.value.find(
    (el) => el.predicate == constraints.value[i].predicate
  );
  if (constraints.value[i] === found) {
    constraints.value[i] = Object.assign({}, found);
  }

  constraintStringVariables.value[i] = composeVariablesToString(
    constraints.value[i].variables
  );
}

const submit = async (event: { preventDefault: () => any }) => {
  await event.preventDefault();
  const { valid } = await form.value.validate();
  if (valid) {
    constraintStringVariables.value.forEach(
      (val, index) =>
        (constraints.value[index].variables = decomposeStringToVariables(val))
    );
    // eslint-disable-next-line vue/no-mutating-props
    props.atbTransition.originState = originState.value;
    // eslint-disable-next-line vue/no-mutating-props
    props.atbTransition.originState.specificVars = decomposeStringToVariables(
      originStateStringVariables.value
    );
    // eslint-disable-next-line vue/no-mutating-props
    props.atbTransition.targetState = targetState.value;
    // eslint-disable-next-line vue/no-mutating-props
    props.atbTransition.targetState.specificVars = decomposeStringToVariables(
      targetStateStringVariables.value
    );
    // eslint-disable-next-line vue/no-mutating-props
    props.atbTransition.operator = chosenOperator.value;
    // eslint-disable-next-line vue/no-mutating-props
    props.atbTransition.constraints = constraints.value;
    emit("saveEvent");
  }
};
</script>

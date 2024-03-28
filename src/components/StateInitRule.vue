<template>
  <v-container>
    <v-form @submit.prevent="submit" ref="form">
      <v-row dense>
        <v-col cols="3">
          <v-text-field
            :value="props.rule.rulePredicate.name"
            disabled
          ></v-text-field>
        </v-col>
        <v-col cols="3">
          <v-text-field
            v-model="ruleVariableText"
            :rules="[stateVariableRules(ruleVariableText)]"
          ></v-text-field>
        </v-col>
        <v-col cols="3">
          <v-select
            label="Simple default value"
            v-model="defaultChoice"
            :items="['No simple value', 'True', 'False', 'Constant']"
            def
          ></v-select>
        </v-col>
        <v-col cols="3">
          <v-btn type="submit" class="me-4" color="primary">Save</v-btn>
        </v-col>
      </v-row>
      <v-container v-if="defaultChoice == 'No simple value'">
        <v-row class="justify-center" dense>
          <v-expansion-panels multiple>
            <v-expansion-panel
              v-for="(orClause, i) in thisRule.orClause"
              :key="i"
              :title="'OR rule ' + i"
            >
              <v-expansion-panel-text>
                <v-row dense>
                  <v-col cols="2">
                    <v-text-field
                      label="'Any' variables"
                      v-model="anyVariablesString[i]"
                      :update:modelValue="updateAnyVariables(i)"
                    >
                    </v-text-field>
                  </v-col>
                  <v-col cols="1">
                    <v-tooltip location="bottom">
                      <template v-slot:activator="{ props }">
                        <v-icon
                          v-bind="props"
                          icon="mdi-help-circle-outline"
                        ></v-icon>
                      </template>
                      Use of these variables will be treated as 'There exists an
                      object'
                    </v-tooltip>
                  </v-col>

                  <v-col cols="3">
                    <v-btn
                      append-icon="mdi-delete"
                      class="me-4"
                      color="error"
                      @click="deleteOrClause(i)"
                      >Delete OR rule</v-btn
                    >
                  </v-col>
                </v-row>
                <v-row
                  v-for="offset in getOffsetArray(3, orClause.andClause.length)"
                  :key="offset"
                  dense
                >
                  <template v-for="(_, temp) in 3" :key="temp">
                    <v-col
                      v-if="orClause.andClause.length > offset * 3 + temp"
                      cols="3"
                    >
                      <v-autocomplete
                        v-model="orClause.andClause[offset * 3 + temp].name"
                        :update:modelValue="
                          updateClauseVars(i, offset * 3 + temp)
                        "
                        :items="possibleConstraints"
                        item-title="predicate"
                        label="Constraint condition"
                      ></v-autocomplete>
                      <v-text-field
                        v-model="andClauseStringVariables[i][offset * 3 + temp]"
                        label="Variable names"
                        :rules="[andClauseVariableRules(i, offset * 3 + temp)]"
                      ></v-text-field>
                      <v-checkbox
                        v-model="orClause.andClause[offset * 3 + temp].negated"
                        label="Negate"
                      ></v-checkbox>
                      <v-checkbox
                        v-model="orClause.andClause[offset * 3 + temp].isInGoal"
                        label="Is in goal"
                      ></v-checkbox>
                    </v-col>
                    <v-col
                      v-if="orClause.andClause.length > offset * 3 + temp"
                      cols="1"
                    >
                      <v-btn
                        color="error"
                        icon="mdi-delete"
                        class="me-4"
                        @click="deleteAndClause(i, offset * 3 + temp)"
                      ></v-btn>
                    </v-col>
                  </template>
                </v-row>
                <v-expansion-panels multiple>
                  <v-expansion-panel
                    v-for="(func, j) in orClause.prologFunctions"
                    :key="j"
                    :title="func.operator + ' ' + j"
                  >
                    <v-expansion-panel-text>
                      <v-row dense>
                        <v-col cols="2">
                          <v-autocomplete
                            v-model="func.operator"
                            :items="POSSIBLE_PROLOG_FUNCTIONS"
                            label="Function"
                          ></v-autocomplete>
                        </v-col>
                        <v-col
                          cols="1"
                          v-if="
                            func.operator == 'max' || func.operator == 'min'
                          "
                        >
                          <v-tooltip location="bottom">
                            <template v-slot:activator="{ props }">
                              <v-icon
                                v-bind="props"
                                icon="mdi-help-circle-outline"
                              ></v-icon>
                            </template>
                            The selected function will be applied to all
                            provided predicates. The results will be stored into
                            matching variables in the field 'Of variables'.
                          </v-tooltip>
                        </v-col>
                        <v-col cols="1" v-if="func.operator == 'count'">
                          <v-tooltip location="bottom">
                            <template v-slot:activator="{ props }">
                              <v-icon
                                v-bind="props"
                                icon="mdi-help-circle-outline"
                              ></v-icon>
                            </template>
                            All provided predicates will be treated as a
                            conjunction for which cardinality is computed as a
                            whole.
                          </v-tooltip>
                        </v-col>
                        <v-col cols="2">
                          <v-text-field
                            v-model="func.variable"
                            label="Result of function"
                            :rules="[
                              () =>
                                decomposeStringToVariables(
                                  func.variable
                                ).filter((val) => val.trim() != '').length == 1
                                  ? true
                                  : 'Number of arguments doesn\'t match definition of state. Should be 1.',
                            ]"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="3">
                          <v-text-field
                            v-if="
                              func.operator == 'max' || func.operator == 'min'
                            "
                            label="Of variables:"
                            v-model="functionSelectionVariables[i][j]"
                            :update:modelValue="
                              updateFunctionSelectionVariables(i, j)
                            "
                          ></v-text-field>
                        </v-col>
                        <v-col
                          cols="1"
                          v-if="
                            func.operator == 'max' || func.operator == 'min'
                          "
                        >
                          <v-tooltip location="bottom">
                            <template v-slot:activator="{ props }">
                              <v-icon
                                v-bind="props"
                                icon="mdi-help-circle-outline"
                              ></v-icon>
                            </template>
                            There is no type safety, make sure provided
                            vairables resolve to numbers. Any predicate within
                            function must have exactly one variable shared with
                            this list, but listed variables and constants don't
                            need to be tied to in-function predicates.
                          </v-tooltip>
                        </v-col>
                        <v-col cols="3">
                          <v-btn
                            append-icon="mdi-delete"
                            class="me-4"
                            color="error"
                            @click="deleteFunction(i, j)"
                            >Delete function</v-btn
                          >
                        </v-col>
                      </v-row>
                      <v-row
                        v-for="funcOffset in getOffsetArray(
                          3,
                          func.predicateArguments.length
                        )"
                        :key="funcOffset"
                        dense
                      >
                        <template v-for="(_, temp) in 3" :key="temp">
                          <v-col
                            v-if="
                              func.predicateArguments.length >
                              funcOffset * 3 + temp
                            "
                            cols="3"
                          >
                            <v-autocomplete
                              v-model="
                                func.predicateArguments[funcOffset * 3 + temp]
                                  .name
                              "
                              :update:modelValue="
                                updateFuncVars(i, j, funcOffset * 3 + temp)
                              "
                              :items="possibleConstraints"
                              item-title="predicate"
                              label="Constraint condition"
                            ></v-autocomplete>
                            <v-text-field
                              v-model="
                                functionVariables[i][j][funcOffset * 3 + temp]
                              "
                              label="Variable names"
                            ></v-text-field>
                            <v-checkbox
                              v-model="
                                func.predicateArguments[funcOffset * 3 + temp]
                                  .negated
                              "
                              label="Negate"
                            ></v-checkbox>
                            <v-checkbox
                              v-model="
                                func.predicateArguments[funcOffset * 3 + temp]
                                  .isInGoal
                              "
                              label="Is in goal"
                            ></v-checkbox>
                          </v-col>
                          <v-col
                            v-if="
                              func.predicateArguments.length >
                              funcOffset * 3 + temp
                            "
                            cols="1"
                          >
                            <v-btn
                              color="error"
                              icon="mdi-delete"
                              class="me-4"
                              @click="
                                deleteFunctionClause(
                                  i,
                                  j,
                                  funcOffset * 3 + temp
                                )
                              "
                            ></v-btn>
                          </v-col>
                        </template>
                      </v-row>
                      <v-row dense>
                        <v-col cols="4">
                          <v-btn
                            append-icon="mdi-plus"
                            class="me-4"
                            color="green"
                            @click="addFunctionArg(i, j)"
                            >Add predicate to function</v-btn
                          >
                        </v-col>
                      </v-row>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>
                <v-row dense>
                  <v-col cols="3">
                    <v-btn
                      append-icon="mdi-plus"
                      class="me-4 mt-4"
                      color="green"
                      @click="addAndRule(i)"
                      >Add predicate to rule</v-btn
                    >
                  </v-col>
                  <v-col cols="3" dense>
                    <v-btn
                      append-icon="mdi-plus"
                      class="me-4 mt-4"
                      color="blue"
                      @click="addFunction(i)"
                      >Add function to rule</v-btn
                    >
                  </v-col>
                </v-row>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-row>
      </v-container>
      <v-row dense v-if="defaultChoice == 'No simple value'">
        <v-col cols="2">
          <v-btn
            append-icon="mdi-plus"
            class="me-4 mt-4"
            color="green"
            @click="addOrRule()"
            >Add OR rule</v-btn
          >
        </v-col>
      </v-row>
    </v-form>
  </v-container>
</template>

<script setup lang="ts">
import { useAtbStore } from "../stores/atbStore";
import { useDomainStore } from "../stores/domainStore";
import { ref, Ref, defineProps, onMounted } from "vue";
import {
  AttributedConstraint,
  AttributedInitRule,
  emptyAttributedInitRule,
  emptyLogicalOrRule,
  equalConstraint,
  greaterConstraint,
  isConstraint,
  notEqualConstraint,
  greaterEqualConstraint,
  POSSIBLE_PROLOG_FUNCTIONS,
  unUnifiableConstraint,
  unifiableConstraint,
} from "@functions/parserTypes";
import {
  decomposeStringToVariables,
  composeVariablesToString,
  dummyVariableString,
} from "../languageSupport/decomposer/dckLoader";
import { emptyPrologFunction } from "@functions/parserTypes";

const form = ref();

const possibleConstraints: Ref<Array<AttributedConstraint>> = ref([]);
const ruleVariableText: Ref<string> = ref("");
const thisRule: Ref<AttributedInitRule> = ref(emptyAttributedInitRule());
const defaultChoice: Ref<string> = ref("No simple value");
const allVariablesString: Ref<Array<String>> = ref([]);
const anyVariablesString: Ref<Array<String>> = ref([]);
const andClauseStringVariables: Ref<Array<Array<String>>> = ref([]);
const functionVariables: Ref<Array<Array<Array<String>>>> = ref([]);
const functionSelectionVariables: Ref<Array<Array<String>>> = ref([]);

const props = defineProps({
  rule: {
    type: Object as () => AttributedInitRule,
    required: true,
  },
});

function stateVariableRules(ruleVariableText: string) {
  const decomposed = decomposeStringToVariables(ruleVariableText).filter(
    (val) => val.trim() != ""
  );
  if (
    defaultChoice.value == "Constant" &&
    decomposed.some((el) => el.startsWith("?"))
  )
    return "Variables can only be used in non-constant value rules. Hint: remove '?' from start of constant.";
  if (decomposed.length == props.rule.rulePredicate.varNames.length)
    return true;

  return (
    "Number of arguments doesn't match definition of state. Should be " +
    props.rule.rulePredicate.varNames.length +
    "."
  );
}

function andClauseVariableRules(orIndex: number, andIndex: number) {
  const constraint = possibleConstraints.value.find(
    (val) =>
      val.predicate == thisRule.value.orClause[orIndex].andClause[andIndex].name
  );
  return (value: string) => {
    if (
      constraint.variables.length ==
      decomposeStringToVariables(value).filter((val) => val.trim() != "").length
    )
      return true;
    return (
      "Number of predicate variables in definition must match. Should be " +
      constraint.variables.length +
      " variables."
    );
  };
}

const emit = defineEmits(["saveEvent"]);

onMounted(() => {
  ruleVariableText.value = props.rule.rulePredicate.varNames.join(", ");
  thisRule.value = Object.assign({}, props.rule);
  if (thisRule.value.simpleDefaultValue)
    defaultChoice.value = thisRule.value.simpleDefaultValue;
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
  possibleConstraints.value.push(notEqualConstraint());
  possibleConstraints.value.push(unUnifiableConstraint());
  possibleConstraints.value.push(equalConstraint());
  possibleConstraints.value.push(unifiableConstraint());
  possibleConstraints.value.push(greaterConstraint());
  possibleConstraints.value.push(greaterEqualConstraint());
  possibleConstraints.value.push(isConstraint());
  // Populate variables in string form, as they only exist locally
  thisRule.value.orClause.forEach((orClause, orIndex) => {
    functionVariables.value.push([]);
    andClauseStringVariables.value.push([]);
    functionSelectionVariables.value.push([]);
    orClause.andClause.forEach((andClause) => {
      andClauseStringVariables.value[orIndex].push(
        composeVariablesToString(andClause.varNames)
      );
    });
    anyVariablesString.value.push(
      composeVariablesToString(orClause.anyVariables)
    );
    orClause.prologFunctions.forEach((func, funcInd) => {
      functionVariables.value[orIndex].push([]);
      functionSelectionVariables.value[orIndex].push(
        func.selectionVars.join(", ") ?? ""
      );
      func.predicateArguments.forEach((arg) =>
        functionVariables.value[orIndex][funcInd].push(
          composeVariablesToString(arg.varNames)
        )
      );
    });
  });
});

function addOrRule() {
  thisRule.value.orClause.push(emptyLogicalOrRule());
  allVariablesString.value.push("");
  anyVariablesString.value.push("");
  andClauseStringVariables.value.push([]);
  functionVariables.value.push([]);
  functionSelectionVariables.value.push([]);
}

function addAndRule(i: number) {
  thisRule.value.orClause[i].andClause.push({
    name: possibleConstraints.value[0].predicate,
    varNames: possibleConstraints.value[0].variables,
    isInGoal: false,
    negated: false,
    isInInitial: false,
  });
}

function addFunctionArg(orIndex: number, functionIndex: number) {
  thisRule.value.orClause[orIndex].prologFunctions[
    functionIndex
  ].predicateArguments.push({
    name: possibleConstraints.value[0].predicate,
    varNames: possibleConstraints.value[0].variables,
    isInGoal: false,
    negated: false,
    isInInitial: false,
  });
}

function addFunction(orIndex: number) {
  thisRule.value.orClause[orIndex].prologFunctions.push(emptyPrologFunction());
  functionVariables.value[orIndex].push([]);
  functionSelectionVariables.value[orIndex].push("");
}

function getOffsetArray(cols: number, length: number): Array<number> {
  const arr = [];
  for (let i = 0; i < Math.ceil(length / cols); i++) {
    arr.push(i);
  }
  return arr;
}

function updateAnyVariables(orClauseIndex: number): void {
  if (anyVariablesString[orClauseIndex])
    thisRule.value.orClause[orClauseIndex].anyVariables =
      decomposeStringToVariables(anyVariablesString[orClauseIndex]);
}

function updateFunctionSelectionVariables(
  orIndex: number,
  funcIndex: number
): void {
  thisRule.value.orClause[orIndex].prologFunctions[funcIndex].selectionVars =
    decomposeStringToVariables(
      functionSelectionVariables.value[orIndex][funcIndex]
    );
}

function updateClauseVars(orClauseIndex: number, andClauseIndex: number): void {
  const found = possibleConstraints.value.find(
    (el) =>
      el.predicate ==
      thisRule.value.orClause[orClauseIndex].andClause[andClauseIndex].name
  );
  if (
    found &&
    (!andClauseStringVariables.value[orClauseIndex][andClauseIndex] ||
      found.variables.length !=
        decomposeStringToVariables(
          andClauseStringVariables.value[orClauseIndex][andClauseIndex]
        ).filter((val) => val.trim() != "").length)
  ) {
    thisRule.value.orClause[orClauseIndex].andClause[andClauseIndex].varNames =
      found.variables;
    andClauseStringVariables.value[orClauseIndex][andClauseIndex] =
      composeVariablesToString(
        thisRule.value.orClause[orClauseIndex].andClause[andClauseIndex]
          .varNames
      );
  } else {
    thisRule.value.orClause[orClauseIndex].andClause[andClauseIndex].varNames =
      decomposeStringToVariables(
        andClauseStringVariables.value[orClauseIndex][andClauseIndex]
      ).filter((val) => val.trim() != "");
  }
}

function updateFuncVars(
  orClauseIndex: number,
  functionIndex: number,
  argIndex: number
): void {
  const found = possibleConstraints.value.find(
    (el) =>
      el.predicate ==
      thisRule.value.orClause[orClauseIndex].prologFunctions[functionIndex]
        .predicateArguments[argIndex].name
  );
  if (
    found &&
    (!functionVariables.value[orClauseIndex][functionIndex][argIndex] ||
      found.variables.length !=
        decomposeStringToVariables(
          functionVariables.value[orClauseIndex][functionIndex][argIndex]
        ).filter((val) => val.trim() != "").length)
  ) {
    thisRule.value.orClause[orClauseIndex].prologFunctions[
      functionIndex
    ].predicateArguments[argIndex].varNames = found.variables;
    functionVariables.value[orClauseIndex][functionIndex][argIndex] =
      composeVariablesToString(
        thisRule.value.orClause[orClauseIndex].prologFunctions[functionIndex]
          .predicateArguments[argIndex].varNames
      );
  } else {
    thisRule.value.orClause[orClauseIndex].prologFunctions[
      functionIndex
    ].predicateArguments[argIndex].varNames = decomposeStringToVariables(
      functionVariables.value[orClauseIndex][functionIndex][argIndex]
    ).filter((val) => val.trim() != "");
  }
}

function deleteFunctionClause(
  orIndex: number,
  functionIndex: number,
  argIndex: number
): void {
  thisRule.value.orClause[orIndex].prologFunctions[
    functionIndex
  ].predicateArguments.splice(argIndex, 1);
  functionVariables.value[orIndex][functionIndex].splice(argIndex, 1);
}

function deleteFunction(orIndex: number, functionIndex: number): void {
  thisRule.value.orClause[orIndex].prologFunctions.splice(functionIndex, 1);
  functionVariables.value[orIndex].splice(functionIndex, 1);
}

function deleteAndClause(orIndex: number, andIndex: number): void {
  thisRule.value.orClause[orIndex].andClause.splice(andIndex, 1);
  andClauseStringVariables.value[orIndex].splice(andIndex, 1);
}

function deleteOrClause(orIndex: number): void {
  thisRule.value.orClause.splice(orIndex, 1);
  andClauseStringVariables.value.splice(orIndex, 1);
  anyVariablesString.value.splice(orIndex, 1);
}

const submit = async (event: { preventDefault: () => any }) => {
  await event.preventDefault();
  const { valid } = await form.value.validate();
  if (valid) {
    anyVariablesString.value.forEach(
      (val, i) =>
        (thisRule.value.orClause[i].anyVariables =
          decomposeStringToVariables(val))
    );
    thisRule.value.rulePredicate.varNames = decomposeStringToVariables(
      ruleVariableText.value
    );
    // eslint-disable-next-line vue/no-mutating-props
    props.rule.hasSimpleValue = thisRule.value.hasSimpleValue;
    // eslint-disable-next-line vue/no-mutating-props
    props.rule.orClause = thisRule.value.orClause;
    // eslint-disable-next-line vue/no-mutating-props
    props.rule.rulePredicate = thisRule.value.rulePredicate;
    if (defaultChoice.value == "No simple value")
      // eslint-disable-next-line vue/no-mutating-props
      props.rule.hasSimpleValue = false;
    else {
      // eslint-disable-next-line vue/no-mutating-props
      props.rule.hasSimpleValue = true;
      // eslint-disable-next-line vue/no-mutating-props
      if (defaultChoice.value == "True") props.rule.simpleDefaultValue = "True";
      else if (defaultChoice.value == "False")
        // eslint-disable-next-line vue/no-mutating-props
        props.rule.simpleDefaultValue = "False";
      else if (defaultChoice.value == "Constant")
        // eslint-disable-next-line vue/no-mutating-props
        props.rule.simpleDefaultValue = "Constant";
    }
    emit("saveEvent");
  }
};
</script>

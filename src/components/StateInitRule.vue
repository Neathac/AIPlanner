<template>
  <v-container>
    <v-form @submit.prevent="submit" ref="form">
      <v-row density="compact">
        <v-col cols="3">
          <v-text-field
            :value="props.rule.rulePredicate.name"
            disabled
          ></v-text-field>
        </v-col>
        <v-col cols="3">
          <v-text-field
            v-model="ruleVariableText"
            :rules="[
              () =>
                decomposeStringToVariables(ruleVariableText).filter(
                  (val) => val.trim() != ''
                ).length == props.rule.rulePredicate.varNames.length
                  ? true
                  : 'Number of arguments doesn\'t match definition of state',
            ]"
          ></v-text-field>
        </v-col>
        <v-col cols="3">
          <v-select
            label="Simple default value"
            v-model="defaultChoice"
            :items="['No simple value', 'True', 'False']"
            def
          ></v-select>
        </v-col>
        <v-col cols="3">
          <v-btn type="submit" class="me-4" color="primary">Save</v-btn>
        </v-col>
      </v-row>
      <v-container v-if="defaultChoice == 'No simple value'">
        <v-container v-for="(orClause, i) in thisRule.orClause" :key="i">
          <v-row density="compact">
            <v-col cols="2">
              <v-text-field
                label="'All' variables"
                v-model="allVariablesString[i]"
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
                Use of these variables will be treated as 'Statement is true for
                all objects'
              </v-tooltip>
            </v-col>
            <v-col cols="2">
              <v-text-field
                label="'Any' variables"
                v-model="anyVariablesString[i]"
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
                append-icon="mdi-plus"
                class="me-4"
                color="green"
                @click="addAndRule(i)"
                >Add AND rule to OR rule</v-btn
              >
            </v-col>
          </v-row>
          <v-row
            v-for="offset in getOffsetArray(3, orClause.andClause.length)"
            :key="offset"
            density="compact"
          >
            <v-col v-if="orClause.andClause.length > offset * 3" cols="3">
              <v-autocomplete
                v-model="orClause.andClause[offset * 3].name"
                :update:modelValue="updateClauseVars(i, offset * 3)"
                :items="possibleConstraints"
                item-title="predicate"
                label="Constraint condition"
              ></v-autocomplete>
              <v-text-field
                v-model="andClauseStringVariables[i][offset * 3]"
                label="Variable names"
              ></v-text-field>
              <v-checkbox
                v-model="orClause.andClause[offset * 3].negated"
                label="Negate"
              ></v-checkbox>
              <v-checkbox
                v-model="orClause.andClause[offset * 3].isInGoal"
                label="Is in goal"
              ></v-checkbox>
            </v-col>
            <v-col v-if="orClause.andClause.length > offset * 3" cols="1">
              <v-btn
                color="error"
                icon="mdi-delete"
                class="me-4"
                @click="deleteAndClause(i, offset * 3)"
              ></v-btn>
            </v-col>
            <v-col v-if="orClause.andClause.length > offset * 3 + 1" cols="3">
              <v-autocomplete
                v-model="orClause.andClause[offset * 3 + 1].name"
                :update:modelValue="updateClauseVars(i, offset * 3 + 1)"
                :items="possibleConstraints"
                item-title="predicate"
                label="Constraint condition"
              ></v-autocomplete>
              <v-text-field
                v-model="andClauseStringVariables[i][offset * 3 + 1]"
                label="Variable names"
                :rules="[andClauseVariableRules(i, offset * 3 + 1)]"
              ></v-text-field>
              <v-checkbox
                v-model="orClause.andClause[offset * 3 + 1].negated"
                label="Negate"
              ></v-checkbox>
              <v-checkbox
                v-model="orClause.andClause[offset * 3 + 1].isInGoal"
                label="Is in goal"
              ></v-checkbox>
            </v-col>
            <v-col v-if="orClause.andClause.length > offset * 3 + 1" cols="1">
              <v-btn
                color="error"
                icon="mdi-delete"
                class="me-4"
                @click="deleteAndClause(i, offset * 3 + 1)"
              ></v-btn>
            </v-col>
            <v-col v-if="orClause.andClause.length > offset * 3 + 2" cols="3">
              <v-autocomplete
                v-model="orClause.andClause[offset * 3 + 2].name"
                :update:modelValue="updateClauseVars(i, offset * 3 + 2)"
                :items="possibleConstraints"
                item-title="predicate"
                label="Constraint condition"
              ></v-autocomplete>
              <v-text-field
                v-model="andClauseStringVariables[i][offset * 3 + 2]"
                label="Variable names"
                :rules="[andClauseVariableRules(i, offset * 3 + 2)]"
              ></v-text-field>
              <v-checkbox
                v-model="orClause.andClause[offset * 3 + 2].negated"
                label="Negate"
              ></v-checkbox>
              <v-checkbox
                v-model="orClause.andClause[offset * 3 + 2].isInGoal"
                label="Is in goal"
              ></v-checkbox>
            </v-col>
            <v-col v-if="orClause.andClause.length > offset * 3 + 2" cols="1">
              <v-btn
                color="error"
                icon="mdi-delete"
                class="me-4"
                @click="deleteAndClause(i, offset * 3 + 2)"
              ></v-btn>
            </v-col>
          </v-row>
        </v-container>
        <v-row density="compact">
          <v-col cols="2">
            <v-btn
              append-icon="mdi-plus"
              class="me-4"
              color="green"
              @click="addOrRule()"
              >Add or rule</v-btn
            >
          </v-col>
        </v-row>
      </v-container>
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
} from "@functions/parserTypes";
import {
  decomposeStringToVariables,
  composeVariablesToString,
} from "../languageSupport/decomposer/dckLoader";

const form = ref();

const possibleConstraints: Ref<Array<AttributedConstraint>> = ref([]);
const ruleVariableText: Ref<String> = ref("");
const thisRule: Ref<AttributedInitRule> = ref(emptyAttributedInitRule());
const defaultChoice: Ref<string> = ref("No simple value");
const allVariablesString: Ref<Array<String>> = ref([]);
const anyVariablesString: Ref<Array<String>> = ref([]);
const andClauseStringVariables: Ref<Array<Array<String>>> = ref([]);

const props = defineProps({
  rule: {
    type: Object as () => AttributedInitRule,
    required: true,
  },
});

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
    return "Number of predicate variables in definition must match";
  };
}

const emit = defineEmits(["saveEvent"]);

onMounted(() => {
  ruleVariableText.value = props.rule.rulePredicate.varNames.join(", ");
  thisRule.value = Object.assign({}, props.rule);
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
      variables: val.specificVars ?? [],
      negated: false,
      isInEffect: false,
    })
  );
  useAtbStore().getDCKstates.forEach((val) =>
    possibleConstraints.value.push({
      predicate: val.name,
      variables: val.specificVars ?? [],
      negated: false,
      isInEffect: false,
    })
  );
});

function addOrRule() {
  thisRule.value.orClause.push(emptyLogicalOrRule());
  allVariablesString.value.push("");
  anyVariablesString.value.push("");
  andClauseStringVariables.value.push([]);
}

function addAndRule(i: number) {
  thisRule.value.orClause[i].andClause.push({
    name: possibleConstraints.value[0].predicate,
    varNames: possibleConstraints.value[0].variables,
    isInGoal: false,
    negated: false,
  });
}

function getOffsetArray(cols: number, length: number): Array<number> {
  const arr = [];
  for (let i = 0; i < Math.ceil(length / cols); i++) {
    arr.push(i);
  }
  return arr;
}

function updateClauseVars(orClauseIndex: number, andClauseIndex: number) {
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

function deleteAndClause(orIndex: number, andIndex: number) {
  thisRule.value.orClause[orIndex].andClause.splice(andIndex, 1);
}

const submit = async (event: { preventDefault: () => any }) => {
  await event.preventDefault();
  const { valid } = await form.value.validate();
  if (valid) {
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
      props.rule.simpleDefaultValue =
        defaultChoice.value == "True" ? true : false;
    }
    emit("saveEvent");
  }
};
</script>

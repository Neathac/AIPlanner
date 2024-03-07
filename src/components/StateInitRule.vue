<template>
  <v-container>
    <v-form @submit.prevent="submit" ref="form">
      <v-row>
      </v-row>
    </v-form>
  </v-container>
</template>

<script setup lang="ts">
import { useAtbStore } from "../stores/atbStore";
import { useDomainStore } from "../stores/domainStore";
import { ref, Ref, defineProps, onMounted } from "vue";
import { AttributedConstraint } from "@functions/parserTypes";

const form = ref();

const possibleConstraints: Ref<Array<AttributedConstraint>> = ref([]);

const props = defineProps({
  rule: {
    type: Object as () => AttributedConstraint,
    required: true,
  },
});

const emit = defineEmits(["saveEvent"]);

onMounted(() => {
  useDomainStore().getStructure.predicates.forEach((val) =>
    possibleConstraints.value.push({
      predicate: val.name,
      variables: val.varNames,
      negated: false,
    })
  );
  useAtbStore().getDCKmemory.forEach((val) =>
    possibleConstraints.value.push({
      predicate: val.name,
      variables: val.specificVars ?? [],
      negated: false,
    })
  );
  useAtbStore().getDCKstates.forEach((val) =>
    possibleConstraints.value.push({
      predicate: val.name,
      variables: val.specificVars ?? [],
      negated: false,
    })
  );
});

const submit = async (event: { preventDefault: () => any }) => {
  await event.preventDefault();
  const { valid } = await form.value.validate();
  if (valid) {
    emit("saveEvent");
  }
};
</script>

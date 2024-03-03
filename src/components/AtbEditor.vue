<template>
  <v-card>
    <v-tabs v-model="tab" color="deep-purple-accent-4" align-tabs="center">
      <v-tab :value="1">Attributed states</v-tab>
      <v-tab :value="2">DCK memory</v-tab>
      <v-tab :value="3">DCK transitions</v-tab>
    </v-tabs>
    <v-window v-model="tab">
      <v-window-item :key="1" :value="1">
        <v-container fluid>
          <v-row v-for="dckState in DCKstates" :key="dckState.name">
            <DckPredForm :state="dckState" />
          </v-row>
          <v-row class="justify-center">
            <v-btn color="green" icon="mdi-plus" @click="addDckState"></v-btn>
          </v-row>
        </v-container>
      </v-window-item>
      <v-window-item :key="2" :value="2">
        <v-container fluid>
          <v-row> <DckPredForm /> </v-row>
        </v-container>
      </v-window-item>
      <v-window-item :key="3" :value="3">
        <v-container fluid>
          <v-row> </v-row>
        </v-container>
      </v-window-item>
    </v-window>
  </v-card>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import DckPredForm from "./DckPredForm.vue";
import { useAtbStore } from "../stores/atbStore";
import { emptyAttributedState } from "@functions/parserTypes";

export default defineComponent({
  data() {
    return {
      atbStore: useAtbStore(),
      tab: null,
      DCKstates: useAtbStore().getDCKstates,
    };
  },
  methods: {
    addDckState() {
      this.atbStore.loadNewDckStates(
        this.atbStore.getDCKstates + [emptyAttributedState()]
      );
      this.DCKstates = this.atbStore.getDCKstates;
    },
  },
  components: {
    DckPredForm,
  },
});
</script>

<template>
  <div class="about">
    <v-navigation-drawer permanent>
      <v-list v-if="!loggedIn">
        <v-list-item
          v-for="(item, i) in files"
          :key="i"
          :value="item"
          :to="item.to"
          active-color="primary"
        >
          <template v-slot:prepend>
            <v-icon :icon="item.icon"></v-icon>
          </template>
          <!-- eslint-disable vue/no-v-text-v-html-on-component -->
          <v-list-item-title v-text="item.text"></v-list-item-title>
        </v-list-item>
      </v-list>
      <v-card v-if="loggedIn" class="justify-center">
        <v-autocomplete
          label="Domains"
          v-model="selectedDomain"
          :items="domainNames"
          :no-filter="true"
          :on-update:model-value="changedDomain"
        ></v-autocomplete>
        <v-card-title>
          <v-btn @click="createDomain"> Create new Domain </v-btn>
        </v-card-title>
      </v-card>
    </v-navigation-drawer>
  </div>
</template>

<script lang="ts">
import { defineComponent, watch } from "vue";
import { PROBLEM_ROUTE, DCK_ROUTE } from "../helpers/consts";
import { getAuth } from "firebase/auth";
import { Manager } from "../stores/resourceManager";
import { store } from "../store";
import { Domain, EMPTY_DOMAIN } from "@functions/systemTypes";

export default defineComponent({
  name: "ProtectedView",
  data() {
    return {
      menuVisible: true,
      loggedIn: getAuth().currentUser,
      selectedDomain: "",
      files: [
        { text: "File 1", icon: "mdi-earth", to: DCK_ROUTE },
        { text: "File 2", icon: "mdi-file-code-outline", to: PROBLEM_ROUTE },
      ],
      domainNames: [],
    };
  },
  mounted() {
    watch(store, (newStore) => {
      if (newStore.me.id) this.loggedIn = true;
    });
    Manager.getMyDomains().then((res) => {
      this.domains = res.map((dom) => dom.name);
    });
  },
  methods: {
    changedDomain() {
      console.log("I changed");
    },
    createDomain() {
      const dom = EMPTY_DOMAIN;
      dom.name = "SMTH";
      console.log("I fired");
      Manager.createDomain(dom).then((_res) => {
        Manager.getMyDomains().then((res) => {
          this.domains = res.map((dom) => dom.name);
        });
      });
    },
  },
});
</script>

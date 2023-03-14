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
        ></v-autocomplete>
        <v-card-title>
          <v-dialog v-model="dialogDomainCreate" persistent width="auto">
            <template v-slot:activator="{ props }">
              <v-btn v-bind="props"> Create new Domain </v-btn>
            </template>
            <v-card>
              <v-card-title class="text-h5"> Create domain </v-card-title>
              <v-text-field
                v-model="newDomainName"
                label="Domain name"
              ></v-text-field>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  color="green-darken-1"
                  variant="text"
                  @click="createDomain"
                >
                  Save
                </v-btn>
                <v-btn
                  color="error"
                  variant="text"
                  @click="dialogDomainCreate = false"
                >
                  Cancel
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
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
import editorFactory from "../languageSupport/nodeFactory/nodeFactory";

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
      domains: [] as Domain[],
      dialogDomainCreate: false,
      newDomainName: "Default name",
    };
  },
  watch: {
    selectedDomain(_oldSelection, newSelection: string) {
      if (newSelection) {
        const split = newSelection.split(" ");
        Manager.selectDomain(
          this.domains[parseInt(split[split.length - 1]) - 1]
        );
        this.$router.push(DCK_ROUTE);
      }
    },
  },
  mounted() {
    watch(store, (newStore) => {
      if (newStore.me.id) this.loggedIn = true;
      Manager.getMyDomains().then((res) => {
        this.domains = res;
        this.domainNames = res.map((dom, index) => {
          return dom.name + " " + ++index;
        });
      });
    });
  },
  methods: {
    createDomain() {
      this.dialogDomainCreate = false;
      const dom = EMPTY_DOMAIN;
      dom.name = this.newDomainName;
      dom.dckState = JSON.stringify(editorFactory());
      Manager.createDomain(dom).then((_res) => {
        Manager.getMyDomains().then((res) => {
          this.domains = res;
          this.domainNames = res.map((dom, index) => {
            return dom.name + " " + ++index;
          });
        });
      });
    },
  },
});
</script>

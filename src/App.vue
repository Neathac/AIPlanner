<script lang="ts">
import { defineComponent } from "vue";
import { ABOUT_ROUTE, HOME_ROUTE, DCK_ROUTE } from "./helpers/consts";

export default defineComponent({
  name: "App",
  data() {
    return {
      menuVisible: true,
      items: [
        { text: "Domů", icon: "mdi-home", to: HOME_ROUTE },
        { text: "Profil", icon: "mdi-account", to: DCK_ROUTE },
        { text: "About", icon: "mdi-cart-outline", to: ABOUT_ROUTE },
      ],
    };
  },
});
</script>

<template>
  <v-app>
    <v-navigation-drawer theme="dark" rail permanent>
      <v-list-item
        nav
        prepend-avatar="https://randomuser.me/api/portraits/women/75.jpg"
      ></v-list-item>

      <v-divider></v-divider>

      <v-list>
        <v-list-item
          v-for="(item, i) in items"
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
    </v-navigation-drawer>
    <router-view />
  </v-app>
</template>

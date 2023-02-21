<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "ProtectedView",
  data() {
    return {
      menuVisible: false,
      items: [
        { text: "Domů", icon: "mdi-home", to: "/main" },
        { text: "Profil", icon: "mdi-account", to: "/profile" },
        { text: "Registrace", icon: "mdi-account-plus", to: "/registration" },
        { text: "Admin", icon: "mdi-lock", to: "/admin" },
        { text: "Servis", icon: "mdi-cart-outline", to: "/service" },
      ],
    };
  },
});
</script>

<template>
  <v-app-bar>
    <v-app-bar-nav-icon color="black" @click="menuVisible = !menuVisible">
      <v-icon>mdi-menu</v-icon>
    </v-app-bar-nav-icon>
    <v-toolbar-title>{{ $route.name }}</v-toolbar-title>
  </v-app-bar>
  <v-navigation-drawer temporary v-model="menuVisible">
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
</template>

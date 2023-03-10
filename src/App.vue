<script lang="ts">
import { defineComponent } from "vue";
import FileStructure from "./components/FileStructure.vue";
import LoginAvatar from "./components/LoginAvatar.vue";
import { ABOUT_ROUTE, HOME_ROUTE } from "./helpers/consts";

export default defineComponent({
  name: "App",
  components: {
    FileStructure,
    LoginAvatar,
  },
  data() {
    return {
      menuVisible: true,
      items: [
        { text: "Domů", icon: "mdi-home", to: HOME_ROUTE },
        { text: "About", icon: "mdi-information", to: ABOUT_ROUTE },
      ],
    };
  },
});
</script>

<template>
  <v-app>
    <v-navigation-drawer theme="dark" rail permanent style="width: 60px">
      <LoginAvatar />

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
    <FileStructure />
    <v-main
      style="
         {
          padding-left: none;
          position: fixed;
          left: 0px;
          top: 0px;
          width: 100%;
        }
      "
      ><router-view
    /></v-main>
  </v-app>
</template>

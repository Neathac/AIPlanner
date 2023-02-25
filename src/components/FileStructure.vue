<template>
  <div class="about">
    <v-navigation-drawer permanent>
      <v-list>
        <v-list-item
          v-for="(item, i) in files"
          :key="i"
          :value="item"
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
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ABOUT_ROUTE, HOME_ROUTE, DCK_ROUTE } from "@src/helpers/consts";

export default defineComponent({
  name: "ProtectedView",
  data() {
    return {
      menuVisible: true,
      files: [
        { text: "File 1", icon: "mdi-home", to: HOME_ROUTE },
        { text: "File 2", icon: "mdi-account", to: DCK_ROUTE },
        { text: "Folder 1", icon: "mdi-cart-outline", to: ABOUT_ROUTE },
      ],
    };
  },
});
</script>

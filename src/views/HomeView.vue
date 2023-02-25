<script lang="ts">
import { defineComponent } from "vue";
import { ABOUT_ROUTE, HOME_ROUTE, DCK_ROUTE } from "../helpers/consts";

export default defineComponent({
  name: "ProtectedView",
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

<template>Ahoooj</template>

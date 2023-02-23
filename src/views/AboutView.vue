<template>
  <div class="about">
    <h1>This is an about page</h1>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ABOUT_ROUTE, HOME_ROUTE, PDDL_ROUTE } from "../helpers/consts";

export default defineComponent({
  name: "ProtectedView",
  data() {
    return {
      menuVisible: true,
      items: [
        { text: "Domů", icon: "mdi-home", to: HOME_ROUTE },
        { text: "Profil", icon: "mdi-account", to: PDDL_ROUTE },
        { text: "About", icon: "mdi-cart-outline", to: ABOUT_ROUTE },
      ],
    };
  },
});
</script>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>

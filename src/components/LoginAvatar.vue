<template>
  <v-btn :onclick="signin">
    <v-avatar>
      <v-img :src="avatar"> </v-img>
    </v-avatar>
  </v-btn>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { signin } from "../helpers/authHelper";
import { store } from "../store";
import { HOME_ROUTE } from "../helpers/consts";
import { Manager } from "../stores/resourceManager";

export default defineComponent({
  name: "LoginAvatar",
  data() {
    return {
      avatar: ref(store.avatar),
    };
  },
  methods: {
    async signin() {
      await signin();
      await Manager.getMyDomains();
      this.$router.push(HOME_ROUTE);
    },
  },
});
</script>

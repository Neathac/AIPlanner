import { defineStore } from "pinia";

export const useUserStore = defineStore("userStore", {
  state: () => ({
    userId: "",
    userToken: "",
    userName: "",
  }),
  getters: {
    account: (state) => (state.userId, state.userName, state.userToken),
  },
  actions: {
    login(userId: string, userToken: string, userName: string) {
      this.userId = userId;
      this.userToken = userToken;
      this.userName = userName;
    },
  },
});

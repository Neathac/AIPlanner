import { initializeApp } from "firebase/app";
import { createApp } from "vue";
import { createPinia } from "pinia";
import { initEmulators } from "./helpers/emulatorHelper";
import "@baklavajs/plugin-renderer-vue3/dist/styles.css";
// Vuetify
import "vuetify/styles";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import "@mdi/font/css/materialdesignicons.css";

import App from "./App.vue";
import router from "./router";

import "./assets/main.css";
import { initClient } from "./client";

const vuetify = createVuetify({
  components,
  directives,
});

const firebaseConfig = {
  apiKey: "AIzaSyAx1itd3sM290qg2ePjPOsWdpbS6X4-ApI",
  authDomain: "aiplanner-29862.firebaseapp.com",
  databaseURL:
    "https://aiplanner-29862-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "aiplanner-29862",
  storageBucket: "aiplanner-29862.appspot.com",
  messagingSenderId: "971328534676",
  appId: "1:971328534676:web:76721393d7214055ecdc81",
  measurementId: "G-C09KHBWW9C",
};

const app = initializeApp(firebaseConfig);
initEmulators();
initClient(app);

createApp(App).use(router).use(createPinia()).use(vuetify).mount("#app");

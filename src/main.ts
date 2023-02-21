import { createApp } from "vue";
import { createPinia } from "pinia";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { initEmulators } from "./helpers/emulatorHelper";

import App from "./App.vue";
import router from "./router";

import "./assets/main.css";

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

createApp(App).use(router).use(createPinia()).mount("#app");

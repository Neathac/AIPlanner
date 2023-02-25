import { ABOUT_ROUTE, HOME_ROUTE, DCK_ROUTE } from "@src/helpers/consts";
import { getAuth } from "firebase/auth";
import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@src/views/HomeView.vue";

const protectedRoutes: Array<String> = [];

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: HOME_ROUTE,
      name: "Home",
      component: HomeView,
    },
    {
      path: ABOUT_ROUTE,
      name: "About",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("@src/views/AboutView.vue"),
    },
    {
      path: DCK_ROUTE,
      name: "DCK",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("@src/views/DckView.vue"),
    },
  ],
});

// Guard certain routes
router.beforeEach(async (to, from, next) => {
  console.log("BEFORE EACH");
  const auth = getAuth();
  if (protectedRoutes.includes(to.path)) {
    if (!auth.currentUser) {
      next("/login");
    } else if (!(await auth.currentUser.getIdTokenResult(true)).token) {
      next("/login");
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;

import {
  ABOUT_ROUTE,
  HOME_ROUTE,
  DCK_ROUTE,
  PROBLEM_ROUTE,
} from "../helpers/consts";
import { getAuth } from "firebase/auth";
import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";

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
      component: () => import("../views/AboutView.vue"),
    },
    {
      path: DCK_ROUTE,
      name: "DCK",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("../views/DckView.vue"),
    },
    {
      path: PROBLEM_ROUTE,
      name: "Problem",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("../views/ProblemView.vue"),
    },
  ],
});

// Guard certain routes
router.beforeEach(async (to, from, next) => {
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

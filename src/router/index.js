import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import Admin from "../views/Admin.vue";
import Login from "../views/Login.vue";
import Lobby from "../views/Lobby.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/admin", component: Admin, meta: { requiresAuth: true } },
  { path: "/login", component: Login },
  { path: "/lobby", component: Lobby },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");

  if (to.meta.requiresAuth && !token) {
    next("/login");
  } else {
    next();
  }
});

export default router;

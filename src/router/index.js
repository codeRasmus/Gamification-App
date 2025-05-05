import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import Admin from "../views/Admin.vue";
import Login from "../views/Login.vue";
import Lobby from "../views/Lobby.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/admin", component: Admin },
  { path: "/login", component: Login },
  { path: "/lobby", component: Lobby },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;

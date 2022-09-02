import { createRouter, createWebHistory } from "vue-router";
import RoomView from "@/views/RoomView.vue";
import ArbolBlancoView from "@/views/ArbolBlancoView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "arbol-blanco",
      component: ArbolBlancoView,
    },
    {
      path: "/room",
      name: "room",
      component: RoomView,
    }
    
  ],
});

export default router;

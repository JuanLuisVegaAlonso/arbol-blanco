import { createRouter, createWebHistory } from "vue-router";
import RoomView from "@/views/RoomView.vue";
import ArbolBlancoView from "@/views/ArbolBlancoView.vue";
import RoomInviteViewVue from "@/views/RoomInviteView.vue";

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
    },
    {
      path: "/roomInvite/:roomName",
      name: "roomInvite",
      component: RoomInviteViewVue
    }
    
  ],
});

export default router;

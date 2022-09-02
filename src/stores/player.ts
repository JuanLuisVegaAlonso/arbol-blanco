import type { Player } from "@/arbol-blanco";
import { defineStore } from "pinia";

export const usePlayerStore = defineStore({
  id: "player",
  state: () => ({
    name: "",
    player: undefined  as unknown as Player
  }),
  actions: {
    setName(name: string) {
      this.name = name;
    },
  },
  persist: true,
});

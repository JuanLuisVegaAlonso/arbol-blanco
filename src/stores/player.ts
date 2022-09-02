import { defineStore } from "pinia";

export const usePlayerStore = defineStore({
  id: "player",
  state: () => ({
    name: "",
  }),
  actions: {
    setName(name: string) {
      this.name = name;
    },
  },
  persist: true,
});

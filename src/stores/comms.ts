import { defineStore } from "pinia";
import type { Client } from "@/comms";

export const useCommsStore = defineStore({
  id: "comms",
  state: () => ({
    roomComms: undefined as unknown as Client,
    playerComms: undefined as unknown as Client,
  }),
  getters: {
    
  },
  actions: {
    
  },
});

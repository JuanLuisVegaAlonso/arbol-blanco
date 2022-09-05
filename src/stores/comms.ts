import { defineStore } from "pinia";
import type { Client } from "@/comms";

export const useCommsStore = defineStore({
  id: "comms",
  state: () => ({
    client: undefined as unknown as Client,
  }),
  getters: {
    
  },
  actions: {
    
  },
});

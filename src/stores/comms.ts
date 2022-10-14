import { defineStore } from "pinia";
import type { PeerClient } from "@/comms";

export const useCommsStore = defineStore({
  id: "comms",
  state: () => ({
    client: undefined as unknown as PeerClient | void,
    isServer: false
  }),
  getters: {
    
  },
  actions: {
    
  },
});

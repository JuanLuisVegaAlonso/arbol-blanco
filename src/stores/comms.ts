import { defineStore } from "pinia";
import type { PeerClient } from "@/comms";
import type { Player } from "@/arbol-blanco";

export const useCommsStore = defineStore({
  id: "comms",
  state: () => ({
    client: undefined as unknown as PeerClient | void,
    isServer: false,
    pendingRemove: [] as {player: Player, peerId: string}[]
  }),
  getters: {
    
  },
  actions: {
    
  },
});

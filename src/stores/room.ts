import { defineStore } from "pinia";
import type { DataConnection } from "peerjs";
import type { Room } from "@/arbol-blanco";

export const useRoomStore = defineStore({
  id: "room",
  state: () => ({
    connections: [] as string[],
    roomName: "",
    room: undefined as unknown as Room
  }),
  getters: {
    numberConnections: (state) => state.connections.length,
  },
  actions: {
    addConection(connection: DataConnection) {
      this.connections = [...this.connections, connection.peer];
    },
  },
  persist: true,
});

import { defineStore } from "pinia";
import type { DataConnection } from "peerjs";

export const useRoomStore = defineStore({
  id: "room",
  state: () => ({
    connections: [] as string[],
    ownRoom: "",
    remoteRoom: ""
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

import { defineStore } from "pinia";
import type { DataConnection } from "peerjs";
import { getCurrentRoundInfo, type Room } from "@/arbol-blanco";

export const useRoomStore = defineStore({
  id: "room",
  state: () => ({
    connections: [] as string[],
    roomName: "",
    room: undefined as unknown as Room,
  }),
  getters: {
    currentSecretWord: (state) => {
      const currentRoundInfo = getCurrentRoundInfo(state.room);
      if (!currentRoundInfo) return undefined;
      return currentRoundInfo.secretWord;
    },
    players: (state) => {
      return state.room.players;
    },
    currentGm: (state) => {
      return state.room.currentGM;
    },
    currentArbolBlanco: (state) => {
      const currentRoundInfo = getCurrentRoundInfo(state.room);
      if (!currentRoundInfo) return undefined;
      return currentRoundInfo.arbolBlanco;
    }
  },
  actions: {
    addConection(connection: DataConnection) {
      this.connections = [...this.connections, connection.peer];
    },
  },
  persist: true,
});

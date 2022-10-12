import { defineStore } from "pinia";
import type { DataConnection } from "peerjs";
import { changeArbolBlanco, changeGM, changeSecretWord, getCurrentRoundInfo, newRoom, newRound, type Player, type Room } from "@/arbol-blanco";
import { useCommsStore } from "./comms";
import { MessageTypes } from "@/comms";

export const useRoomStore = defineStore({
  id: "room",
  state: () => ({
    connections: [] as string[],
    roomName: "",
    room: undefined as unknown as Room,
    client: useCommsStore()
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
    },
    isServer: (state) => state.client.isServer
  },
  actions: {
    changeSecretWord(secretWord: string) {
      if (this.isServer) {
        changeSecretWord(this.room, secretWord);
        this.client.client!.sendMessage({messageType: MessageTypes.UPDATE_STATE, message: this.room});
      } else {
        this.client.client!.sendMessage({
          messageType: MessageTypes.SEND_SECRET_WORD,
          message: {
            secretWord
          }
        })
      }
    },
    changeGM(newGM: Player) {
      if (this.isServer) {
        changeGM(this.room, newGM);
        this.client.client!.sendMessage({messageType: MessageTypes.UPDATE_STATE, message: this.room});
      } else {
        this.client.client!.sendMessage({
          messageType: MessageTypes.CHANGE_GM,
          message: {
            newGM
          }
        })
      }
    },
    changeArbolBlanco(arbolBlanco: Player) {
      if (this.isServer) {
        changeArbolBlanco(this.room, arbolBlanco);
        this.client.client!.sendMessage({messageType: MessageTypes.UPDATE_STATE, message: this.room});
      } else {
        this.client.client!.sendMessage({
          messageType: MessageTypes.CHANGE_ARBOL_BLANCO,
          message: {
            arbolBlanco
          }
        })
      }
    },
    newRound() {
      if (this.isServer) {
        newRound(this.room);
        this.client.client!.sendMessage({messageType: MessageTypes.UPDATE_STATE, message: this.room});
      } else {
        this.client.client!.sendMessage({
          messageType: MessageTypes.NEW_ROUND,
          message: undefined
        })
      }
    }

  },
  persist: true,
});

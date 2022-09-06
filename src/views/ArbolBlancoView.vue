<script setup lang="ts">
import CreatePlayer from "../components/CreatePlayer.vue";
import { usePlayerStore } from "@/stores/player";
import { useRoomStore } from "@/stores/room";
import RoomHandler from "../components/RoomHandler.vue";
import { isGM, type Player, changeArbolBlanco, changeGM, changeSecretWord as changeSecretWordRoom, newRound } from "@/arbol-blanco";
import GMRoom from "../components/GMRoom.vue";
import { useCommsStore } from "@/stores/comms";
import { MessageTypes } from "@/comms";
import PlayerWaiting from "../components/PlayerWaiting.vue";

const playerStore = usePlayerStore();
const roomStore = useRoomStore();
const commsStore = useCommsStore();


roomStore.$subscribe((mutation, state) => {
    if (commsStore.isServer) {
        commsStore.client.sendMessage({ messageType: MessageTypes.UPDATE_STATE, message: state.room });
    }
})


function currentGM() {
  return playerStore.player && roomStore.room && isGM(roomStore.room, playerStore.player);
}

function makeArbolBlanco(player: Player) {
  changeArbolBlanco(roomStore.room, player);
  updateState();
}

function makeGM(player: Player) {
  changeGM(roomStore.room, player);
  updateState();
}
function clearRoom() {
  roomStore.$patch({room: undefined})
}

function changeSecretWord(secretWord: string) {
  changeSecretWordRoom(roomStore.room, secretWord);
  updateState();
}

function updateState() {
  commsStore.client.sendMessage({messageType: MessageTypes.UPDATE_STATE, message: roomStore.room});
}

function newRoundHere(){
  newRound(roomStore.room);
}
</script>

<template>
  <div>
    <CreatePlayer v-if="!playerStore.player"/>
    <RoomHandler v-if="playerStore.player && !roomStore.room"/>
    <GMRoom v-if="currentGM()" 
      @swipe-left="makeArbolBlanco"
      @swipe-right="makeGM" 
      @change-secret-word="changeSecretWord"
      @new-round="newRoundHere"
      />
    <PlayerWaiting v-if="!currentGM() &&playerStore.player && roomStore.room"/>
    <button @click="clearRoom">Clear Room</button>
  </div>
</template>

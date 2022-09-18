<script setup lang="ts">
import CreatePlayer from "../components/CreatePlayer.vue";
import RoomHandler from "../components/RoomHandler.vue";
import GMRoom from "../components/GMRoom.vue";
import PlayerWaiting from "../components/PlayerWaiting.vue";
import { usePlayerStore } from "@/stores/player";
import { useRoomStore } from "@/stores/room";
import { isGM, type Player, changeArbolBlanco, changeGM, changeSecretWord as changeSecretWordRoom, newRound } from "@/arbol-blanco";
import { useCommsStore } from "@/stores/comms";
import { MessageTypes } from "@/comms";
import { ref } from "vue";


const playerStore = usePlayerStore();
const roomStore = useRoomStore();
const commsStore = useCommsStore();
let secretWord = ref('');

roomStore.$subscribe((mutation, state) => {
    if (commsStore.isServer && commsStore.client) {
      console.log("updating via pinia")
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

function changeSecretWord(secretWordInternal: string) {
  changeSecretWordRoom(roomStore.room, secretWordInternal);
  secretWord.value = '';
  updateState();
}

function updateState() {
  commsStore.client!.sendMessage({messageType: MessageTypes.UPDATE_STATE, message: roomStore.room});
}

function newRoundHere(){
  newRound(roomStore.room);
  secretWord.value = '';
  updateState();
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
      v-model:secret-word="secretWord"
      />
    <PlayerWaiting v-if="!currentGM() &&playerStore.player && roomStore.room"/>
  </div>
</template>

<style scoped>
</style>
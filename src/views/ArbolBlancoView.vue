<script setup lang="ts">
import CreatePlayer from "../components/CreatePlayer.vue";
import RoomHandler from "../components/RoomHandler.vue";
import GMRoom from "../components/GMRoom.vue";
import PlayerWaiting from "../components/PlayerWaiting.vue";
import { usePlayerStore } from "@/stores/player";
import { useRoomStore } from "@/stores/room";
import { isGM, type Player, changeArbolBlanco, changeGM, changeSecretWord as changeSecretWordRoom, newRound, isRoundLive } from "@/arbol-blanco";
import { useCommsStore } from "@/stores/comms";
import { MessageTypes } from "@/comms";
import { ref } from "vue";


const playerStore = usePlayerStore();
const roomStore = useRoomStore();
const commsStore = useCommsStore();
let secretWord = ref('');

// roomStore.$subscribe((mutation, state) => {
//     if (commsStore.isServer && commsStore.client) {
//       console.log("updating via pinia");
//       commsStore.client.sendMessage({ messageType: MessageTypes.UPDATE_STATE, message: state.room });
//     }
// })


function currentGM() {
  return playerStore.player && roomStore.room && isGM(roomStore.room, playerStore.player);
}

function makeArbolBlanco(player: Player) {
  if (!isRoundLive(roomStore.room)) {
    roomStore.changeArbolBlanco(player);
  }
  
}

function makeGM(player: Player) {
  if (!isRoundLive(roomStore.room)) {
    roomStore.changeGM(player);
  }
  
  
}

function changeSecretWord(secretWordInternal: string) {
  if (roomStore.currentArbolBlanco) {
    roomStore.changeSecretWord(secretWordInternal);
  }
}



function newRoundHere(){
  roomStore.newRound();
  secretWord.value = "";
}
</script>

<template>
    <CreatePlayer v-if="!playerStore.player"/>
    <RoomHandler v-if="playerStore.player && !roomStore.room"/>
    <GMRoom v-if="currentGM()" 
      @swipe-left="makeGM"
      @swipe-right="makeArbolBlanco" 
      @change-secret-word="changeSecretWord"
      @new-round="newRoundHere"
      v-model:secret-word="secretWord"
      />
    <PlayerWaiting v-if="!currentGM() &&playerStore.player && roomStore.room"/>
</template>

<style scoped>
</style>
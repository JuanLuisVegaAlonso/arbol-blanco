<script setup lang="ts">
import { getCurrentRoundInfo, isArbolBlanco } from '@/arbol-blanco';
import { usePlayerStore } from '@/stores/player';
import { useRoomStore } from '@/stores/room';

const roomStore = useRoomStore();
const playerStore = usePlayerStore();

function getCurrentRoundInfoHere() {
    return getCurrentRoundInfo(roomStore.room)
}

function getSecretWord() {
    const roundInfo = getCurrentRoundInfoHere();
    if (!roundInfo) return undefined;
    return roundInfo.secretWord;
}
function isArbolBlancoHere(){
    return isArbolBlanco(roomStore.room, playerStore.player );
}
</script>


<template>
    <div v-if="!getSecretWord()">Waiting....</div>
    <div v-else-if="isArbolBlancoHere()">Arbol Blanco</div>
    <div v-else>{{getSecretWord()}}</div>
</template>
  
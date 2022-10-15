<script setup lang="ts">
import { getCurrentRoundInfo, isArbolBlanco } from '@/arbol-blanco';
import { usePlayerStore } from '@/stores/player';
import { useRoomStore } from '@/stores/room';
import Animatext from './generic/Animatext.vue';

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
    <div id="waiting-wrapper">
        <div id="waiting" v-if="!getSecretWord()">
            
            <Animatext text="waiting..."/>
        </div>
        <div v-else-if="isArbolBlancoHere()">Arbol Blanco</div>
        <div v-else>{{getSecretWord()}}</div>
    </div>
</template>
  

<style scoped>
#waiting-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1;
}
#waiting {
    display: flex;
}

#waiting span:nth-child(0) {
    justify-self: flex-start;
}
</style>
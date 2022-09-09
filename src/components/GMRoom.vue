
<script setup lang="ts">
import { getCurrentRoundInfo, isArbolBlanco as isArbolBlancoRoom, isGM as isGMRoom, type Player as PlayerType } from '@/arbol-blanco';
import { useRoomStore } from '@/stores/room';
import PlayerSlab from './PlayerSlab.vue';
import Hammer from 'hammerjs';
import type { RendererElement, RendererNode, VNode } from 'vue';
import InputComponent from './InputComponent.vue';

const roomStore = useRoomStore();
let secretWord: string | undefined = undefined;
const isGM = isGMRoom;
const isArbolBlanco = isArbolBlancoRoom

const emits = defineEmits(["swipeRight", "swipeLeft", "changeSecretWord", "newRound"]);
function log(event: VNode<RendererNode, RendererElement, {
    [key: string]: any;
}>, player: PlayerType) {
    if (event.el === null) return;
    const hammer = new Hammer(event.el as HTMLElement);
    hammer.on("swipeleft swiperight", function (ev: any) {
        console.log(ev.type + " gesture detected.");
        if (ev.type === "swiperight") {
            emits("swipeRight", player);
        } 
        if (ev.type === "swipeleft") {
            emits("swipeLeft", player);
        }
    });
}


</script>
<template>
    <div id="players">
        <PlayerSlab v-for="player in roomStore.room.players" :name="player.name" :is-g-m="isGM(roomStore.room, player)" :is-arbol-blanco="isArbolBlanco(roomStore.room, player)"
            v-on:vnode-mounted="log($event, player)" />
    </div>
    <div id="secret-word">
        <input-component v-model="secretWord"/>
        <span>
            <img  @click="$emit('changeSecretWord', secretWord)" src="enigma.webp" alt="ch.secret word">
        </span>
        <span>
            <img @click="$emit('newRound')" src="end.webp" alt="new round">
        </span>
    </div>
</template>
<style scoped>
#players {
    display: flex;
    flex-wrap: wrap;
}
#secret-word {
    display: flex;
}
#secret-word > * {
    margin: 3px;
}
</style>

<script setup lang="ts">
import { getCurrentRoundInfo, isArbolBlanco as isArbolBlancoRoom, isGM as isGMRoom, type Player as PlayerType } from '@/arbol-blanco';
import { useRoomStore } from '@/stores/room';
import Player from './Player.vue';
import Hammer from 'hammerjs';
import type { RendererElement, RendererNode, VNode } from 'vue';

const roomStore = useRoomStore();
let secretWord: string | void = undefined;
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
        <Player v-for="player in roomStore.room.players" :name="player.name" :is-g-m="isGM(roomStore.room, player)" :is-arbol-blanco="isArbolBlanco(roomStore.room, player)"
            v-on:vnode-mounted="log($event, player)" />
    </div>
    <div id="secret-word">
        <input v-model="secretWord"/>
        <button @click="$emit('changeSecretWord', secretWord)">Change secret word</button>
        <button @click="$emit('newRound')">New Round</button>
    </div>
</template>
<style scoped>
#players {
    display: flex;
    flex-wrap: wrap;
}
</style>
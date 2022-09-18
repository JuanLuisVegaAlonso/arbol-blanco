
<script setup lang="ts">
import { getCurrentRoundInfo, isArbolBlanco as isArbolBlancoRoom, isGM as isGMRoom, type Player as PlayerType } from '@/arbol-blanco';
import { useRoomStore } from '@/stores/room';
import PlayerSlab from './PlayerSlab.vue';
import Hammer from 'hammerjs';
import type { RendererElement, RendererNode, VNode } from 'vue';
import InputComponent from './InputComponent.vue';
import ButtonComponent from './ButtonComponent.vue';

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
    <h3>Room: {{roomStore.room.name}}</h3>
    <div id="players">
        <PlayerSlab v-for="player in roomStore.room.players" :name="player.name" :is-g-m="isGM(roomStore.room, player)" :is-arbol-blanco="isArbolBlanco(roomStore.room, player)"
            v-on:vnode-mounted="log($event, player)" />
    </div>
    <div id="secret-word">
        <h3>Secret word</h3>
        <input-component v-model="secretWord"/>
        <div class="buttons">
            <button-component  @click="$emit('changeSecretWord', secretWord)" label="change secret word" img="enigma"/>
            <button-component  @click="$emit('newRound')" label="new round" img="end"/>
        </div>
    </div>
</template>
<style scoped>
#players {
    display: flex;
    flex-wrap: wrap;
}
#secret-word {
    display: flex;
    flex-wrap: wrap;
}
#secret-word > * {
    margin: 3px;
}
.buttons {
    display: flex;
}
.buttons > * {
    margin: 3px;
}
h3 {
    text-align: center;
}
</style>
<script setup lang="ts">
import { newPlayer } from '@/arbol-blanco/player';
import { usePlayerStore } from '@/stores/player';
import { ref } from 'vue';
import InputComponent from './InputComponent.vue';

const playerStore = usePlayerStore();
let message = ref();

function createPlayer() {
    playerStore.player = newPlayer(playerStore.name);

}
</script>


<template>
    <div id="player">
        <h2>Player</h2>
        <div>
            <input-component v-model="playerStore.name" />
            <span>
                <img src="addPeople.webp" alt="AddPeople" @click="createPlayer">
            </span>
        </div>
    </div>
</template>

<style scoped>
#player {
    text-align: center;
    display: flex;
    flex-direction: column;
}

#player > div {
    display: flex;
    flex-wrap: no-wrap;
}
</style>
  
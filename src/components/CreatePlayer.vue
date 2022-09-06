<script setup lang="ts">
import { newPlayer } from '@/arbol-blanco/player';
import { usePlayerStore } from '@/stores/player';
import { ref } from 'vue';

const playerStore = usePlayerStore();
let message = ref();

function createPlayer() {
    playerStore.player = newPlayer(playerStore.name);

}
</script>


<template>
    <h2>Player</h2>
    <input v-model="playerStore.name" />
    <span v-if="playerStore.player">
        ✅
    </span>
    <span v-else>
        ❌
    </span>
    <br />
    <button @click="createPlayer">Create player</button>
    <br />
</template>
  
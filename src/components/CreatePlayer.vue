<script setup lang="ts">
import { newPlayer } from '@/arbol-blanco/player';
import { usePlayerStore } from '@/stores/player';
import { ref } from 'vue';
import ButtonComponent from './ButtonComponent.vue';
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
        <input-component v-model="playerStore.name" />
        <div class="buttons">
            <button-component  @click="createPlayer" label="Create player" img="addPeople"/>
        </div>
    </div>
</template>

<style scoped>
#player {
    text-align: center;
    display: flex;
    flex-direction: column;
}


.buttons {
    display: flex;
    justify-content: space-around;
}
.buttons > *{ 
    margin: 3px;
}
</style>
  
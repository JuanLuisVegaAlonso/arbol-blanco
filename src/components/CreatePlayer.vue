<script setup lang="ts">
import { newPlayer } from '@/arbol-blanco/player';
import { usePlayerStore } from '@/stores/player';
import { ref } from 'vue';
import {evalue, required, validPeerId} from '@/validation';
import ButtonComponent from './generic/ButtonComponent.vue';
import InputComponent from './generic/InputComponent.vue';
import ErrorComponent from './generic/ErrorComponent.vue';

const playerStore = usePlayerStore();
let message = ref();
const validName = ref(playerStore.name !== undefined ? evalue(playerStore.name, required, validPeerId) : true);

function createPlayer() {
    if (validName.value) {
        playerStore.player = newPlayer(playerStore.name);
    }

}

playerStore.$subscribe((mutation, state) => {
    console.log(state)
    if (state.name !== undefined) {
        validName.value = evalue(state.name, required, validPeerId);
    }});

</script>


<template>
    <div id="player">
        <h2>Player</h2>
        <input-component v-model="playerStore.name" />
        <error-component v-if="!validName" message="Invalid name"/>
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
  
<script setup lang="ts">
import { newPlayer } from '@/arbol-blanco/player';
import { usePlayerStore } from '@/stores/player';
import { ref, watch } from 'vue';
import {evalue, required, validPeerId} from '@/validation';
import ButtonComponent from './ButtonComponent.vue';
import InputComponent from './InputComponent.vue';

const playerStore = usePlayerStore();
let message = ref();
const validName = ref(false);

function createPlayer() {
    if (validName.value) {
        playerStore.player = newPlayer(playerStore.name);
    }

}

playerStore.$subscribe((mutation, state) => {
    console.log(state)
    if (state.name) {
        validName.value = evalue(state.name, required, validPeerId);
    }});

</script>


<template>
    <div id="player">
        <h2>Player</h2>
        <input-component v-model="playerStore.name" />
        <label class="invalid" v-if="!validName">Invalid name</label>
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

.invalid {
    color: #980023;
    font-size: 22px;
}
.buttons {
    display: flex;
    justify-content: space-around;
}
.buttons > *{ 
    margin: 3px;
}
</style>
  
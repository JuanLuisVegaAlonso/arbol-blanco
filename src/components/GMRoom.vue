
<script setup lang="ts">
import { isArbolBlanco , isGM, isRoundLive, type Player} from '@/arbol-blanco';
import { useRoomStore } from '@/stores/room';
import PlayerSlab from './PlayerSlab.vue';
import InputComponent from './generic/InputComponent.vue';
import ButtonComponent from './generic/ButtonComponent.vue';
import { reactive } from 'vue';


defineProps({
    secretWord: String
})

const roomStore = useRoomStore();


const emits = defineEmits(["swipeRight", "swipeLeft", "changeSecretWord", "newRound"]);

const deltaXs = reactive([] as number[]);

roomStore.$subscribe((mutation, state) => {
    if (roomStore.room.players.values.length > deltaXs.length) {
        deltaXs.push(0);
    }
})

const deltaXchange = (deltaX: number, index: number, player: Player) => {

    
    if (!isGM(roomStore.room, player) && !isRoundLive(roomStore.room)) {
        for(let i = 0; i < deltaXs.length; i++) {
            if (deltaX < 0 && (roomStore.currentGm && roomStore.currentGm.name === roomStore.players[i].name) ) {
                deltaXs[i] = - 1 - deltaX;
                console.log("hallo")
            }
            if (deltaX > 0 && (roomStore.currentArbolBlanco && roomStore.currentArbolBlanco.name === roomStore.players[i].name)) {
                deltaXs[i] = 1 - deltaX;
            } 
        }
        deltaXs[index] = deltaX;    
    }
    
}
</script>
<template>
    <h3>{{roomStore.room.name}}</h3>
    <div id="players">
        <PlayerSlab 
            @swipe-left="$emit('swipeLeft', player)" 
            @swipe-right="$emit('swipeRight', player)"
            @delta-x="deltaXchange($event, index, player)"
            v-for="(player , index) in roomStore.room.players" :name="player.name" 
            :is-g-m="isGM(roomStore.room, player)"
            :is-arbol-blanco="isArbolBlanco(roomStore.room, player)"
            :delta-x="deltaXs[index]"
           />
    </div>
    <div id="secret-word">
        <h3>Secret word</h3>
        <input-component :value="secretWord" @input="$emit('update:secretWord', ($event.target as HTMLInputElement).value)" :disabled="isRoundLive(roomStore.room)"/>
        <div class="buttons">
            <button-component  v-if="isRoundLive(roomStore.room)" @click="$emit('newRound')" label="new round" img="end"/>
            <button-component  v-else @click="$emit('changeSecretWord', secretWord)" label="change secret word" img="enigma"/>
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
    flex-direction: column;
}
#secret-word > * {
    margin: 3px;
}
.buttons {
    display: flex;
    justify-content: space-around;
}
.buttons > * {
    margin: 3px;
}
h3 {
    text-align: center;
}
</style>
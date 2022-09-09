<script setup lang="ts">
import { useCommsStore } from '@/stores/comms';
import { usePlayerStore } from '@/stores/player';
import { useRoomStore } from '@/stores/room';

const roomStore = useRoomStore();
const playerStore = usePlayerStore();
const commsStore = useCommsStore();


function exitRoom() {

    if (commsStore.client) {
        commsStore.client.destroy();
        commsStore.$patch({client: undefined})
    }
    roomStore.$patch({room: undefined})
}

function removeUser() {
    playerStore.$patch({player: undefined});
}
</script>
<template>
    <header>
        <template v-if="playerStore.player">
            <span>{{ playerStore.player?.name }}</span>
            <span v-if="playerStore.player" @click="removeUser">
                    <img src="removePeople.webp" alt="remove">
            </span>
            <span v-if="roomStore.room">
                <img src="puerta.webp" alt="puerta" @click="exitRoom">
            </span>
        </template>
        <template v-else>
            <span>Arbol blanco</span>
        </template>
    </header>
</template>

<style scoped>
span {
    text-align: center;
}
header {
    display: flex;
    justify-content: space-around;
}
</style>
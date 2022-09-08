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

</script>
<template>
    <header>
        <template v-if="playerStore.player">
            <span>User: {{ playerStore.player?.name }}</span>
            <button v-if="roomStore.room" @click="exitRoom">Exit room</button>
        </template>
        <template v-else>
            <span>Arbol blanco</span>
        </template>
    </header>
</template>

<style scoped>
div:first-child {
    font-size: 10px;
}
</style>
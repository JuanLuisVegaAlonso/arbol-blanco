<script setup lang="ts">
import { useCommsStore } from '@/stores/comms';
import { usePlayerStore } from '@/stores/player';
import { useRoomStore } from '@/stores/room';

const roomStore = useRoomStore();
const playerStore = usePlayerStore();
const commsStore = useCommsStore();
const imageSize = 32;


function exitRoom() {

    if (commsStore.client) {
        commsStore.client.destroy();
        commsStore.$patch({client: undefined})
    }
    roomStore.$patch({room: undefined})
}

function removeUser() {
    if (commsStore.client) {
        commsStore.client.destroy();
        commsStore.$patch({client: undefined});
    }
    if (roomStore.room) {
        roomStore.$patch({room: undefined});
    }
    playerStore.$patch({player: undefined});
}
</script>
<template>
    <header>
        <template v-if="playerStore.player">
            <span>{{ playerStore.player?.name }}</span>
            <span v-if="playerStore.player" @click="removeUser" class="tappable">
                    <img src="/buttonImages/removePeople.png" alt="remove" :width="imageSize" :height="imageSize">
            </span>
            <span v-if="roomStore.room" class="tappable">
                <img src="/buttonImages/puerta.png" alt="puerta" @click="exitRoom" :width="imageSize" :height="imageSize">
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
    display: flex;
    align-items: center;
}
header {
    display: flex;
    justify-content: space-around;
    margin-bottom: 3px;
}

img {
    image-rendering: pixelated;
}
.tappable {
    cursor: pointer;
}
</style>
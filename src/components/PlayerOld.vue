<script setup lang="ts">
import { newPlayer } from '@/arbol-blanco/player';
import { getCurrentRoundInfo, isGM, newRoom, type Room } from '@/arbol-blanco/room';
import { addResponse, changeGM } from '@/arbol-blanco';
import { MessageTypes, Client } from '@/comms';
import type { SendSecretWordMessage } from '@/comms/messages';
import { usePlayerStore } from '@/stores/player';
import { useRoomStore } from '@/stores/room';
import { useCommsStore } from '@/stores/comms';
import { ref } from 'vue';

const roomStore = useRoomStore();
const playerStore = usePlayerStore();
const commsStore = useCommsStore();
let message = ref();

if (playerStore.player) {
    createPlayer();
}

function createPlayer() {
    playerStore.player = newPlayer(playerStore.name);

}


function sendMessage() {
    if (!commsStore.client) return;
    if (isGM(roomStore.room, playerStore.player)) {
        if (!roomStore.room) return;
        const currentRoundInfo = getCurrentRoundInfo(roomStore.room)
        if (!currentRoundInfo) return;
        addResponse(currentRoundInfo, playerStore.player, message.value);
    } else {
        commsStore.client.sendMessage<SendSecretWordMessage>({
            messageType: MessageTypes.SEND_SECRET_WORD, message: {
                from: playerStore.player, secretWord: message.value
            }
        })
    }

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
    <input v-model="message" />
    <button @click="sendMessage">Send message</button>
</template>
  
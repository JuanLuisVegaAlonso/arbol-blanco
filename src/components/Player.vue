<script setup lang="ts">
import { newPlayer } from '@/arbol-blanco/player';
import { getCurrentRoundInfo, newRoom, type Room } from '@/arbol-blanco/room';
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



function createPlayer() {
    playerStore.player = newPlayer(playerStore.name);
    if (commsStore.playerComms) {
        commsStore.playerComms.destroy();
    }

    commsStore.playerComms = new Client(playerStore.player.name);

    commsStore.playerComms.addListener((message) => {
        switch (message.messageType) {
            case MessageTypes.SEND_SECRET_WORD:
                if (!roomStore.room) return;
                const currentRoundInfo = getCurrentRoundInfo(roomStore.room)
                if (!currentRoundInfo) return;
                const secretWordSent = message.message as SendSecretWordMessage;
                addResponse(currentRoundInfo, secretWordSent.from, secretWordSent.secretWord);
        }
    });
}


function sendMessage() {
    if (!commsStore.playerComms) return;
    commsStore.playerComms.sendMessage<SendSecretWordMessage>({
        messageType: MessageTypes.SEND_SECRET_WORD, message: {
            from: playerStore.player, secretWord: message.value
        }
    })
}
</script>


<template>
    <h2>Player</h2>
    <input v-model="playerStore.name" />
    <br />
    Roomies {{ playerStore.name }}
    <button @click="createPlayer">Create player</button>
    <br />
    <input v-model="message" />
    <button @click="sendMessage">Send message</button>
</template>
  
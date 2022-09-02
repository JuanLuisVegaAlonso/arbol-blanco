<script setup lang="ts">
import { getCurrentRoundInfo, newRoom, type Room } from '@/arbol-blanco/room';
import { addResponse } from '@/arbol-blanco/round-info';
import { MessageTypes, Client } from '@/comms';
import type { SendSecretWordMessage } from '@/comms/messages';
import { usePlayerStore } from '@/stores/player';
import { useRoomStore } from '@/stores/room';
import { useCommsStore } from '@/stores/comms';
import { ref } from 'vue';

const roomStore = useRoomStore();
const playerStore = usePlayerStore();
const commsStore = useCommsStore();
let connectedToRoom = ref(false);


function createRoom() {
    roomStore.room = newRoom(roomStore.roomName, playerStore.player);
    if (commsStore.roomComms) {
        commsStore.roomComms.destroy();
    }
    commsStore.roomComms = new Client(roomStore.roomName);
    commsStore.roomComms.addListener((message) => {
        console.log(message);
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

function joinRoom() {
    if (!commsStore.playerComms) return;
    console.log("tests");
    commsStore.playerComms.connect(roomStore.roomName).then(() => {
        connectedToRoom.value = true
        console.log("test");
    });
}
function getRoundInfo() {
    return roomStore.room ? getCurrentRoundInfo(roomStore.room) : undefined;
}
</script>


<template>
    <h2>Room</h2>
    <input v-model="roomStore.roomName" />
    <br />
    Roomies {{ roomStore.roomName }}
    <button @click="createRoom">Create room </button>
    <button @click="joinRoom">Join room </button>
    <br />
    <ul v-if="getRoundInfo()">
        <li v-for="response in getRoundInfo()?.responses">
            Player: {{response.owner.name}}
            <br/>
            Message: {{response.message}}
        </li>
    </ul>
    <div v-if="connectedToRoom">
        Connected to: {{roomStore.roomName}}
    </div>
</template>
  
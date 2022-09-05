<script setup lang="ts">
import { MessageTypes, Client } from '@/comms';
import type { SendSecretWordMessage } from '@/comms/messages';
import { usePlayerStore } from '@/stores/player';
import { useRoomStore } from '@/stores/room';
import { useCommsStore } from '@/stores/comms';
import { ref } from 'vue';
import type { Player, Room } from '@/arbol-blanco';
import { isGM, getCurrentRoundInfo, join, newRoom, addResponse } from '@/arbol-blanco';

const roomStore = useRoomStore();
const playerStore = usePlayerStore();
const commsStore = useCommsStore();
let connectedToRoom = ref(false);

roomStore.$subscribe((mutation, state) => {
    if (isGM(roomStore.room, playerStore.player)) {
        commsStore.client.sendMessage({ messageType: MessageTypes.UPDATE_STATE, message: state.room });
    }

})
if (roomStore.room) {
    createRoom();
}

function createRoom() {
    roomStore.room = newRoom(roomStore.roomName, playerStore.player);
    if (commsStore.client) {
        commsStore.client.destroy();
    }
    commsStore.client = new Client(roomStore.roomName);
    commsStore.client.addListener((message) => {
        console.log(message);
        switch (message.messageType) {
            case MessageTypes.SEND_SECRET_WORD:
                if (!roomStore.room) return;
                const currentRoundInfo = getCurrentRoundInfo(roomStore.room)
                if (!currentRoundInfo) return;
                const secretWordSent = message.message as SendSecretWordMessage;
                addResponse(currentRoundInfo, secretWordSent.from, secretWordSent.secretWord);
                break;
            case MessageTypes.JOIN_ROOM:
                if (!roomStore.room) return;
                const player = message.message as Player;
                join(roomStore.room, player);
                console.log(roomStore.room);
                break;
            case MessageTypes.UPDATE_STATE:
                if (roomStore.room && roomStore.room.currentGM && roomStore.room.currentGM.name === playerStore.player.name) {
                    return;
                }
                const room = message.message as Room;
                roomStore.$patch({ room });
        }
    });
}

function joinRoom() {
    if (commsStore.client) {
        commsStore.client.destroy();
    }
    commsStore.client = new Client(playerStore.player.name);
    commsStore.client.addListener((message) => {
        switch (message.messageType) {
            case MessageTypes.UPDATE_STATE:
                const room = message.message as Room;
                roomStore.$patch({ room });
        }
    });
    console.log("tests");
    commsStore.client.connect(roomStore.roomName).then(() => {
        connectedToRoom.value = true
        console.log("test");
        commsStore.client.sendMessage({ messageType: MessageTypes.JOIN_ROOM, message: playerStore.player });
    });

}
function getRoundInfo() {
    return roomStore.room ? getCurrentRoundInfo(roomStore.room) : undefined;
}
</script>


<template>
    <h2>Room</h2>
    <input v-model="roomStore.roomName" />
    <span v-if="roomStore.room">
        ✅
    </span>
    <span v-else>
        ❌
    </span>
    <br />
    <button @click="createRoom">Create room </button>
    <button @click="joinRoom">Join room </button>
    <br />
    Players
    <ul v-if="roomStore.room">
        <li v-for="player in roomStore.room.players">
            Player: {{ player.name }}
        </li>
    </ul>
    <br />
    <ul v-if="getRoundInfo()">
        Round info
        <br />
        <li v-for="response in getRoundInfo()?.responses">
            Player: {{ response.owner.name }}
            <br />
            Message: {{ response.message }}
        </li>
    </ul>
    {{ playerStore.player }}
    <div v-if="connectedToRoom">
        Connected to: {{ roomStore.roomName }}
    </div>
</template>
  
<script setup lang="ts">
import { MessageTypes, Client } from '@/comms';
import { usePlayerStore } from '@/stores/player';
import { useRoomStore } from '@/stores/room';
import { useCommsStore } from '@/stores/comms';
import { ref } from 'vue';
import type { Player, Room } from '@/arbol-blanco';
import { getCurrentRoundInfo, join, newRoom, findPlayer, remove } from '@/arbol-blanco';
import type { DataConnection } from 'peerjs';

const roomStore = useRoomStore();
const playerStore = usePlayerStore();
const commsStore = useCommsStore();
let connectedToRoom = ref(false);


function createRoom() {
    roomStore.room = newRoom(roomStore.roomName, playerStore.player);
    commsStore.isServer = true;
    if (commsStore.client) {
        commsStore.client.destroy();
    }
    commsStore.client = new Client(roomStore.roomName);
    commsStore.client.addListener((message) => {
        console.log(message);
        switch (message.messageType) {
            case MessageTypes.JOIN_ROOM: {
                if (!roomStore.room) return;
                const player = message.message as Player;
                join(roomStore.room, player);
                console.log("aaaa",roomStore.room);
                break;
            }
            case MessageTypes.UPDATE_STATE: {
                const room = message.message as Room;
                roomStore.$patch({ room });
                break;
            }
            case MessageTypes.LEAVE_ROOM: {
                const connection = message.message as DataConnection;
                const playerName = commsStore.client!.getPeerName(connection.peer);
                console.log("Player left" , playerName)
                const player = findPlayer(roomStore.room, playerName);
                if (player) {
                    remove(roomStore.room, player);
                }
            }
        }
    });
}

function joinRoom() {
    if (commsStore.client) {
        console.log("destroying client")
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
        commsStore.client!.sendMessage({ messageType: MessageTypes.JOIN_ROOM, message: playerStore.player });
    },
    error => console.log(error));

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
</template>
  
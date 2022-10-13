<script setup lang="ts">
import { MessageTypes, Client } from '@/comms';
import { usePlayerStore } from '@/stores/player';
import { useRoomStore } from '@/stores/room';
import { useCommsStore } from '@/stores/comms';
import { ref } from 'vue';
import type { Player, Room } from '@/arbol-blanco';
import { join, newRoom, findPlayer, remove } from '@/arbol-blanco';
import type { DataConnection } from 'peerjs';
import InputComponent from './InputComponent.vue';
import ButtonComponent from './ButtonComponent.vue';
import type { ChangeArbolBlanco, ChangeGM, SendSecretWordMessage } from '@/comms/messages';
const roomStore = useRoomStore();
const playerStore = usePlayerStore();
const commsStore = useCommsStore();
let connectedToRoom = ref(false);
let loading = ref(false);


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
                commsStore.client!.sendMessage({messageType: MessageTypes.UPDATE_STATE, message: roomStore.room});
                break;
            }
            case MessageTypes.LEAVE_ROOM: {
                const connection = message.message as DataConnection;
                const playerName = commsStore.client!.getPeerName(connection.peer);
                console.log("Player left" , playerName)
                const player = findPlayer(roomStore.room, playerName!);
                if (player) {
                    remove(roomStore.room, player);
                }
                commsStore.client!.sendMessage({messageType: MessageTypes.UPDATE_STATE, message: roomStore.room});
                break;
            }
            case MessageTypes.CHANGE_GM: {
                const newGmMessage = message.message as ChangeGM;
                roomStore.changeGM(newGmMessage.newGM);
                break;
            }
            case MessageTypes.CHANGE_ARBOL_BLANCO: {
                const changeArbolBlancoMessage = message.message as ChangeArbolBlanco;
                roomStore.changeArbolBlanco(changeArbolBlancoMessage.arbolBlanco);
                break;
            }
            case MessageTypes.NEW_ROUND: {
                roomStore.newRound();
                break;
            }
            case MessageTypes.SEND_SECRET_WORD: {
                roomStore.changeSecretWord((message.message as SendSecretWordMessage).secretWord);
                break;
            }
        }
    });
}

function joinRoom() {
    loading.value = true;
    if (commsStore.client) {
        console.log("destroying client");
        commsStore.client.destroy();
    }
    commsStore.client = new Client(roomStore.roomName, playerStore.player.name);
    commsStore.client.addListener((message) => {
        switch (message.messageType) {
            case MessageTypes.UPDATE_STATE:
                const room = message.message as Room;
                roomStore.$patch({ room });
                break;
        }
    });
    commsStore.client.connect(roomStore.roomName).then(() => {
        connectedToRoom.value = true;
        
        commsStore.client!.sendMessage({ messageType: MessageTypes.JOIN_ROOM, message: playerStore.player });
    },
    error => console.log(error),
    ).then(() => {loading.value = false});

}
</script>


<template>
    <h2>Room</h2>
    <div id="room-info">
        <input-component v-model="roomStore.roomName" />
        <div class="buttons">
            <button-component :loading="loading"  @click="createRoom" label="Create Room" img="createRoom"/>
            <button-component :loading="loading" @click="joinRoom" label="Join room" img="joinRoom"/>
        </div>
    </div>
</template>
  <style scoped>
    * {
        text-align: center;
    }
    #room-info {
        display: flex;
        flex-direction: column;
    }
    .buttons {
        display: flex;
        justify-content: space-between;
    }
    .buttons > * {
        margin: 3px;
    }
  </style>
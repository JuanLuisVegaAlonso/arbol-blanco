<script setup lang="ts">
import { MessageTypes , PeerClient,type PeerError, PeerErrorType, type JoinRoom } from '@/comms';
import { usePlayerStore } from '@/stores/player';
import { useRoomStore } from '@/stores/room';
import { useCommsStore } from '@/stores/comms';
import { ref, watchEffect } from 'vue';
import type { Player, Room } from '@/arbol-blanco';
import { join, newRoom, findPlayer, remove } from '@/arbol-blanco';
import  type {DataConnection}  from 'peerjs';
import InputComponent from './generic/InputComponent.vue';
import ButtonComponent from './generic/ButtonComponent.vue';
import ErrorComponent from './generic/ErrorComponent.vue';
import type { ChangeArbolBlanco, ChangeGM, SendSecretWordMessage } from '@/comms/messages';
import { evalue, required, validPeerId } from '@/validation';
import { joinRoomFeature } from '@/features/joinRoom';
const roomStore = useRoomStore();
const playerStore = usePlayerStore();
const commsStore = useCommsStore();
playerStore.nameAlreadyTaken = false;
let connectedToRoom = ref(false);
let loading = ref(false);


function createRoom() {
    roomStore.room = newRoom(roomStore.roomName, playerStore.player);
    commsStore.isServer = true;
    if (commsStore.client) {
        commsStore.client.destroy();
    }
    commsStore.client = new PeerClient(roomStore.roomName);
    commsStore.client.addListener((message) => {
        console.log(message);
        switch (message.messageType) {
            case MessageTypes.JOIN_ROOM: {
                if (!roomStore.room) return;
                const joinRoom = message.message as JoinRoom;
                console.log("pending,remove", commsStore.pendingRemove);
                if (findPlayer(roomStore.room, joinRoom.player.name)) {
                    commsStore.pendingRemove.push(joinRoom);
                    commsStore.client!.sendMessage({messageType: MessageTypes.REJECTED, message: undefined});
                } else {
                    join(roomStore.room, joinRoom.player);
                    commsStore.client!.sendMessage({messageType: MessageTypes.UPDATE_STATE, message: roomStore.room});
                }
                break;
            }
            case MessageTypes.LEAVE_ROOM: {
                const connection = message.message as DataConnection;
                const playerName = commsStore.client!.getPeerName(connection.peer);
                console.log("Player left" , playerName)
                const playerNotNeededToBeRemoved = commsStore.pendingRemove.findIndex(pl => pl.player.name === playerName);
                if (playerNotNeededToBeRemoved > -1) {
                    commsStore.pendingRemove.splice(playerNotNeededToBeRemoved, 1);
                } else {
                    const player = findPlayer(roomStore.room, playerName!);
                    if (player) {
                        remove(roomStore.room, player);
                    }
                    commsStore.client!.sendMessage({messageType: MessageTypes.UPDATE_STATE, message: roomStore.room});
                }
                
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
const roomExists = ref(true);

function joinRoom() {
    commsStore.isServer = false;
    loading.value = true;
    roomExists.value = true
    playerStore.nameAlreadyTaken = false;
    if (commsStore.client) {
        console.log("destroying client");
        commsStore.client.destroy();
    }
    commsStore.client = new PeerClient(roomStore.roomName, playerStore.player.name);
    commsStore.client.addListener((message) => {
        switch (message.messageType) {
            case MessageTypes.UPDATE_STATE:
                const room = message.message as Room;
                roomStore.$patch({ room });
                break;
            case MessageTypes.REJECTED: 
                commsStore.client!.destroy();
                playerStore.nameAlreadyTaken = true;
        }
    });
    commsStore.client.connect(roomStore.roomName).then(() => {
        connectedToRoom.value = true;
        commsStore.client!.sendMessage({ messageType: MessageTypes.JOIN_ROOM, message: {player: playerStore.player, peerId: commsStore.client!.peerId} });
    },
    error => {
        const peerError = error as PeerError;
        switch (peerError.type) {
            case PeerErrorType.NOT_FOUND: 
            roomExists.value = false;
            break;
            case PeerErrorType.UNKNOWN:
                console.error("Undefined error", peerError.message);
            break;
            default:
            const exhaustiveCheck: never = peerError.type;
            throw new Error(`Unhandled color case: ${exhaustiveCheck}`);
        }
        console.log(error)},
    ).then(() => {loading.value = false});

}
const validName = ref(true);

roomStore.$subscribe((mutation, state) => {
    console.log(state)
    if (state.roomName) {
        validName.value = evalue(state.roomName, required, validPeerId);
    }});

</script>


<template>
    <h2>Room</h2>
    <div id="room-info">
        <input-component :disabled="loading" v-model="roomStore.roomName" />
        <error-component v-if="!validName" message="Invalid name"/>
        <error-component v-if="playerStore.nameAlreadyTaken" message="Name taken"/>
        <div class="buttons">
            <button-component :loading="loading"  @click="createRoom" label="Create Room" img="createRoom"/>
            <button-component :loading="loading" @click="joinRoom" label="Join room" img="joinRoom"/>
        </div>
        <span v-if="!roomExists">Room doesn't exist, create one</span>
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
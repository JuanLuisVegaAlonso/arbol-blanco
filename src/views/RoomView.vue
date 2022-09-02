<script setup lang="ts">
import { useRoomStore } from "@/stores/room";
import { usePlayerStore } from "@/stores/player";
import { ref } from "vue";
import type { Player, Room } from "@/arbol-blanco";
import { Client, MessageTypes } from "@/comms";
import type { Ref } from "vue";
import { newPlayer } from "@/arbol-blanco/player";
import { newRoom } from "@/arbol-blanco/room";

const roomStore = useRoomStore();
const playerStore = usePlayerStore();
const message = ref("");
let roomComms: Client;
let room: Room | void;
let player: Player | void;
let connectedToRoom = false;

let client: Client;
const messages: Ref<string[]> = ref([]);

function createRoom(roomName: string) {
  if (!player) {
    player = newPlayer(playerStore.name);
  }
  room = newRoom(roomName, player);
  if (roomComms) {
    roomComms.destroy();
  }
  roomComms = new Client(roomStore.roomName);
  roomComms.addListener((message) => {
    switch (message.messageType) {
      case MessageTypes.SEND_SECRET_WORD:
        messages.value.push(message.message as string);
    }
  });
}

function connectToRoom() {
  if (client) {
    client.destroy();
  }
  client = new Client(playerStore.name);
  client.connect(roomStore.roomName).then(() => connectedToRoom = true);
  client.addListener((message) => {
    switch (message.messageType) {
      case MessageTypes.SEND_SECRET_WORD:
        messages.value.push(message.message as string);
    }
  });
}

function sendMessage() {
  if (roomComms) {
    roomComms.sendMessage({
      messageType: MessageTypes.SEND_SECRET_WORD,
      message: message.value,
    });
  }
  if (client) {
    client.sendMessage({
      messageType: MessageTypes.SEND_SECRET_WORD,
      message: message.value,
    });
  }
}
</script>
<template>
  <div class="about">
    <label>Username: </label>
    <input type="text" v-model="playerStore.name" />
    <br />
    <label>Own Room: </label>
    <input type="text" v-model="roomStore.roomName" />
    <button @click="createRoom(roomStore.roomName)">Create Room</button>
    <br />
    <label>Remote Room: </label>
    <button @click="connectToRoom()">Connect to room</button>
    <br />
    <label>Message: </label>
    <input type="text" v-model="message" /> {{ message }}
    <button @click="sendMessage()">sendMessage</button>
    <br />
    <div>
      <h2>Conexiones</h2>
      <ul>
        <li v-for="con in roomStore.connections" :key="con">
          {{ con }}
        </li>
      </ul>
    </div>
    <div>
      <h2>Mensajes</h2>
      <ul>
        <li v-for="con in messages" :key="con">
          {{ con }}
        </li>
      </ul>
    </div>
  </div>
</template>
<style></style>

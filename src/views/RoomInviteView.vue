<script setup lang="ts">
import { joinRoomFeature } from '@/features/joinRoom';
import { useCommsStore } from '@/stores/comms';
import { usePlayerStore } from '@/stores/player';
import { useRoomStore } from '@/stores/room';
import { ref, watch, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import CreatePlayer from '../components/CreatePlayer.vue';
import Animatext from '../components/generic/Animatext.vue';

const playerStore = usePlayerStore();
const roomStore = useRoomStore();
const commsStore = useCommsStore();
const route = useRoute();
const router = useRouter();
const roomName = route.params.roomName as string;
const loading = ref(false);
const roomExists = ref(false);
roomStore.roomName = roomName;

if (playerStore.player) {
    const reactive = joinRoomFeature();
    watchEffect(() => {
        loading.value = reactive.loading.value;
        roomExists.value = reactive.roomExists.value;
        if (!loading.value && roomExists.value && commsStore.client) {
            router.push({path: "/"});
        }
    });
}

watch(() => playerStore.player, () => {
    const reactive = joinRoomFeature();
    console.log(roomStore.roomName);
    watchEffect(() => {
        loading.value = reactive.loading.value;
        roomExists.value = reactive.roomExists.value;
        if (!loading.value && roomExists.value && commsStore.client) {
            router.push({path: "/"});
        }
    });
});
</script>
<template>
    <div v-if="loading" id="waiting-wrapper">
        <div id="waiting" >
            <Animatext text="loading...."/>
        </div>
    </div>
    <CreatePlayer v-if="!playerStore.player && !loading"/>
</template>
<style scoped>
#waiting-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1;
}
#waiting {
    display: flex;
}
</style>
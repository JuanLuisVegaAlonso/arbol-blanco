import type { Room } from "@/arbol-blanco";
import { MessageTypes, PeerClient, PeerErrorType, type PeerError } from "@/comms";
import { useCommsStore } from "@/stores/comms";
import { usePlayerStore } from "@/stores/player";
import { useRoomStore } from "@/stores/room";
import { ref } from "vue";

export function joinRoomFeature() {
    const commsStore = useCommsStore();
    const playerStore = usePlayerStore();
    const roomStore = useRoomStore();

    const loading = ref(false);
    const roomExists = ref(false);

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

    return {loading, roomExists};
}
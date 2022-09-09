import type { Player } from "@/arbol-blanco";

export enum MessageTypes {
  JOIN_ROOM = 1,
  SEND_SECRET_WORD = 2,
  UPDATE_STATE = 3,
  LEAVE_ROOM = 4
}

export interface Message<T> {
  messageType: MessageTypes;
  message: T;
}

export interface SendSecretWordMessage {
  from: Player;
  secretWord: string;
}

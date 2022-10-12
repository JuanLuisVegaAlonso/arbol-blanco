import type { Player } from "@/arbol-blanco";

export enum MessageTypes {
  JOIN_ROOM = 1,
  SEND_SECRET_WORD = 2,
  UPDATE_STATE = 3,
  LEAVE_ROOM = 4,
  CHANGE_GM = 5,
  CHANGE_ARBOL_BLANCO = 6,
  NEW_ROUND = 7
}

export interface MessageTest {
  id: number;
}

export interface Message<T> {
  messageType: MessageTypes;
  message: T;
}

export interface SendSecretWordMessage {
  from: Player;
  secretWord: string;
}

export interface ChangeGM {
  newGM: Player;
}
export interface ChangeArbolBlanco {
  arbolBlanco: Player;
}
export interface NewRound {

}

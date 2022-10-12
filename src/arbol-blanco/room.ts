import type { Player } from "./player";
import { newRoundInfo, type RoundInfo } from "./round-info";

export interface Room {
  name: string;
  currentGM: Player | void;
  players: Player[];
  roundsInfo: RoundInfo[];
}

export function newRoom(
  name: string,
  currentGM: Player | void = undefined,
  players: Player[] = [],
  roundsInfo: RoundInfo[] = []
): Room {
  const room: Room = { name, currentGM, players, roundsInfo };
  if (currentGM) {
    join(room, currentGM);
  }
  if (roundsInfo.length == 0 && currentGM) {
    const firstRound = newRoundInfo(currentGM);
    roundsInfo.push(firstRound);
  }
  return room;
}

export function changeGM(self: Room, newGm: Player) {
  self.currentGM = newGm;
  const newRound = newRoundInfo(newGm);
  if (isGM(self, newGm)) return;
  self.roundsInfo.push(newRound);
}

export function newRound(self: Room) {
  self.roundsInfo.push(newRoundInfo(self.currentGM!));
}
export function changeArbolBlanco(self: Room, newArbolBlanco: Player) {
  const currentRoundInfo = getCurrentRoundInfo(self);
  if (!currentRoundInfo) return;
  if (isGM(self, newArbolBlanco)) return;
  currentRoundInfo.arbolBlanco = newArbolBlanco;
}

export function changeSecretWord(self: Room, newSecretWord: string) {
  const currentRoundInfo = getCurrentRoundInfo(self);
  if (!currentRoundInfo) return;
  currentRoundInfo.secretWord = newSecretWord;
}

export function getPlayers(self: Room) {
  return self.players;
}

export function join(self: Room, player: Player) {
  self.players.push(player);
}

export function findPlayer(self: Room, playerStr: string): Player | void {
  const indexOfPlayer = self.players.findIndex(a => a.name === playerStr);
  return indexOfPlayer < 0 ? undefined : self.players[indexOfPlayer];
}

export function remove(self: Room, player: Player) {
  const indexOfPlayer = self.players.findIndex((a) => a.name === player.name);
  console.log("removed: ", indexOfPlayer)
  if (indexOfPlayer < 0) return;
  self.players.splice(indexOfPlayer, 1);
}

export function getCurrentRoundInfo(self: Room): RoundInfo | void {
  return self.roundsInfo.length != 0 ? self.roundsInfo[self.roundsInfo.length - 1] : undefined;
}


export function isGM(self: Room, possibleGM: Player) {
  return self && self.currentGM && self.currentGM.name === possibleGM.name ? true : false
}

export function isArbolBlanco(self: Room, player: Player): boolean {
  const currentRoundInfo = getCurrentRoundInfo(self);
  if (!currentRoundInfo) return false;
  return !!currentRoundInfo.arbolBlanco && currentRoundInfo.arbolBlanco.name === player.name;
}

export function isRoundLive(self: Room): boolean {
  const currentRoundInfo = getCurrentRoundInfo(self);
  if (!currentRoundInfo) return false;
  return !!currentRoundInfo.secretWord;
}
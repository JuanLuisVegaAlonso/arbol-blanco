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
  self.roundsInfo.push(newRound);
}

export function getPlayers(self: Room) {
  return self.players;
}

export function join(self: Room, player: Player) {
  self.players.push(player);
}

export function getCurrentRoundInfo(self: Room): RoundInfo | void {
  return self.roundsInfo.length != 0 ? self.roundsInfo[self.roundsInfo.length - 1] : undefined;
}


export function isGM(self: Room, possibleGM: Player) {
  return self && self.currentGM && self.currentGM.name === possibleGM.name ? true : false
}
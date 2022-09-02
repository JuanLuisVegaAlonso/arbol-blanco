import type { Player } from "./player";
import { newRoundInfo, type RoundInfo } from "./round-info";

export interface Room {
  name: string;
  creator: Player;
  players: Player[];
  roundsInfo: RoundInfo[];
}

export function newRoom(
  name: string,
  creator: Player,
  players: Player[] = [],
  roundsInfo: RoundInfo[] = []
): Room {
  const room: Room = { name, creator, players, roundsInfo };

  if (roundsInfo.length == 0) {
    const firstRound = newRoundInfo(creator);
    roundsInfo.push(firstRound);
  }

  return room;
}

export function getPlayers(self: Room) {
  return self.players;
}

export function join(self: Room, player: Player) {
  self.players = [...self.players, player];
}

export function getCurrentRoundInfo(self: Room): RoundInfo {
  return self.roundsInfo[self.roundsInfo.length - 1];
}

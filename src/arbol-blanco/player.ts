import { getCurrentRoundInfo, type Room } from "./room";
import { addResponse, addVote, getCurrentVotation } from "./round-info";

export interface Player {
  readonly name: string;
  room: Room | void;
}

export function newPlayer(name: string, room: Room | void = undefined): Player {
  return { name, room };
}
export function currentRoundInfo(self: Player) {
  return self.room ? getCurrentRoundInfo(self.room) : undefined;
}

export function respond(self: Player, response: string) {
  const roundInfo = currentRoundInfo(self);
  if (!roundInfo) return;
  addResponse(roundInfo, self, response);
}

export function vote(self: Player, to: Player) {
  const roundInfo = currentRoundInfo(self);
  if (!roundInfo) return;
  const currentVotation = getCurrentVotation(roundInfo);
  if (!currentVotation) return;
  addVote(currentVotation, self, to);
}

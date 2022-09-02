import type { Player } from "./player";

export interface RoundInfo {
  gm: Player;
  arbolBlanco: Player | void;
  secretWord: string | void;
  responses: Response[];
  votations: Votation[];
}

export function newRoundInfo(
  gm: Player,
  arbolBlanco: Player | void = undefined,
  secretWord: string | void = "",
  responses: Response[] = [],
  votations: Votation[] = []
): RoundInfo {
  return { arbolBlanco, gm, responses, secretWord, votations };
}

export function getCurrentVotation(self: RoundInfo) {
  return self.votations.length !== 0
    ? self.votations[self.votations.length - 1]
    : undefined;
}

export function addResponse(self: RoundInfo, player: Player, response: string) {
  self.responses = [...self.responses, { owner: player, message: response }];
}

export interface Response {
  owner: Player;
  message: string;
}

export interface Vote {
  from: Player;
  to: Player;
}

export interface Votation {
  votes: Vote[];
}

export function newVotation(votes: Vote[] = []): Votation {
  return { votes };
}
export function addVote(self: Votation, from: Player, to: Player) {
  self.votes = [...self.votes, { from, to }];
}

export function concludeVotation(self: Votation): Player {
  const votesToPlayers = self.votes.reduce(
    (acc, next) => ({
      ...acc,
      [next.to.name]: acc[next.to.name] + 1 || 1,
    }),
    {} as { [key: string]: number }
  );
  const player = Object.keys(votesToPlayers).sort(
    (a, b) => votesToPlayers[a] - votesToPlayers[b]
  )[0];

  //TODO fix in other moment
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return self.votes.find((vote) => vote.to.name === player)!.to;
}

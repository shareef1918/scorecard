export const TeamsUrls = {
  team: 'teams',
  player: 'players'
};

export const HOST_NAME = `http://localhost:3000/`;

export interface Team {
  id: string;
  name: string;
  location: string;
  createdOn: number;
}

export interface Player {
  id: string;
  name: string;
  team: string;
  createdOn: number;
  isCaptain?: boolean;
}

export const PlayerRole = {
  1: 'Batsman',
  2: 'Bowler',
  3: 'All-Rounder',
  4: 'WK-Batsman',
  5: 'Batting-All Rounder',
  6: 'Bowling-All Rounder'
};

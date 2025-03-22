import { createSelector, createFeatureSelector } from '@ngrx/store';

export const matches = createFeatureSelector<any>('matches');
export const players = createFeatureSelector<any>('players');
export const teams = createFeatureSelector<any>('teams');
export const innings = createFeatureSelector<any>('innings');
export const matchInfo = createFeatureSelector<any>('matchInfo');
export const auctionPlayers = createFeatureSelector<any>('auctionPlayers');
export const auctionTeams = createFeatureSelector<any>('auctionTeams');
export const undoList = createFeatureSelector<any>('undoList');

export const getTeams = createSelector(teams, (teams) => teams);

export const getAuctionTeams = createSelector(auctionTeams, (teams) => teams);
export const getAuctionPlayers = createSelector(auctionPlayers, (players) => players);

export const selectPlayers = createSelector(players, (players) => players);
export const undolist = createSelector(undoList, (undoList) => undoList);

export const getLiveMatch = createSelector(matches, (matches) => matches.find((match) => match));

export const teamPlayers = (id) => createSelector(players, (players) => players.filter((player) => player.team === id));
export const currentInningsSelector = createSelector(innings, (innings) => innings?.find((inning) => inning.currentInnings));
export const inningsSelector = createSelector(innings, (innings) => innings);
export const getMatchSelector = createSelector(matchInfo, (matchInfo) => matchInfo);

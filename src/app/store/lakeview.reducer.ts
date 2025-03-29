import { createReducer, on } from '@ngrx/store';
import {
  AuctionApiInfo,
  AuctionApiPlayers,
  AuctionApiTeams,
  AuctionInfo,
  AuctionPlayers,
  AuctionTeams,
  InningsActions,
  InningsApiActions,
  MatchesActions,
  MatchesApiActions,
  PlayerApiActions,
  PlayersActions,
  TeamsActions,
  TeamsApiActions,
  UndoListActions,
  UndoListApiActions
} from './lakeview.action';
import { state } from '@angular/animations';
import { auctionInfo } from './lakeview.selector';

export const initialTeamsState: any = [];

export const initialPlayersState: any = [];

export const initialMatchesState: any = [];

export const initialMatchInfo: any = [];

export const initialInnings: any = [];

export const initailActionTeams: any = [];
export const initailActionPlayers: any = [];
export const initailUndoList: any = [];
export const initialAuctionState: any = [];

export const auctionTeamsReducer = createReducer(
  initailActionTeams,
  on(AuctionTeams.addAuctionTeam, (state, { team }) => [...state, team]),
  on(AuctionApiTeams.loadTeamsSuccess, (_state, { teams }) => teams),
  on(AuctionApiTeams.updateTeamSuccess, (_state, { team }) =>
    [..._state?.filter((state) => state?.id !== team?.id), ...[team]].sort((a, b) => +a?.id - +b?.id)
  )
);
export const auctionPlayersReducer = createReducer(
  initailActionPlayers,
  on(AuctionPlayers.addAuctionPlayer, (state, { player }) => [...state, player]),
  on(AuctionApiPlayers.loadPlayersSuccess, (_state, { players }) => players),
  on(AuctionApiPlayers.updatePlayerSuccess, (_state, { player }) => [..._state?.filter((state) => state?.id !== player?.id), ...[player]]),
  on(AuctionApiPlayers.deletePlayerSuccess, (_state, { player }) => [..._state?.filter((state) => state?.id !== player?.id)])
);

export const InningsReducer = createReducer(
  initialInnings,
  on(InningsActions.addInnings, (state, { innings }) => [...state, innings]),
  on(InningsActions.updateInnings, (state, { innings }) => [...state.filter((inning) => !inning.currentInnings), innings]),
  on(InningsApiActions.loadInningsSuccess, (_state, { innings }) => innings)
);
/////////////////////////////////////
export const teamsReducer = createReducer(
  initialTeamsState,
  on(TeamsActions.addTeam, (state, { team }) => [...state, team]),
  on(TeamsActions.removeTeam, (state, { teamId }) => state.filter((team) => team.id !== teamId)),
  on(TeamsActions.updateTeam, (state, { teamId, team }) => {
    const index = state.findIndex(state.id === teamId);
    state[index] = team;
    return state;
  }),
  on(TeamsApiActions.loadTeamsSuccess, (_state, { teams }) => teams),
  on(TeamsApiActions.addTeamSuccess, (_state) => _state)
);

export const playersReducer = createReducer(
  initialPlayersState,
  on(PlayersActions.addPlayer, (state, { player }) => [...state, player]),
  on(PlayersActions.removePlayer, (state, { playerId }) => state.filter((player) => player.id !== playerId)),
  on(PlayersActions.updatePlayer, (state, { player }) => {
    const filterData = state.filter((state) => state.id !== player.id);
    return [...filterData, player];
  }),
  on(PlayerApiActions.loadPlayersSuccess, (_state, { players }) => players),
  on(PlayerApiActions.addPlayerSuccess, (_state) => _state)
);

export const matchesReducer = createReducer(
  initialMatchInfo,
  on(MatchesActions.startMatch, (state, { match }) => {
    return [...state, match];
  }),
  on(MatchesActions.removeMatch, (state, { matchId }) => state.filter((player) => player.id !== matchId)),
  on(MatchesActions.updateMatch, (state, { updateMatch }) => {
    return [...state.filter((match) => match.id !== updateMatch.id), updateMatch];
  }),
  on(MatchesActions.addRuns, (state, { runs }) => {
    const matchDetails = state.find((match) => match.isLive);
    const currentInningsData = matchDetails.innings.find((inning) => inning.id === matchDetails.currentInnings);
    const currentInnings = { ...currentInningsData, ...{ score: +currentInningsData.score + +runs } };
    return [
      ...state.filter((match) => match.id !== matchDetails.id),
      ...[
        {
          ...matchDetails,
          ...{ innings: [...matchDetails.innings.filter((inning) => inning.id !== matchDetails.currentInnings), currentInnings] }
        }
      ]
    ];
  }),
  on(MatchesActions.clearMatch, (state) => []),
  on(MatchesApiActions.loadMatchesSuccess, (_state, { matches }) => matches)
);

export const undoListReducer = createReducer(
  initailUndoList,
  on(UndoListActions.updateUndoList, (_state, { innings }) => (innings ? [..._state, innings] : _state)),
  on(UndoListApiActions.loadUndoAPIListSuccess, (_state, { innings }) => innings),
  on(UndoListApiActions.deleteLastBallSuccess, (_state, { ball }) => [..._state?.filter((state) => state?.id !== ball?.id)])
);

export const updateLiveMatchData = (match, innings, updatedData) => {
  return { ...match[innings], ...updatedData };
};

export const auctionReducer = createReducer(
  initialAuctionState,
  on(AuctionInfo.createAuction, (state, { auction }) => [...state, auction]),
  on(AuctionInfo.updateAuction, (state, { auction }) => {
    const index = state.findIndex(state.id === auction.id);
    state[index] = auction;
    return state;
  }),
  on(AuctionInfo.deleteAuction, (state, { auctionId }) => state.filter((auction) => auction.id !== auctionId)),
  on(AuctionApiInfo.loadAuctionInfoSuccess, (_state, { auctionInfo }) => auctionInfo)
);

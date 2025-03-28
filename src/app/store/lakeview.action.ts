import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { auctionInfo } from './lakeview.selector';

///////// New Implementation
// export const MatchInfoActions = createActionGroup({
//   source: 'matchInfo',
//   events: {
//     'Add MatchInfo': props<{ match: any }>(),
//     'Update MatchInfo': props<{ match: any; matchId: string }>(),
//     'Load MatchInfo': emptyProps
//   }
// });
// export const MatchInfoApiActions = createActionGroup({
//   source: 'innings api',
//   events: {
//     'Add MatchInfo Success': props<{ match: any }>(),
//     'Add MatchInfo Failure': props<{ error: string }>(),
//     'Update MatchInfo Success': props<{ match: any }>(),
//     'Update MatchInfo Failure': props<{ error: string }>(),
//     'Load MatchInfo Success': props<{ matches: any[] }>(),
//     'Load MatchInfo Failure': props<{ error: string }>()
//   }
// });

export const AuctionTeams = createActionGroup({
  source: 'auctionTeams',
  events: {
    'Load Teams': emptyProps,
    'Add Auction Team': props<{ team: any }>(),
    'Update Team': props<{ team: any }>()
  }
});

export const AuctionApiTeams = createActionGroup({
  source: 'auctionApiTeams',
  events: {
    'Load Teams Success': props<{ teams: any }>(),
    'Load Teams Failure': props<{ error: string }>(),
    'Add Teams Success': props<{ team: any }>(),
    'Add Teams Failure': props<{ error: string }>(),
    'Update Team Success': props<{ team: any }>(),
    'Update Team Failure': props<{ error: string }>()
  }
});

export const AuctionPlayers = createActionGroup({
  source: 'auctionPlayers',
  events: {
    'Load Players': emptyProps,
    'Add Auction Player': props<{ player: any }>(),
    'Update Player': props<{ player: any }>(),
    'Delete Player': props<{ playerId: any }>()
  }
});

export const AuctionApiPlayers = createActionGroup({
  source: 'auctionApiPlayers',
  events: {
    'Add Auction Player Success': props<{ player: any }>(),
    'Add Aution Player Failure': props<{ error: string }>(),
    'Load Players Success': props<{ players: any }>(),
    'Load Players Failure': props<{ error: string }>(),
    'Update Player Success': props<{ player: any }>(),
    'Update Player Failure': props<{ error: string }>(),
    'Delete Player Success': props<{ player: any }>(),
    'Delete Player Failure': props<{ error: string }>()
  }
});

export const InningsActions = createActionGroup({
  source: 'innings',
  events: {
    'Add Innings': props<{ innings: any }>(),
    'Update Innings': props<{ innings: any }>(),
    'Load Innings': emptyProps
  }
});
export const InningsApiActions = createActionGroup({
  source: 'innings api',
  events: {
    'Add Innings Success': props<{ innings: any }>(),
    'Add Innings Failure': props<{ error: string }>(),
    'Update Innings Success': props<{ innings: any }>(),
    'Update Innings Failure': props<{ error: string }>(),
    'Load Innings Success': props<{ innings: any }>(),
    'Load Innings Failure': props<{ error: string }>()
  }
});

/////////////////////////////////////////////

export const TeamsActions = createActionGroup({
  source: 'teams',
  events: {
    'Add Team': props<{ team: any }>(),
    'Remove Team': props<{ teamId: string }>(),
    'Update Team': props<{ teamId: string; team: any }>(),
    'Load Teams': emptyProps
  }
});

export const TeamsApiActions = createActionGroup({
  source: 'Teams API',
  events: {
    'Load Teams Success': props<{ teams: any[] }>(),
    'Load Teams Failure': props<{ error: string }>(),
    'Add Team Success': props<any>(),
    'Add Team Failure': props<{ error: string }>(),
    'Remove Team Success': props<{ teamId: any }>(),
    'Remove Team Failure': props<{ error: string }>()
  }
});

export const PlayersActions = createActionGroup({
  source: 'players',
  events: {
    'Add Player': props<{ player: any }>(),
    'Remove Player': props<{ playerId: string }>(),
    'Update Player': props<{ playerId: string; player: any }>(),
    'Add Player Success': props<{ player: any }>(),
    'Add Player Failure': props<{ error: string }>(),
    'Load Players': emptyProps
  }
});
export const PlayerApiActions = createActionGroup({
  source: 'Players API',
  events: {
    'Load Players Success': props<{ players: any[] }>(),
    'Load Players Failure': props<{ error: string }>(),
    'Add Player Success': props<{ player }>(),
    'Add Player Failure': props<{ error: string }>(),
    'Remove Player Success': props<{ playerId: any }>(),
    'Remove Player Failure': props<{ error: string }>()
  }
});

export const MatchesActions = createActionGroup({
  source: 'matches',
  events: {
    'Start Match': props<{ match: any }>(),
    'Remove Match': props<{ matchId: string }>(),
    'Update Match': props<{ updateMatch: any }>(),
    'Load Matches': emptyProps,
    'Clear Match': props<{ matchId: string }>(),
    'Add Runs': props<{ runs: any }>()
  }
});
export const MatchesApiActions = createActionGroup({
  source: 'Matches API',
  events: {
    'Load Matches Success': props<{ matches: any[] }>(),
    'Load Matches Failure': props<{ error: string }>(),
    'Update Match Success': props<{ match: any }>(),
    'Update Match Failure': props<{ error: string }>(),
    'Start Match Success': props<{ match: any }>(),
    'Start Match Failure': props<{ error: string }>(),
    'Clear Match Success': props<{ match: any }>(),
    'Clear Match Failure': props<{ error: string }>()
  }
});

export const UndoListActions = createActionGroup({
  source: 'undo',
  events: {
    'Load Undo List': emptyProps,
    'Update Undo List': props<{ innings: any }>(),
    'Delete Undo LastBall': props<{ ballId: any }>()
  }
});
export const UndoListApiActions = createActionGroup({
  source: 'undoApi',
  events: {
    'Load Undo API List Success': props<{ innings: any[] }>(),
    'Load Undo List Failure': props<{ error: string }>(),
    'Update Undo API List Success': props<{ innings: any }>(),
    'Update API Undo List Failure': props<{ error: string }>(),
    'Delete Last Ball Success': props<{ ball: any }>(),
    'Delete Last Ball Failure': props<{ error: string }>()
  }
});

export const AuctionInfo = createActionGroup({
  source: 'auctionInfo',
  events: {
    'Load Auction': emptyProps,
    'Create Auction': props<{ auction: any }>(),
    'Update Auction': props<{ auction: any }>(),
    'Delete Auction': props<{ auctionId: any }>()
  }
});

export const AuctionApiInfo = createActionGroup({
  source: 'auctionInfoApi',
  events: {
    'Load Auction Info Success': props<{ auctionInfo: any[] }>(),
    'Load Auction Info Failure': props<{ error: string }>(),
    'Create Auction Info API Success': props<{ auction: any }>(),
    'Update Auction Info API List Success': props<{ auctionInfo: any }>(),
    'Update Auction Info Undo List Failure': props<{ error: string }>(),
    'Delete Auction Info Success': props<{ auctionId: any }>(),
    'Delete Auction Info Failure': props<{ error: string }>()
  }
});

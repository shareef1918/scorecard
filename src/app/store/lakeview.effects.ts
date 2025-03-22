import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  AuctionApiPlayers,
  AuctionApiTeams,
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
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { TeamsService } from '../demo/elements/teams.service';
import { MatchesService } from '../demo/elements/matches.service';
import { AuctionService } from '../demo/elements/auction.service';

@Injectable()
export class LakeViweEffects {
  loadPlayers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlayersActions.loadPlayers),
      mergeMap(() =>
        this.teamsService.getPlayersList().pipe(
          map((players: any) => PlayerApiActions.loadPlayersSuccess({ players })),
          catchError((error) => of(PlayerApiActions.loadPlayersFailure({ error })))
        )
      )
    )
  );

  loadInnings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InningsActions.loadInnings),
      mergeMap(() =>
        this.matchesService.getInnings().pipe(
          map((innings: any) => InningsApiActions.loadInningsSuccess({ innings })),
          catchError((error) => of(InningsApiActions.loadInningsFailure({ error })))
        )
      )
    )
  );

  loadUndoList$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UndoListActions.loadUndoList),
      mergeMap(() =>
        this.matchesService.loadUndoList().pipe(
          map((innings: any[]) => UndoListApiActions.loadUndoAPIListSuccess({ innings })),
          catchError((error) => of(UndoListApiActions.updateAPIUndoListFailure({ error })))
        )
      )
    )
  );

  loadMatches$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MatchesActions.loadMatches),
      mergeMap(() =>
        this.matchesService.getMatches().pipe(
          map((matches: any) => MatchesApiActions.loadMatchesSuccess({ matches })),
          catchError((error) => of(MatchesApiActions.loadMatchesFailure({ error })))
        )
      )
    )
  );

  updateMatch$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MatchesActions.updateMatch),
      switchMap((match) =>
        this.matchesService.updateMatch(match).pipe(
          map((match) => MatchesApiActions.updateMatchSuccess({ match })),
          catchError((error) => of(MatchesApiActions.updateMatchFailure({ error })))
        )
      )
    )
  );

  updateUndoList$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UndoListActions.updateUndoList),
      switchMap((innings) =>
        this.matchesService.addToUndoList(innings).pipe(
          map((innings) => UndoListApiActions.updateUndoAPIListSuccess({ innings })),
          catchError((error) => of(UndoListApiActions.updateAPIUndoListFailure({ error })))
        )
      )
    )
  );

  updateAuctionPlayer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuctionPlayers.updatePlayer),
      switchMap((player) =>
        this.auctionService.updateAuctionPlayer(player).pipe(
          map((player) => AuctionApiPlayers.updatePlayerSuccess({ player })),
          catchError((error) => of(AuctionApiPlayers.updatePlayerFailure({ error })))
        )
      )
    )
  );

  updateAuctionTeam$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuctionTeams.updateTeam),
      switchMap((team) =>
        this.auctionService.updateAuctionTeam(team).pipe(
          map((team) => AuctionApiTeams.updateTeamSuccess({ team })),
          catchError((error) => of(AuctionApiTeams.updateTeamFailure({ error })))
        )
      )
    )
  );

  deleteAuctionPlayer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuctionPlayers.deletePlayer),
      switchMap((playerId) =>
        this.auctionService.deleteAuctionPlayer(playerId).pipe(
          map((player) => AuctionApiPlayers.deletePlayerSuccess({ player })),
          catchError((error) => of(AuctionApiPlayers.deletePlayerFailure({ error })))
        )
      )
    )
  );

  deleteLastBall$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UndoListActions.deleteUndoLastBall),
      switchMap((ballId) =>
        this.matchesService.deleteLastBall(ballId).pipe(
          map((ball) => UndoListApiActions.deleteLastBallSuccess({ ball })),
          catchError((error) => of(UndoListApiActions.deleteLastBallFailure({ error })))
        )
      )
    )
  );

  updateInnings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InningsActions.updateInnings),
      switchMap((innings) =>
        this.matchesService.updateInnings(innings).pipe(
          map((innings) => InningsApiActions.updateInningsSuccess({ innings })),
          catchError((error) => of(InningsApiActions.updateInningsFailure({ error })))
        )
      )
    )
  );

  loadTeams$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TeamsActions.loadTeams),
      mergeMap(() =>
        this.teamsService.getTeamsList().pipe(
          map((teams: any) => TeamsApiActions.loadTeamsSuccess({ teams })),
          catchError((error) => of(TeamsApiActions.loadTeamsFailure({ error })))
        )
      )
    )
  );

  addTeam$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TeamsActions.addTeam),
      switchMap(({ team }) =>
        this.teamsService.addNewTeam({ team }).pipe(
          map(() => TeamsApiActions.addTeamSuccess()),
          catchError((error) => of(TeamsApiActions.addTeamFailure({ error })))
        )
      )
    )
  );

  addInnings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InningsActions.addInnings),
      switchMap(({ innings }) =>
        this.matchesService.addInnings({ innings }).pipe(
          map(() => InningsApiActions.addInningsSuccess({ innings })),
          catchError((error) => of(InningsApiActions.addInningsFailure({ error })))
        )
      )
    )
  );

  addPlayer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlayersActions.addPlayer),
      switchMap(({ player }) =>
        this.teamsService.addNewPlayer({ player }).pipe(
          map(() => PlayerApiActions.addPlayerSuccess(player)),
          catchError((error) => of(PlayerApiActions.addPlayerFailure({ error })))
        )
      )
    )
  );

  startMatch$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MatchesActions.startMatch),
      switchMap(({ match }) =>
        this.matchesService.startMatch({ match }).pipe(
          map(() => MatchesApiActions.startMatchSuccess(match)),
          catchError((error) => of(MatchesApiActions.startMatchFailure({ error })))
        )
      )
    )
  );

  // addMatch$ = createEffect(() =>
  //   this.actions$.pipe(
  //     ofType(MatchesActions.startMatch),
  //     switchMap(({ match }) =>
  //       this.matchesService.startMatch({ match }).pipe(
  //         map(() => MatchesApiActions.startMatchSuccess(match)),
  //         catchError((error) => of(MatchesApiActions.startMatchFailure({ error })))
  //       )
  //     )
  //   )
  // );

  removeTeam$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TeamsActions.removeTeam),
      switchMap((teamId) =>
        this.teamsService.deleteTeam({ teamId }).pipe(
          map((teamId: any) => TeamsApiActions.removeTeamSuccess({ teamId })),
          catchError((error) => of(TeamsApiActions.removeTeamFailure({ error })))
        )
      )
    )
  );

  removePlayer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlayersActions.removePlayer),
      switchMap(({ playerId }) => {
        return this.teamsService.deletePlayer({ playerId }).pipe(
          map((playerId: any) => PlayerApiActions.removePlayerSuccess({ playerId })),
          catchError((error) => of(PlayerApiActions.removePlayerFailure({ error })))
        );
      })
    )
  );

  loadAuctionPlayers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuctionPlayers.loadPlayers),
      mergeMap(() =>
        this.auctionService.getAuctionPlayers().pipe(
          map((playersData: any) => {
            const players = playersData.sort((a, b) => a.name.localeCompare(b.name));
            return AuctionApiPlayers.loadPlayersSuccess({ players });
          }),
          catchError((error) => of(InningsApiActions.loadInningsFailure({ error })))
        )
      )
    )
  );

  loadAuctionTeams$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuctionTeams.loadTeams),
      mergeMap(() =>
        this.auctionService.getAuctionTeams().pipe(
          map((teams: any) => AuctionApiTeams.loadTeamsSuccess({ teams })),
          catchError((error) => of(AuctionApiTeams.loadTeamsFailure({ error })))
        )
      )
    )
  );

  clearMatch$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MatchesActions.clearMatch),
      switchMap(({ matchId }) =>
        this.matchesService.clearMatch({ matchId }).pipe(
          map(() => MatchesApiActions.clearMatchSuccess({ match: [] })),
          catchError((error) => of(MatchesApiActions.clearMatchFailure({ error })))
        )
      )
    )
  );

  constructor(
    private readonly actions$: Actions,
    private readonly teamsService: TeamsService,
    private readonly matchesService: MatchesService,
    private readonly auctionService: AuctionService
  ) { }
}

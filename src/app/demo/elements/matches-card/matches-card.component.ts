import { Component, ElementRef, ViewChild } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { MatchesService } from '../matches.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { TeamsService } from '../teams.service';
import { Team } from '../teams.interface';
import { UtilsService } from '../utils.service';
import { map, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { getLiveMatch, selectPlayers } from 'src/app/store/lakeview.selector';
import { InningsActions, MatchesActions } from 'src/app/store/lakeview.action';
import * as selectors from 'src/app/store/lakeview.selector';

@Component({
  selector: 'app-matches-card',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './matches-card.component.html',
  styleUrl: './matches-card.component.scss'
})
export class MatchesCardComponent {
  public matchesList = [];
  public startMatchForm: FormGroup;
  public teamsList = [];
  public team1List = [];
  public team2List = [];
  public liveMatch: any;
  public currentPlaying: any;
  public currentInnings: any;
  public playersList: any;
  public players$!: Observable<any>;
  public battersList: any;
  public bowlersList: any;
  public currentPlayersForm: FormGroup;
  public liveMatch$!: Observable<any>;
  public currentInnings$: Observable<any>;

  public battingTeamPlayers = [];
  public bowlingTeamPlayers = [];

  public teamPlayers: any;

  public matchInfo$: Observable<any>;

  @ViewChild('closeStartMatchModal') closeStartMatchModal: ElementRef;
  @ViewChild('closeStartScoringModal') closeStartScoringModal: ElementRef;

  constructor(
    public readonly matches: MatchesService,
    public readonly fb: FormBuilder,
    public readonly teams: TeamsService,
    public readonly utils: UtilsService,
    private readonly store: Store
  ) {
    this.currentPlayersForm = this.fb.group({
      batsman1: new FormControl(null, [Validators.required]),
      batsman2: new FormControl(null, [Validators.required]),
      bowler: new FormControl(null, [Validators.required])
    });

    this.startMatchForm = this.fb.group({
      team1: new FormControl('', [Validators.required]),
      team2: new FormControl('', [Validators.required]),
      venue: new FormControl('', [Validators.required]),
      overs: new FormControl(25, [Validators.required]),
      wickets: new FormControl(11, [Validators.required]),
      toss: new FormControl('', [Validators.required]),
      opted: new FormControl('', [Validators.required])
    });
  }

  ngOnInit() {
    this.store.dispatch(MatchesActions.loadMatches());
    this.store.dispatch(InningsActions.loadInnings());
    this.liveMatch$ = this.store.select(getLiveMatch);
    this.players$ = this.store.select(selectPlayers);
    this.liveMatch$.subscribe((match) => {
      this.currentPlayersForm.reset();
      this.liveMatch = match;
    });
    this.currentInnings$ = this.store.select(selectors.innings).pipe(map((data) => data?.find((inn) => inn.currentInnings)));
    this.currentInnings$.subscribe((innings) => {
      this.currentInnings = innings;
      this.battersList = this.currentInnings?.players?.batters;
      this.bowlersList = this.currentInnings?.players?.bowlers;
    });

    this.players$.subscribe((players) => (this.playersList = players));
    this.teams.getTeamsList().subscribe((teams: Team[]) => {
      this.teamsList = this.team1List = this.team2List = teams;
    });
    this.currentPlayersForm.controls['batsman1'].valueChanges.subscribe((value) => {
      this.currentPlayersForm.controls['batsman2'].setValue(this.battersList?.filter((player) => player.id !== value));
    });
  }

  getNonStrikerList(selectedPlayer: string) {
    return this.battersList?.filter((player) => player.id !== selectedPlayer);
  }

  getOtherBatters(batterId: string) {
    return this.battersList?.filter((player) => player.team !== batterId);
  }

  getLastMatch() {
    const nonLiveMatches = this.matchesList?.sort((a, b) => a.createdOn - b.createdOn).filter((match: any) => !match.isLive);
    if (nonLiveMatches.length) {
      return nonLiveMatches[0];
    }
    return [];
  }

  getTeamName(id: string) {
    return this.teamsList?.find((team: any) => team.id === id);
  }

  getTeamPlayersList(teamId: string) {
    return this.playersList?.filter((player) => player.team === teamId);
  }

  updateTeam1List() {
    const selectedId = this.startMatchForm.controls['team2'].value;
    this.team1List = this.teamsList.filter((team: Team) => team.id !== selectedId);
  }

  updateTeam2List() {
    const selectedId = this.startMatchForm.controls['team1'].value;
    this.team2List = this.teamsList.filter((team: Team) => team.id !== selectedId);
  }

  tossLostTeam() {
    const form = this.startMatchForm.value;
    return form.toss == form.team1 ? form.team2 : form.team1;
  }

  startMatch() {
    const match = this.startMatchForm.value;
    match.id = `MT-${this.utils.generateTimeStamp()}`;
    const batTeamId = +match.opted ? match.toss : this.tossLostTeam();
    const bowlteamId = batTeamId === match.team1 ? match.team2 : match.team1;
    const batTeam = this.getTeamName(batTeamId);
    const bowlTeam = this.getTeamName(bowlteamId);
    match.teams = [
      {
        id: batTeamId,
        name: batTeam?.name,
        logo: batTeam?.logo
      },
      {
        id: bowlteamId,
        name: bowlTeam?.name,
        logo: bowlTeam?.logo
      }
    ];
    this.store.select(selectors.teamPlayers(batTeamId)).subscribe((players) => (this.battingTeamPlayers = players));
    this.store.select(selectors.teamPlayers(batTeamId)).subscribe((players) => (this.bowlingTeamPlayers = players));
    match.currentInnings = batTeamId;
    match.status = 1;
    match.firstInnings = true;
    match.opted = +match.opted;
    match.date = new Date();
    match.type = match?.type || `League Match`;
    this.store.dispatch(MatchesActions.startMatch({ match }));
    this.store.dispatch(InningsActions.addInnings({ innings: this.generateInningsJson(batTeamId, bowlteamId, match.currentInnings) }));
    this.store.dispatch(InningsActions.addInnings({ innings: this.generateInningsJson(bowlteamId, batTeamId, match.currentInnings) }));
    this.closeStartMatchModal.nativeElement.click();
  }

  generateInningsJson(teamId1, teamId2, innings) {
    return {
      id: teamId1,
      onStrike: '',
      currentInnings: teamId1 === innings,
      players: {
        batters: this.getTeamPlayersList(teamId1).map((player) => ({ ...player, ...{ status: 0 } })),
        bowlers: this.getTeamPlayersList(teamId2).map((player) => ({ ...player, ...{ status: 0 } }))
      },
      balls: []
    };
  }

  getPlayerName(id: string) {
    return this.playersList?.find((player) => player.id === id)?.name ?? '';
  }

  startScoring() {
    const playersData = this.currentPlayersForm.value;
    this.currentInnings = {
      ...this.currentInnings,
      ...{
        players: {
          ...this.currentInnings?.players,
          ...{
            batters: [
              ...this.currentInnings?.players?.batters
                ?.filter((player) => player.id === playersData.batsman1 || player.id === playersData.batsman2)
                .map((p) => ({ ...p, ...{ status: 1, down: p.id === playersData.batsman1 ? 1 : 2 } })),
              ...this.currentInnings?.players?.batters?.filter(
                (player) => player.id !== playersData.batsman1 && player.id !== playersData.batsman2
              )
            ]
          }
        }
      },
      ...{
        onStrike: playersData.batsman1
      },
      ...{
        currentBowler: playersData.bowler
      },
      ...{
        currentBatsman: [
          {
            id: playersData.batsman1,
            onStrike: true,
            order: 1,
            down: 1
          },
          {
            id: playersData.batsman2,
            onStrike: false,
            order: 2,
            down: 2
          }
        ]
      },
      ...{
        currentOver: 0,
        currentBall: 0
      }
    };
    this.store.dispatch(InningsActions.updateInnings({ innings: this.currentInnings }));
    this.closeStartScoringModal.nativeElement.click();
  }

  getCurrentInningsDetails() {
    return this.liveMatch?.innings?.find((inning) => inning.id === this.liveMatch.currentInnings);
  }

  ///
  getCurrentPlaying() {
    if (this.liveMatch?.id) {
      const data = this.liveMatch?.innings?.find((inn) => inn.id === this.liveMatch.currentInnings);
      return {
        batsman: data?.currentPlaying,
        bowler: data?.currentBowler
      };
    }
    return null;
  }

  optedTo(value) {
    return +value ? 'Bat First' : 'Bowl First';
  }

  getBattingTeamName(match) {
    return match?.teams?.find((team) => team.id === match.currentInnings)?.name;
  }
  getBowlingTeamName(match) {
    return match?.teams?.find((team) => team.id !== match.currentInnings)?.name;
  }
  changeStriker() {
    const changeBatsman = this.currentInnings?.currentBatsman?.map((player) => ({ ...player, ...{ onStrike: !player?.onStrike } }));
    this.currentInnings = { ...this.currentInnings, ...{ currentBatsman: changeBatsman } };
    this.store.dispatch(InningsActions.updateInnings({ innings: this.currentInnings }));
  }

  clearMatch() {
    this.store.dispatch(MatchesActions.clearMatch({ matchId: this.liveMatch.id }));
    this.startMatchForm.reset();
    this.currentInnings = null;
  }
}

import { Component, ElementRef, ViewChild } from '@angular/core';
import { TeamsService } from '../teams.service';
import { select, Store } from '@ngrx/store';
import { InningsActions, MatchesActions, PlayersActions, UndoListActions } from 'src/app/store/lakeview.action';
import { getLiveMatch, innings, undolist } from 'src/app/store/lakeview.selector';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { map, Observable } from 'rxjs';
import * as moment from 'moment';
import { OutTypes } from './scoreboard.interface';
import { BannerThemeAComponent } from '../banner-theme-a/banner-theme-a.component';
import { ApiService } from '../api.service';
import { UtilsService } from '../utils.service';

@Component({
  selector: 'app-scoreboard',
  standalone: true,
  imports: [SharedModule, BannerThemeAComponent],
  templateUrl: './scoreboard.component.html',
  styleUrl: './scoreboard.component.scss'
})
export class ScoreboardComponent {
  @ViewChild('changeBowlerModal') changeBowlerModal: ElementRef;
  @ViewChild('closeChangeBowlerModal') closeChangeBowlerModal: ElementRef;

  public matchesList: any;
  public liveMatch: any;
  public playersList: any;
  public teamsList: any;
  public currentInnings: any;
  public nextPlayer: FormGroup;
  public fielderForm: FormGroup;
  public runOutPlayerForm: FormGroup;
  public innings$: Observable<any>;
  public undoBall$: Observable<any>;
  public lastBallData: any;
  public showPlayerOut = false;
  public outType = 0;
  public otherInningsId = null;
  public isInningsEnded = false;
  public bothInnings: any;
  public disableEndMatch = true;
  public disableEndInnings = true;
  public disableUndoBtn = true;
  public disableScoreBoard = false;
  public playerExistsError = false;
  public addPlayerForm: FormGroup;

  constructor(
    private readonly teams: TeamsService,
    private readonly store: Store,
    private readonly fb: FormBuilder,
    private readonly api: ApiService,
    private readonly utils: UtilsService
  ) {
    this.addPlayerForm = this.fb.group({
      id: new FormControl(),
      name: new FormControl('', [Validators.required]),
      team: new FormControl(''),
      createdOn: new FormControl()
    });

    this.nextPlayer = this.fb.group({
      id: new FormControl('', [Validators.required])
    });
    this.fielderForm = this.fb.group({
      id: new FormControl('', [Validators.required])
    });
    this.runOutPlayerForm = this.fb.group({
      id: new FormControl('', [Validators.required]),
      runs: new FormControl('0', [Validators.required]),
      isBye: new FormControl(false),
      isNb: new FormControl(false),
      isWide: new FormControl(false)
    });
  }

  getRunsCompleted(){
    return Array.from({ length: 6 }, (_, i) => i);
  }

  ngOnInit() {
    this.store.dispatch(UndoListActions.loadUndoList());
    this.innings$ = this.store.select(innings).pipe(map((data) => data?.find((inn) => inn.currentInnings)));
    this.undoBall$ = this.store.select(undolist);
    this.undoBall$.subscribe((data) => (this.lastBallData = data));
    this.innings$.subscribe((innings) => (this.currentInnings = innings));
    this.store.pipe(select(getLiveMatch)).subscribe((match) => (this.liveMatch = match));
    this.teams.getPlayersList().subscribe((players) => (this.playersList = players));
    this.teams.getTeamsList().subscribe((teams) => (this.teamsList = teams));
    this.store.select(innings).subscribe((inng) => (this.bothInnings = inng));

    setTimeout(() => {
      this.setOtherInningsDetails();
      this.checkForEndInningsOrMatch();
    }, 500);
  }

  addNewPlayer(teamId, num): void {
    const playerData = this.addPlayerForm.value;
    playerData.team = teamId;
    let player: any = this.appendIdAndTime(playerData);

    this.store.dispatch(PlayersActions.loadPlayers());
    player = { ...player, status: 0 };
    const currentInnings = JSON.parse(JSON.stringify(this.bothInnings.find((inn) => inn.id === this.liveMatch.currentInnings)));
    const otherInnings = JSON.parse(JSON.stringify(this.bothInnings.find((inn) => inn.id !== this.liveMatch.currentInnings)));
    if (num === 1) {
      const playerExists = currentInnings?.players?.batters?.find((player) => player?.name.toLowerCase() === playerData.name.toLowerCase());
      if (playerExists) {
        this.playerExistsError = true;
      } else {
        const playerExists = currentInnings?.players?.bowlers?.find(
          (player) => player?.name.toLowerCase() === playerData.name.toLowerCase()
        );
        currentInnings.players.batters = [...currentInnings.players.batters, ...[player]];
        otherInnings.players.bowlers = [...otherInnings.players.bowlers, ...[player]];
      }
      setTimeout(() => {
        this.playerExistsError = false;
      }, 5000);
    } else {
      const playerExists = currentInnings?.players?.bowlers?.find((player) => player?.name.toLowerCase() === playerData.name.toLowerCase());
      if (playerExists) {
        this.playerExistsError = true;
      } else {
        currentInnings.players.bowlers = [...currentInnings.players.bowlers, ...[player]];
        otherInnings.players.batters = [...otherInnings.players.batters, ...[player]];
      }
    }
    this.store.dispatch(PlayersActions.addPlayer({ player }));
    this.store.dispatch(InningsActions.updateInnings({ innings: currentInnings }));
    this.store.dispatch(InningsActions.updateInnings({ innings: otherInnings }));
    this.store.dispatch(InningsActions.loadInnings());
    this.addPlayerForm.reset();
  }

  appendIdAndTime(obj: any) {
    return { ...obj, ...{ id: this.utils.generateId(), createdOn: this.utils.generateTimeStamp() } };
  }

  getBallMessage(runs, currentInnings, onStrikeBatsman, addedRuns: any) {
    if (!isNaN(addedRuns)) {
      return `${this.getPlayerName(currentInnings.currentBowler)} to ${this.getPlayerName(onStrikeBatsman.id)}, ${runs} ${runs > 1 ? 'runs' : 'run'}`;
    } else {
      let text = '';
      if (addedRuns.includes('NB')) {
        text = `No Ball`;
      } else if (addedRuns.includes('WD')) {
        text = `Wide`;
      } else if (addedRuns.includes('BYE')) {
        text = `Bye`;
      }
      return `${this.getPlayerName(currentInnings.currentBowler)} to ${this.getPlayerName(onStrikeBatsman.id)}, ${text} ${runs} ${runs > 1 ? 'runs' : 'run'}`;
    }
  }

  getBalls() {
    return this.currentInnings?.balls.slice(-24).reverse();
  }

  getMessage(ball) {
    if (ball?.isOut) {
      let msg = `${this.getShortMessage(ball.bowler, ball.striker)}`;
      if (ball?.outDetails?.type === 1) {
        return ` ${msg} ${OutTypes[ball?.outDetails?.type]}`;
      } else if (ball?.outDetails?.type === 2) {
        return ` ${msg} Out, Caught by ${this.getPlayerName(ball?.outDetails?.caughtBy)}`;
      } else if (ball?.outDetails?.type === 3) {
        return ` ${msg} Out, stumped by ${this.getPlayerName(ball?.outDetails?.stumpedBy)}`;
      } else if (ball?.outDetails?.type === 4) {
        return ` ${msg} Run Out, fielded by ${this.getPlayerName(ball?.outDetails?.runOutBy1)}`;
      } else if (ball?.outDetails?.type === 5) {
        return ` ${msg} Hit Wicket`;
      }
    } else if (ball?.isWide) {
      return `${this.getShortMessage(ball?.bowler, ball?.striker)} Wide ${ball?.runs?.total} ${ball?.runs?.total > 1 ? ' runs' : ' run'}`;
    } else if (ball?.isBye) {
      return `${this.getShortMessage(ball?.bowler, ball?.striker)} Bye ${ball?.runs?.total} ${ball?.runs?.total > 1 ? ' runs' : ' run'}`;
    } else if (ball?.isNb) {
      return `${this.getShortMessage(ball?.bowler, ball?.striker)} NB ${ball?.runs?.total} ${ball?.runs?.total > 1 ? ' runs' : ' run'}`;
    } else if (!ball?.runs?.extras) {
      return `${this.getShortMessage(ball?.bowler, ball?.striker)} ${ball?.runs?.total} ${ball?.runs?.total > 1 ? ' runs' : ' run'}`;
    }
    return '';
  }

  getShortMessage(bowler, batter) {
    return `${this.getPlayerName(bowler)} to ${this.getPlayerName(batter)},`;
  }

  getTeamName(id: string) {
    return this.teamsList.find((team) => team.id === id)?.name;
  }

  getBowlersList() {
    const currentInnings = this.liveMatch?.innings?.find((team) => team.id === this.liveMatch?.currentInnings);
    if (currentInnings) {
      const bowlingTeamId = this.liveMatch?.innings?.find((team) => team.id !== this.liveMatch.currentInnings)?.id;
      return this.playersList
        ?.filter((player) => player.team === bowlingTeamId && player.id !== currentInnings.currentBowler)
        .sort((a, b) => a.name.localeCompare(b.name));
    }
  }

  startNextOver() {
    this.disableScoreBoard = false;
    const lastBall = this.getLastball();
    if (lastBall?.runs?.total % 2 === 0) {
      this.changeStriker();
    }
    this.currentInnings = {
      ...this.currentInnings,
      ...{
        currentBowler: this.nextPlayer?.value?.id,
        currentOver: this.currentInnings?.currentOver + 1,
        currentBall: 0
      }
    };
    this.store.dispatch(InningsActions.updateInnings({ innings: this.currentInnings }));
  }

  getStrikerId(data) {
    return data.currentPlaying.find((player) => player.onStrike)?.id ?? '';
  }

  getPlayerName(id: string) {
    return this.playersList?.find((player) => player.id === id)?.name ?? '';
  }

  getCurrentInningsDetails() {
    return this.liveMatch?.innings?.find((inning) => inning.id === this.liveMatch.currentInnings);
  }

  setOtherInningsDetails() {
    this.otherInningsId = this.liveMatch?.teams?.find((team) => team.id !== this.liveMatch.currentInnings)?.id;
  }

  endMatch() {
    let outCome: any;
    let targetChased = false;
    if (+this.getInningsScore() > +this.getTargetScore()) {
      const wickets = this.liveMatch?.wickets - this.getInningsWickets();
      outCome = {
        targetChased: true,
        winner: this.currentInnings?.id,
        by: {
          wickets: ` Won by ${wickets} ${wickets === 1 ? 'wicket' : 'wickets'}`
        }
      };
    }
    // else if (+this.getInningsScore() === +this.getTargetScore()) {
    //   outCome = {
    //     matchTied: true,
    //     by: {
    //       wickets: ` Match Tied`
    //     }
    //   };
    // }
    else {
      const runs = this.getTargetScore() - this.getInningsScore();
      if (runs === 0) {
        outCome = {
          matchTied: true,
          by: {
            wickets: ` Match Tied`
          }
        };
      } else {
        outCome = {
          targetChased,
          winner: this.liveMatch?.teams?.find((team) => team.id !== this.currentInnings?.id)?.id,
          by: {
            runs: ` Won by ${runs} ${runs === 1 ? 'run' : 'runs'}`
          }
        };
      }
    }

    this.liveMatch = {
      ...this.liveMatch,
      ...{
        status: 2,
        outCome
      }
    };
    this.disableEndMatch = false;
    this.store.dispatch(MatchesActions.updateMatch({ updateMatch: this.liveMatch }));
  }

  getTargetScore() {
    const firstInningsData = this.bothInnings.find((inn) => inn.id !== this.currentInnings?.id);
    return +firstInningsData?.balls?.reduce((acc, ball) => +acc + +ball?.runs?.total, 0);
  }

  getInningsScore() {
    return +this.currentInnings?.balls?.reduce((acc, ball) => +acc + +ball?.runs?.total, 0);
  }

  addWides(runs, isWide, isNb = false, isBye = false) {
    if (isNb) {
      this.api.boundariesBanner.next('nb');
    }
    this.disableScoreBoard = true;
    const data = {
      id: moment().unix().toString(),
      innings: JSON.parse(JSON.stringify(this.currentInnings))
    };
    this.store.dispatch(UndoListActions.updateUndoList({ innings: data }));
    const striker = this.currentInnings?.currentBatsman?.find((player) => player.onStrike)?.id;
    const nonStriker = this.currentInnings?.currentBatsman?.find((player) => !player.onStrike)?.id;
    const ballsObj = {
      over: this.currentInnings?.currentOver,
      ball: isBye && !isNb ? this.currentInnings?.currentBall + 1 : this.currentInnings?.currentBall,
      striker,
      nonStriker,
      bowler: this.currentInnings?.currentBowler,
      runs: {
        striker: (isNb && isBye) || isWide || isBye ? 0 : +runs - 1,
        extras: true,
        total: runs
      },
      ...(isWide
        ? {
            isWide: true
          }
        : {}),
      ...(isNb
        ? {
            isNb: true
          }
        : {}),
      ...(isBye
        ? {
            isBye: true
          }
        : {})
    };
    //Bye
    if (!isWide && !isNb && runs % 2 !== 0 && this.currentInnings?.currentBall !== 6) {
      this.changeStriker();
    }
    //wide or Nb
    if ((isWide || isNb) && runs % 2 === 0 && this.currentInnings?.currentBall !== 6) {
      this.changeStriker();
    }
    this.currentInnings = {
      ...this.currentInnings,
      ...{ balls: [...this.currentInnings?.balls, ...[ballsObj]] },
      ...{ currentBall: isBye && !isNb ? this.currentInnings?.currentBall + 1 : this.currentInnings?.currentBall ?? 0 }
    };

    if (this.currentInnings?.currentBall !== 6) {
      this.store.dispatch(InningsActions.updateInnings({ innings: this.currentInnings }));
    }
    // if (!this.liveMatch?.firstInnings && this.getInningsScore() > this.getTargetScore()) {
    //   this.disableEndMatch = true;
    // }
    setTimeout(() => {
      this.disableScoreBoard = false;
      this.checkForEndInningsOrMatch();
    }, 2000);
  }
  addRuns(runs: number) {
    if (runs === 4 || runs === 6) {
      this.api.boundariesBanner.next(runs);
    }
    if (this.currentInnings?.currentBall < 6) {
      this.disableScoreBoard = true;
      if (this.currentInnings) {
        const data = {
          id: moment().unix().toString(),
          innings: JSON.parse(JSON.stringify(this.currentInnings))
        };
        this.store.dispatch(UndoListActions.updateUndoList({ innings: data }));
      }
      const striker = this.currentInnings?.currentBatsman?.find((player) => player.onStrike)?.id;
      const nonStriker = this.currentInnings?.currentBatsman?.find((player) => !player.onStrike)?.id;
      const ballsObj = {
        over: this.currentInnings?.currentOver,
        ball: this.currentInnings?.currentBall + 1,
        striker,
        nonStriker,
        bowler: this.currentInnings?.currentBowler,
        runs: {
          striker: runs,
          extras: false,
          total: runs
        }
      };

      this.currentInnings = {
        ...this.currentInnings,
        ...{ balls: [...this.currentInnings?.balls, ...[ballsObj]] },
        ...{ currentBall: this.currentInnings?.currentBall + 1 }
      };
      if (runs % 2 !== 0 && this.currentInnings?.currentBall !== 6) {
        this.changeStriker();
      }
      this.store.dispatch(InningsActions.updateInnings({ innings: this.currentInnings }));
      setTimeout(() => {
        // this.disableScoreBoard = false;
        this.checkForEndInningsOrMatch();
      }, 2000);
    }
  }

  changeStrikerBatsman() {
    const changeBatsman = this.currentInnings?.currentBatsman?.map((player) => ({ ...player, ...{ onStrike: !player?.onStrike } }));
    this.currentInnings = { ...this.currentInnings, ...{ currentBatsman: changeBatsman } };
    this.store.dispatch(InningsActions.updateInnings({ innings: this.currentInnings }));
  }

  checkForEndInningsOrMatch() {
    console.log(Number(this.liveMatch.overs) === Number(this.currentInnings.currentOver) + 1);
    const currentInningsBatters = this.currentInnings?.players.batters;
    const nextBatters = this.getNextBattersList(currentInningsBatters);
    const allOut = this.liveMatch?.wickets === this.getInningsWickets();
    const oversComplete = this.liveMatch?.overs - 1 === this.currentInnings?.currentOver && this.currentInnings?.currentBall === 6;
    if (this.liveMatch?.firstInnings) {
      if (
        allOut ||
        oversComplete ||
        nextBatters?.length < 0 ||
        (Number(this.liveMatch.overs) === Number(this.currentInnings.currentOver) + 1 && this.currentInnings?.currentBall === 6)
      ) {
        this.disableEndInnings = false;
        this.disableScoreBoard = true;
      } else {
        this.disableEndInnings = false;
        this.disableScoreBoard = false;
      }
    } else {
      const target = this.liveMatch.target;
      const currentScore = this.getInningsScore();
      if (
        allOut ||
        oversComplete ||
        nextBatters?.length < 0 ||
        target < currentScore ||
        (Number(this.liveMatch.overs) === Number(this.currentInnings.currentOver) + 1 && this.currentInnings?.currentBall === 6)
      ) {
        this.disableEndMatch = false;
        this.disableScoreBoard = true;
      } else {
        this.disableScoreBoard = false;
      }
    }
    if (this.currentInnings.currentBall === 6) {
      this.disableScoreBoard = true;
    }
  }

  undoLastBall() {
    this.disableScoreBoard = true;
    this.disableEndMatch = true;
    this.disableEndInnings = true;
    const lastBall = this.lastBallData?.length ? JSON.parse(JSON.stringify(this.lastBallData)).pop() : '';
    this.store.dispatch(InningsActions.updateInnings({ innings: lastBall?.innings }));
    this.store.dispatch(UndoListActions.deleteUndoLastBall({ ballId: lastBall?.id }));
    this.fielderForm.reset();
    this.runOutPlayerForm.reset();
    if (!this.liveMatch?.firstInnings) {
      const { outCome, ...matchData } = this.liveMatch;
      this.store.dispatch(MatchesActions.updateMatch({ updateMatch: matchData }));
    }
    // this.store.dispatch(InningsActions.loadInnings());
    setTimeout(() => {
      this.disableScoreBoard = false;
      this.checkForEndInningsOrMatch();
    }, 2000);
  }

  getLastball() {
    return this.currentInnings?.balls.slice(-1)?.[0] ?? {};
  }

  disableUndo() {
    return this.currentInnings?.balls?.length === 0;
  }

  getNextBowlerList(bowlers) {
    return bowlers?.filter((bowler) => bowler?.id !== this.currentInnings?.currentBowler).sort((a, b) => a?.name.localeCompare(b?.name));
  }

  getNextBattersList(batters) {
    const currentPlaying = this.currentInnings?.currentBatsman?.map((batsman) => batsman?.id);
    return batters
      ?.filter((batter) => (!currentPlaying?.includes(batter?.id) && batter?.status === 0) || batter?.status === 6)
      .sort((a, b) => a?.name.localeCompare(b?.name));
  }

  getBattersListToPlay(batters) {
    return batters?.filter((batter) => batter?.status === 0 || batter?.status === 6).sort((a, b) => a?.name.localeCompare(b?.name));
  }

  playerOut(type) {
    /*
    1. Bowled, 2. caught, 3. stumped, 4. runout, 5. hit wicket, 6. retired
    */
    this.showPlayerOut = true;
    this.outType = type;
  }

  changeStriker() {
    const changeBatsman = this.currentInnings?.currentBatsman?.map((player) => ({ ...player, ...{ onStrike: !player?.onStrike } }));
    this.currentInnings = { ...this.currentInnings, ...{ currentBatsman: changeBatsman } };
  }

  sort(list) {
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }

  getOutTitle(type) {
    let msg = '';
    switch (type) {
      case 2:
        msg = 'Caught By';
        break;
      case 3:
        msg = 'Stumped By';
        break;
      case 4:
        msg = 'Run Out By';
        break;
      default:
        msg = '';
    }
    return msg;
  }

  disableBoard() {
    // const currentBall = this.currentInnings?.balls?.find(
    //   (ball) => ball?.over === this.currentInnings?.currentOver && ball?.ball === this.currentInnings?.currentBall
    // );
    // const allOut = this.liveMatch?.wickets === this.getInningsWickets();
    // const oversComplete = this.liveMatch?.overs - 1 === this.currentInnings?.currentOver && this.currentInnings?.currentBall === 6;
    // if (this.liveMatch?.firstInnings) {
    //   if (allOut || oversComplete) {
    //     this.disableEndInnings = false;
    //   }
    // } else if (allOut || oversComplete) {
    //   this.disableEndMatch = false;
    // }
    console.log(this.showPlayerOut, this.disableScoreBoard, !this.disableEndMatch, this.currentInnings.currentBall === 6);
    return this.showPlayerOut || this.disableScoreBoard || !this.disableEndMatch || this.currentInnings.currentBall === 6;
  }

  continueScoring() {
    if (this.currentInnings) {
      const data = {
        id: moment().unix().toString(),
        innings: JSON.parse(JSON.stringify(this.currentInnings))
      };
      this.store.dispatch(UndoListActions.updateUndoList({ innings: data }));
    }
    this.showPlayerOut = false;
    const striker = this.currentInnings?.currentBatsman?.find((player) => player.onStrike)?.id;
    const nonStriker = this.currentInnings?.currentBatsman?.find((player) => !player.onStrike)?.id;
    const changeBatsman = this.currentInnings?.currentBatsman
      ?.map((player) => {
        const isRunout = this.outType === 4 ? player?.id === this.runOutPlayerForm?.value?.id : player?.onStrike;
        if (isRunout) {
          if (this.nextPlayer?.value?.id) {
            return { ...player, ...{ id: this.nextPlayer?.value?.id, down: this.getInningsWickets() + 3 } };
          }
        } else {
          return player;
        }
      })
      .filter((notUndefined) => notUndefined !== undefined);
    this.currentInnings = {
      ...this.currentInnings,
      ...{ currentBatsman: changeBatsman },
      ...{
        players: {
          batters: this.updateBatsmanStatus(this.currentInnings?.players?.batters, striker),
          bowlers: this.currentInnings?.players?.bowlers
        }
      }
    };
    let ballsObj: any = {};
    let isExtra = false;
    let strikerRuns = 0;
    let extraRuns = 0;
    if (this.outType === 4) {
      const { isWide, isNb, isBye, runs } = this.runOutPlayerForm.value;
      if ((isNb && isBye) || isWide) {
        isExtra = true;
        extraRuns = +runs + 1;
      } else if (isNb) {
        isExtra = true;
        extraRuns = 1;
        strikerRuns = runs;
      } else if (isBye) {
        isExtra = true;
        extraRuns = runs;
      } else {
        strikerRuns = runs;
      }
      ballsObj = {
        over: this.currentInnings?.currentOver,
        ball: isExtra ? this.currentInnings?.currentBall : this.currentInnings?.currentBall + 1,
        striker,
        nonStriker,
        bowler: this.currentInnings?.currentBowler,
        runs: {
          striker: +strikerRuns,
          extras: isExtra,
          total: +strikerRuns + +extraRuns
        },
        isOut: true,
        outDetails: {
          playerOut: this.runOutPlayerForm.value?.id,
          type: this.outType,
          runOutBy1: this.fielderForm.value?.id,
          runOutBy2: null
        }
      };
    } else {
      ballsObj = {
        over: this.currentInnings?.currentOver,
        ball: this.outType === 6 ? this.currentInnings?.currentBall : this.currentInnings?.currentBall + 1,
        striker,
        nonStriker,
        bowler: this.currentInnings?.currentBowler,
        runs: {
          striker: 0,
          extras: false,
          total: 0
        },
        ...{
          isOut: this.outType !== 6,
          outDetails: {
            type: this.outType,
            ...(this.outType === 2
              ? {
                  caughtBy: this.fielderForm.value?.id
                }
              : {}),
            ...(this.outType === 3
              ? {
                  stumpedBy: this.fielderForm.value?.id
                }
              : {})
          }
        }
      };
    }
    this.currentInnings = {
      ...this.currentInnings,
      ...{ balls: [...this.currentInnings?.balls, ...[ballsObj]] },
      ...{ currentBall: ballsObj?.runs?.extras ? this.currentInnings?.currentBall : this.currentInnings?.currentBall + 1 }
    };
    this.store.dispatch(InningsActions.updateInnings({ innings: this.currentInnings }));
    this.showPlayerOut = false;
    this.nextPlayer.reset();
    this.fielderForm.reset();
    this.runOutPlayerForm.reset();
    if (this.outType !== 6) {
      this.api.boundariesBanner.next('out');
    }
    this.checkForEndInningsOrMatch();
  }

  updateBatsmanStatus(batters, outPlayerId) {
    let outPlayer: any;
    if (this.outType === 4) {
      outPlayer = batters?.find((batter) => batter?.id === this.runOutPlayerForm?.value?.id);
    } else {
      outPlayer = batters?.find((batter) => batter?.id === outPlayerId);
    }
    let nextPlayer = batters?.find((batter) => batter?.id === this.nextPlayer?.value?.id);
    return [
      ...batters?.filter((batter) => batter?.id !== outPlayer.id && batter?.id !== nextPlayer?.id),
      ...[
        {
          ...outPlayer,
          status: this.outType !== 6 ? 2 : 6
        }
      ],
      ...(nextPlayer?.id
        ? [
            {
              ...nextPlayer,
              status: 1,
              down: this.getInningsWickets() + 3
            }
          ]
        : [])
    ];
  }
  endInnings() {
    if (this.liveMatch?.firstInnings) {
      const nextInningsTeam = this.liveMatch?.teams.find((team) => team.id !== this.currentInnings?.id);
      this.liveMatch = {
        ...this.liveMatch,
        ...{
          firstInnings: false,
          currentInnings: nextInningsTeam?.id,
          target: this.getInningsScore()
        }
      };
    }
    const firstI = this.bothInnings.find((inn) => inn?.id === this.liveMatch?.currentInnings);
    const secondI = this.bothInnings.find((inn) => inn?.id !== this.liveMatch?.currentInnings);
    this.store.dispatch(
      InningsActions.updateInnings({
        innings: { ...firstI, currentInnings: true }
      })
    );
    this.store.dispatch(InningsActions.updateInnings({ innings: { ...secondI, currentInnings: false } }));
    this.store.dispatch(MatchesActions.updateMatch({ updateMatch: this.liveMatch }));
    this.store.dispatch(InningsActions.loadInnings());
    setTimeout(() => {
      this.disableScoreBoard = false;
      this.disableEndInnings = true;
    }, 2000);
  }

  getInningsWickets() {
    return this.currentInnings?.balls?.filter((ball) => ball?.isOut)?.length;
  }

  getCurrentPlayingBatsman() {
    return this.currentInnings?.currentBatsman;
  }

  checkForContinue() {
    const currentInningsBatters = this.currentInnings?.players.batters;
    const nextBatters = this.getNextBattersList(currentInningsBatters);
    if (this.outType === 1 && nextBatters?.length === 0) {
      return false;
    }
    if (this.outType === 2 || this.outType === 3) {
      return (this.nextPlayer.invalid && nextBatters?.length) || this.fielderForm.invalid;
    }
    if (this.outType === 4) {
      return this.nextPlayer.invalid || this.fielderForm.invalid || this.runOutPlayerForm.invalid;
    }
    return this.nextPlayer.invalid;
  }

  disabledScoreBoardButtons() {
    // console.log(this.disableScoreBoard, this.currentInnings.currentBall === 6 || this.showPlayerOut || this.disableScoreBoard);
    // return this.currentInnings.currentBall === 6 || this.showPlayerOut || this.disableScoreBoard;
  }
}

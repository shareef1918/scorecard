import { AfterViewInit, Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { map, Observable } from 'rxjs';
import { InningsActions, MatchesActions, PlayersActions } from 'src/app/store/lakeview.action';
import { getLiveMatch, innings, selectPlayers } from 'src/app/store/lakeview.selector';
import { TeamsService } from '../teams.service';
import moment from 'moment';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { MatchType } from '../scorecard/scorecard.component';

@Component({
  selector: 'app-match-summary',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './match-summary.component.html',
  styleUrl: './match-summary.component.scss'
})
export default class MatchSummaryComponent implements OnInit, AfterViewInit {
  innings$: Observable<any>;
  currentInnings: any;
  match: any;
  public players: any;
  battersList = [];
  topScorer = null;
  public teamsList = [];
  public bothInnings = [];

  constructor(
    private readonly store: Store,
    public readonly teams: TeamsService
  ) {
    this.store.dispatch(PlayersActions.loadPlayers());
    this.store.dispatch(MatchesActions.loadMatches());
    this.store.dispatch(InningsActions.loadInnings());
  }

  ngAfterViewInit(): void {
    // this.getTopBatsmanDetails(true);
  }

  getTeamLogo(team) {
    return team?.logo || 'assets/images/logos/lakeview.png';
  }

  getFirstInningsTeam(teamId) {
    return this.bothInnings?.find((innings) => innings?.id !== teamId)?.id;
  }

  getMatchType(type) {
    return MatchType[type];
  }

  ngOnInit(): void {
    this.innings$ = this.store.select(innings).pipe(map((data) => data?.find((inn) => inn.currentInnings)));
    this.innings$.subscribe((innings) => (this.currentInnings = innings));
    this.store.pipe(select(getLiveMatch)).subscribe((match) => (this.match = match));
    this.store.select(innings).subscribe((inng) => (this.bothInnings = inng));
    this.store.select(selectPlayers).subscribe((players) => (this.players = players));
    this.teams.getTeamsList().subscribe((teams: any) => {
      this.teamsList = teams;
    });
    setTimeout(() => {
      this.generateMatchSummary();
    }, 200);
  }

  generateMatchSummary() {
    // this.getTopBatsmanDetails(true)
  }

  getTeamName(id: string) {
    return this.teamsList?.find((team: any) => team.id === id);
  }

  getScoreDetails(firstInnings) {
    const innings = (this.bothInnings || []).find((inn) => inn.currentInnings === firstInnings);
    return this.getInningsScore(innings) + '-' + this.getInningsWickets(innings);
  }

  getInningsScore(innings) {
    return innings?.balls?.reduce((acc, ball) => +acc + +ball?.runs?.total, 0);
  }

  getInningsWickets(innings) {
    return innings?.balls?.filter((ball) => ball?.isOut)?.length;
  }

  getTopBatsmanDetails(firstInnings) {
    let players = [];
    const innings = (this.bothInnings || []).find((inn) => inn?.currentInnings === firstInnings);
    const batsmen = innings?.balls?.reduce((acc, ball) => {
      if (ball?.striker) {
        if (acc[ball.striker]) {
          acc[ball.striker] = {
            runs: +acc[ball.striker].runs + +ball.runs.striker,
            balls: ball.isWide ? +acc[ball.striker].balls : +acc[ball.striker].balls + 1
          };
        } else {
          acc[ball.striker] = {
            runs: +ball.runs.striker,
            balls: 1
          };
        }
      }
      return acc;
    }, {});
    if (!batsmen) return [];
    const keys = Object.keys(batsmen);
    if (keys.length) {
      const allPlayers = [...innings?.players?.batters, ...this.currentInnings?.players?.bowlers];
      for (var player in batsmen) {
        players.push({
          id: player,
          runs: batsmen[player].runs,
          balls: batsmen[player].balls,
          status: allPlayers.find((batter) => batter?.id === player)?.status
        });
      }
      players?.sort((a, b) => b.runs - a.runs);
      if (keys?.length < 4) {
        for (let i = keys.length; i < 4; i++) {
          players.push({
            id: null,
            runs: null,
            balls: null,
            status: 0
          });
        }
      }
    }
    return players.slice(0, 4);
  }

  getDate(date) {
    if (date) return moment(date).format('DD-MMM-YYYY hh:mm A');
    return null;
  }

  getPlayerName(playerId: string) {
    return this.players.find((player) => player.id === playerId)?.name;
  }

  getOverDetails(firstInnings) {
    const innings = (this.bothInnings || []).find((inn) => inn.currentInnings === firstInnings);
    const currentBall = this.getCurrentBall(innings);
    if (currentBall === 6) {
      return `${+this.getCurrentOver(innings) + 1}.0`;
    }
    return `${this.getCurrentOver(innings)}.${currentBall}`;
  }

  getCurrentOver(innings) {
    return innings?.currentOver || 0;
  }
  getCurrentBall(innings) {
    return innings?.currentBall || 0;
  }

  getTopBowlersDetails(firstInnings) {
    let players = [];
    const innings = (this.bothInnings || []).find((inn) => inn.currentInnings === firstInnings);
    const bowlers = innings?.balls?.reduce((acc, ball) => {
      if (ball?.bowler) {
        if (acc[ball.bowler]) {
          acc[ball.bowler] = {
            runs: +acc[ball.bowler].runs + +ball.runs.total,
            wickets: +acc[ball.bowler].wickets + (ball.isOut ? 1 : 0)
          };
        } else {
          acc[ball.bowler] = {
            runs: +ball.runs.total,
            wickets: ball.isOut ? 1 : 0
          };
        }
      }
      return acc;
    }, {});
    if (!bowlers) return [];
    const keys = Object.keys(bowlers);
    if (keys.length) {
      for (var player in bowlers) {
        players.push({
          id: player,
          runs: bowlers[player].runs,
          wickets: bowlers[player].wickets,
          overs: this.getBowledOversAndBalls(innings, player)
        });
      }
      players?.sort((a, b) => b.wickets - a.wickets);
      players = players.slice(0, 4);
      if (keys?.length < 4) {
        for (let i = keys.length; i < 4; i++) {
          players.push({
            id: null,
            runs: null,
            wickets: null,
            overs: null
          });
        }
      }
    }
    return this.sortBowlersOnWickets(players);
  }

  sortBowlersOnWickets(players) {
    let bowlers = [];
    (players || []).forEach((player) => {
      const ids = bowlers.map((b) => b.id);
      console.log(ids, player.id, ids.includes(player?.id));
      if (!ids.includes(player?.id)) {
        const filter = players?.filter((p) => p.wickets == player?.wickets);
        if (filter?.length > 1) {
          filter.sort((a, b) => a.runs - b.runs);
        }
        bowlers = [...bowlers, ...filter];
      }
    });
    return bowlers;
  }

  getBowledOversAndBalls(innings, bowler) {
    const bowledValidBalls = innings?.balls?.filter((ball) => ball?.bowler === bowler && !ball?.runs?.extras);
    let overs = 0;
    let balls = 0;
    (bowledValidBalls || [])?.forEach((ball) => {
      if (ball?.ball === 6) overs++;
      balls = ball?.ball;
    });
    return `${overs}.${balls === 6 ? 0 : balls}`;
  }

  getCurrentPlayingTeamName() {
    return this.getTeamName(this.match?.currentInnings)?.name;
  }

  getTargetBalls() {
    return +this.match?.overs * 6 - ((+this.currentInnings?.currentOver || 0) * 6 + (+this.currentInnings?.currentBall || 0));
  }

  scoreToWin() {
    return this.match?.target - this.getInningsScore(this.currentInnings) > 0
      ? this.match?.target - this.getInningsScore(this.currentInnings) + 1
      : 0;
  }
}

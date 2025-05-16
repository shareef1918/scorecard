import { players } from './../../../store/lakeview.selector';
import { Component, OnInit, ViewChild } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { map, Observable, of } from 'rxjs';
import { getLiveMatch, innings } from 'src/app/store/lakeview.selector';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { BannerThemeAComponent } from '../banner-theme-a/banner-theme-a.component';
import { InningsActions, MatchesActions, PlayersActions } from 'src/app/store/lakeview.action';
import moment from 'moment';

export const MatchType = {
  1: 'Individual Match',
  2: 'LakeView Premier League Season - 2'
};

@Component({
  selector: 'app-scorecard',

  standalone: true,
  imports: [SharedModule],
  templateUrl: './scorecard.component.html',
  styleUrl: './scorecard.component.scss'
})
export default class ScorecardComponent implements OnInit {
  innings$: Observable<any>;
  currentInnings: any;
  match: any;
  battersList = [];
  topScorer = null;

  constructor(private readonly store: Store) {}

  getTeamLogo(team) {
    return team?.logo || 'assets/images/logos/lakeview.png';
  }

  ngOnInit() {
    this.store.dispatch(InningsActions.loadInnings());
    this.store.dispatch(MatchesActions.loadMatches());
    this.innings$ = this.store.select(innings).pipe(map((data) => data?.find((inn) => inn.currentInnings)));
    this.innings$.subscribe((innings) => (this.currentInnings = innings));
    this.store.pipe(select(getLiveMatch)).subscribe((match) => (this.match = match));
    setTimeout(() => {
      this.generateScorecard();
    }, 100);
  }

  getDateFormat(date) {
    return moment(date).format('DD-MM-YYYY hh:mm A');
  }

  getMatchType(type) {
    return MatchType[type];
  }

  getMatchInfo(info) {
    return info || null;
  }

  generateScorecard() {
    if (this.currentInnings) {
      const batters = [...this.currentInnings?.players?.batters];
      // const sortedBatters = batters.sort((a, b) => Number(a.down || 100) - Number(b.down || 100));
      for (let batter of batters) {
        const batterObj = {
          name: batter.name,
          runs: batter.status === 1 || batter.status === 2 ? this.getScoredRuns(batter?.id) : null,
          balls: batter.status === 1 || batter.status === 2 ? this.getPlayedBall(batter?.id) : null,
          id: batter.id,
          status: batter.status,
          isCaptain: batter?.isCaptain,
          down: batter.down,
          ...(batter.status === 2
            ? {
                out: this.getOutDetails(batter?.id)
              }
            : {})
        };
        this.battersList.push(batterObj);
      }
      this.getTopScorer();
    }
  }

  getOverDetails() {
    const currentBall = this.getCurrentBall();
    if (currentBall === 6) {
      return `${+this.getCurrentOver() + 1}.0`;
    }
    return `${this.getCurrentOver()}.${currentBall}`;
  }

  getCurrentOver() {
    return this.currentInnings?.currentOver || 0;
  }

  getCurrentBall() {
    return this.currentInnings?.currentBall || 0;
  }
  sortedBattersList(batters) {
    return batters.sort((a, b) => Number(a.down || 100) - Number(b.down || 100));
  }

  getTopScorer() {
    this.topScorer = this.battersList.sort((a, b) => b.runs - a.runs)[0];
  }

  getOutDetails(batterId) {
    let outDetails = this.currentInnings?.balls?.find((ball) => ball?.striker === batterId && ball.isOut);
    if (!outDetails) {
      outDetails = this.currentInnings?.balls?.find((ball) => ball?.outDetails?.playerOut === batterId);
    }
    return outDetails;
  }

  getScoredRuns(batterId) {
    return this.currentInnings?.balls?.filter((ball) => ball?.striker === batterId)?.reduce((acc, ball) => +acc + +ball?.runs?.striker, 0);
  }

  getPlayedBall(batterId) {
    return this.currentInnings?.balls?.filter((ball) => ball?.striker === batterId && !ball?.runs?.isExtra)?.length;
  }

  getBowlerNameDetails(batter) {
    if (batter?.status === 2) {
      return `b ${this.currentInnings?.players?.bowlers?.find((bowler) => bowler.id === batter?.out?.bowler)?.name}`;
    }
    return null;
  }

  getFielderDetail(out) {
    if (out?.outDetails?.type === 2) {
      return `c ${this.currentInnings?.players?.bowlers?.find((fielder) => fielder.id === out.outDetails?.caughtBy)?.name}`;
    }
    if (out?.outDetails?.type === 3) {
      return `st ${this.currentInnings?.players?.bowlers?.find((fielder) => fielder.id === out.outDetails?.stumpedBy)?.name}`;
    }
    if (out?.outDetails?.type === 4) {
      return `runout ${this.currentInnings?.players?.bowlers?.find((fielder) => fielder.id === out.outDetails?.runOutBy1)?.name}`;
    }
    return null;
  }

  getBattingTeamDetails() {
    const battingTeam = this.match?.currentInnings;
    console.log(this.match?.teams?.find((team) => team.id === battingTeam));
    return this.match?.teams?.find((team) => team.id === battingTeam);
  }

  getBowlingTeamDetails() {
    const battingTeam = this.match?.currentInnings;
    return this.match?.teams?.find((team) => team.id !== battingTeam);
  }

  getExtraRuns() {
    const extraBalls = this.currentInnings?.balls?.filter((ball) => ball?.runs?.extras);
    return extraBalls.reduce((acc, ball) => acc + ball?.runs?.total - ball?.runs?.striker, 0);
  }

  getInningsScore() {
    return this.currentInnings?.balls?.reduce((acc, ball) => +acc + +ball?.runs?.total, 0);
  }

  getInningsWickets() {
    return this.currentInnings?.balls?.filter((ball) => ball?.isOut)?.length;
  }
  getTopScorerDetails() {
    return this.currentInnings?.players?.batters?.find((batter) => batter.id === this.topScorer?.id);
  }

  getTopperBoundaries() {
    return this.currentInnings.balls?.reduce(
      (acc, ball) => {
        if (ball.runs.striker === 4) {
          acc.fours += 1;
        }
        if (ball.runs.striker === 6) {
          acc.sixes += 1;
        }
        return acc;
      },
      { fours: 0, sixes: 0 }
    );
  }
}

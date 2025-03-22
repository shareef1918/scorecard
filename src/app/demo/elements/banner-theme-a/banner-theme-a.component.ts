import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, ViewChild } from '@angular/core';
import { InningsActions, MatchesActions, PlayersActions } from 'src/app/store/lakeview.action';
import { Store } from '@ngrx/store';
import { selectPlayers, getTeams, getLiveMatch } from 'src/app/store/lakeview.selector';
import { map, Observable } from 'rxjs';
import { Product } from 'src/app/store/product.model';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { innings } from '../../../store/lakeview.selector';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-banner-theme-a',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './banner-theme-a.component.html',
  styleUrl: './banner-theme-a.component.scss'
})
export class BannerThemeAComponent implements AfterViewInit {
  public liveMatchDetails: any;
  public currentInnings: any;
  public currentInnings$: any;
  public teamsList: any;
  liveMatch$!: Observable<any>;
  public players: any;
  public bothInnings: any;
  public overBalls = [];
  public interval: any;
  public hideBanner = false;
  public showBoundariesBanner = false;
  public bannerText = '';
  products$!: Observable<ReadonlyArray<Product>>;
  boundaries$: Observable<any>;

  constructor(
    private readonly store: Store,
    private cdref: ChangeDetectorRef,
    private api: ApiService
  ) {
    this.store.dispatch(InningsActions.loadInnings());
    this.store.dispatch(MatchesActions.loadMatches());
    this.store.dispatch(PlayersActions.loadPlayers());
    this.boundaries$ = this.api.boundariesBanner;
    this.currentInnings$ = this.store.select(innings).pipe(map((data) => data?.find((inn) => inn.currentInnings)));
    this.currentInnings$.subscribe((inn) => (this.currentInnings = inn));
    this.liveMatch$ = this.store.select(getLiveMatch);
    this.liveMatch$.subscribe((match) => (this.liveMatchDetails = match));
    this.store.select(getTeams).subscribe((teams) => (this.teamsList = teams));
    this.store.select(innings).subscribe((inng) => (this.bothInnings = inng));
    this.store.select(selectPlayers).subscribe((players) => (this.players = players));
    this.boundaries$.subscribe((data) => {
      if (data) {
        this.showBoundariesBanner = true;
        this.bannerText = this.getBannerText(data);
        setTimeout(() => {
          this.showBoundariesBanner = false;
        }, 3000);
      }
    });
  }

  getBannerText(data) {
    let text = '';
    switch (data) {
      case 4:
        text = `FOUR 4 FOUR 4 FOUR 4 FOUR 4 FOUR 4 FOUR 4`;
        break;
      case 6:
        text = `SIX 6 SIX 6 SIX 6 SIX 6 SIX 6 SIX 6 SIX 6`;
        break;
      case 'out':
        text = ` WICKET  WICKET WICKET WICKET WICKET`;
        break;
      case 'nb':
        text = ` FREE HIT  FREE HIT FREE HIT FREE HIT`;
        break;
    }
    return text;
  }

  ngAfterViewInit() {
    this.interval = setInterval(() => {
      this.cdref.detectChanges();
    }, 0);
  }
  getPlayingTeamName(battingTeam: boolean) {
    return battingTeam
      ? this.liveMatchDetails?.teams?.find((team) => team.id === this.liveMatchDetails?.currentInnings)?.name
      : this.liveMatchDetails?.teams?.find((team) => team.id !== this.liveMatchDetails?.currentInnings)?.name;
  }

  getTeamName(id: string) {
    return this.teamsList.find((team) => team.id === id)?.name;
  }

  getPlayerName(playerId: string) {
    return this.players.find((player) => player.id === playerId)?.name;
  }

  getBatsmanDetails(innings) {
    return [...innings?.currentBatsman]?.sort((a, b) => a.order - b.order);
  }

  checkForBatsman(innings) {
    return innings?.currentBatsman;
  }

  getCurrentInningsDetails(match) {
    return match?.innings?.find((inning) => inning.id === match.currentInnings);
  }

  getBowlerDetails(innings) {
    return {
      name: this.getPlayerName(innings?.currentBowler),
      id: innings?.currentBowler,
      runs: 0,
      wickets: 0
    };
  }
  runsGiven(id) {
    return this.currentInnings?.balls?.filter((ball) => ball?.bowler === id)?.reduce((acc, ball) => +acc + +ball?.runs?.total, 0);
  }

  wicketsTaken(id) {
    return this.currentInnings?.balls?.filter(
      (ball) => ball?.bowler === id && (ball?.outDetails?.type === 1 || ball?.outDetails?.type === 2 || ball?.outDetails?.type === 3)
    )?.length;
  }

  getExtraRunsData(ballData: any) {
    if (ballData?.isNb && ballData?.isBye) {
      return `N+B(${ballData?.runs?.total - 1})`;
    } else if (ballData.isWide) {
      return ballData?.runs?.total > 1 ? `${ballData?.runs?.total - 1}Wd` : `Wd`;
    } else if (ballData.isNb) {
      return ballData?.runs?.total > 1 ? `${+ballData.runs?.total - 1}N` : `N`;
    } else if (ballData.isBye) {
      return ballData?.runs?.total > 1 ? `${ballData?.runs?.total}B` : `1B`;
    }
    return '';
  }

  currentOverBalls() {
    return this.currentInnings?.balls?.filter((ball) => ball.over === this.currentInnings?.currentOver);
  }

  getInningsScore() {
    return this.currentInnings?.balls?.reduce((acc, ball) => +acc + +ball?.runs?.total, 0);
  }

  getInningsWickets() {
    return this.currentInnings?.balls?.filter((ball) => ball?.isOut)?.length;
  }

  getCurrentOver() {
    return this.currentInnings?.currentOver || 0;
  }
  getCurrentBall() {
    return this.currentInnings?.currentBall || 0;
  }

  getScoredRuns(id) {
    return this.currentInnings?.balls?.filter((ball) => ball?.striker === id)?.reduce((acc, ball) => +acc + +ball?.runs?.striker, 0);
  }

  getFoursAndSixes() {
    const fours = this.currentInnings?.balls?.filter((ball) => ball?.runs?.striker === 4)?.length;
    const sixes = this.currentInnings?.balls?.filter((ball) => ball?.runs?.striker === 6)?.length;
    return {
      fours,
      sixes
    };
  }

  getPlayedBall(id) {
    return this.currentInnings?.balls?.filter((ball) => ball?.striker === id && !ball?.isWide)?.length;
  }

  getRunrate() {
    return ((+this.getInningsScore() / (this.currentInnings?.currentOver * 6 + this.currentInnings?.currentBall)) * 6).toFixed(2);
  }

  getRequiredRunrate() {
    return this.getTargetBalls() === 0 ? 0.0 : ((+this.getTargetScore() / this.getTargetBalls()) * 6).toFixed(2);
  }

  getProjectedScore() {
    return Math.round(this.liveMatchDetails?.overs * +this.getRunrate());
  }

  getBowledOversAndBalls() {
    const bowledValidBalls = this.currentInnings?.balls?.filter(
      (ball) => ball?.bowler === this.currentInnings?.currentBowler && !ball?.runs?.extras
    );
    let overs = 0;
    let balls = 0;
    (bowledValidBalls || [])?.forEach((ball) => {
      if (ball?.ball === 6) overs++;
      balls = ball?.ball;
    });
    return {
      overs,
      balls
    };
  }

  getTargetScore() {
    const firstInningsData = this.bothInnings.find((inn) => inn.id !== this.currentInnings?.id);
    const chaseScore = firstInningsData?.balls?.reduce((acc, ball) => +acc + +ball?.runs?.total, 0);
    const currentInningsScore = this.getInningsScore();
    return chaseScore - currentInningsScore + 1 > 0 ? chaseScore - currentInningsScore + 1 : 0;
  }

  getChaseScore() {
    const firstInningsData = this.bothInnings.find((inn) => inn.id !== this.currentInnings?.id);
    return firstInningsData?.balls?.reduce((acc, ball) => +acc + +ball?.runs?.total, 0) + 1;
  }

  getTargetBalls() {
    return +this.liveMatchDetails?.overs * 6 - ((+this.currentInnings?.currentOver || 0) * 6 + (+this.currentInnings?.currentBall || 0));
  }

  getLogo(first) {
    if (first) {
      const team = this.liveMatchDetails?.teams.find((team) => team.id === this.currentInnings?.id);
      return team?.logo ? team?.logo : 'assets/images/logos/lakeview.png';
    } else {
      const team = this.liveMatchDetails?.teams.find((inn) => inn.id !== this.currentInnings?.id);
      return team?.logo ? team?.logo : 'assets/images/logos/lakeview.png';
    }
  }

  getLastOutBatsman() {
    const outs = this.currentInnings?.balls?.filter((ball) => ball?.isOut).reverse();
    return outs?.length ? outs[0] : {};
  }

  getExtraRuns() {
    const extraBalls = this.currentInnings?.balls?.filter((ball) => ball?.runs?.extras);
    return extraBalls.reduce((acc, ball) => acc + ball?.runs?.total - ball?.runs?.striker, 0);
  }

  getShortName(name) {
    return name.split(' ')[0];
  }

  getOverDetails() {
    const currentBall = this.getCurrentBall();
    if (currentBall === 6) {
      return `${+this.getCurrentOver() + 1}.0`;
    }
    return `${this.getCurrentOver()}.${currentBall}`;
  }

  getMatchDetails() {
    return this.liveMatchDetails?.type;
  }

  getMatchType() {
    return this.liveMatchDetails?.ofType;
  }
}

import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { PlayersActions, MatchesActions, InningsActions } from 'src/app/store/lakeview.action';
import { TeamsService } from '../teams.service';
import { map, Observable } from 'rxjs';
import { MatchType } from '../scorecard/scorecard.component';
import { innings, getLiveMatch, selectPlayers } from 'src/app/store/lakeview.selector';
import { JsonPipe } from '@angular/common';
import { BarController, BarElement, CategoryScale, Decimation, Filler, Legend, Title, Tooltip } from 'chart.js';
import Chart from 'chart.js/auto';
import { style } from '@angular/animations';

@Component({
  selector: 'app-bowler-summary',
  standalone: true,
  imports: [JsonPipe],
  templateUrl: './bowler-summary.component.html',
  styleUrl: './bowler-summary.component.scss'
})
export default class BowlerSummaryComponent implements AfterViewInit {
  private chart: Chart;
  innings$: Observable<any>;
  currentInnings: any;
  match: any;
  public players: any;
  battersList = [];
  topScorer = null;
  public teamsList = [];
  public bothInnings = [];
  @ViewChild('chart') chartRef: ElementRef;
  public topBowlerDetails: any;

  constructor(
    private readonly store: Store,
    public readonly teams: TeamsService
  ) {
    Chart.register(BarElement, BarController, CategoryScale, Decimation, Filler, Legend, Title, Tooltip);
    this.store.dispatch(PlayersActions.loadPlayers());
    this.store.dispatch(MatchesActions.loadMatches());
    this.store.dispatch(InningsActions.loadInnings());
    this.teams.getTeamsList().subscribe((teams: any) => {
      this.teamsList = teams;
    });
  }
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.createChart();
    }, 1000);
  }

  createChart() {
    const bowDetails = this.generateTopBowlerStats(this.topBowlerDetails?.id);
    const wickets = Object.values(bowDetails).map((b: any) => b.wickets);
    const barImagesPlugin = {
      id: 'barImages',
      afterDatasetsDraw(chart, args, options) {
        const {
          ctx,
          chartArea: { top, bottom, left, right, width, height },
          scales: { x, y }
        } = chart;

        ctx.font = options.textFont;
        ctx.fillStyle = options.textColor;
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';

        chart.data.datasets.forEach((dataset, datasetIndex) => {
          const meta = chart.getDatasetMeta(datasetIndex);

          meta.data.forEach((bar, index) => {
            const data = dataset.data[index];
            const xPos = bar.x - 20;
            const yPos = bar.y + 7; // Position above the bar

            ctx.fillText(data, xPos, yPos);
          });
        });
      },
      afterDraw: (chart) => {
        const ctx = chart.ctx;
        const meta = chart.getDatasetMeta(0);
        // console.log(meta);
        // Load your image (replace with your actual image source)
        const img = new Image();
        img.src = '../assets/images/ball-icon.png'; // Your image URL here
        img.width = 20;
        img.height = 20;

        // Only draw if image is loaded
        if (img.complete) {
          meta.data.forEach((bar: any) => {
            if (wickets[bar.$context.dataIndex]) {
              for (let i = 0; i < wickets[bar.$context.dataIndex]; i++) {
                // For horizontal bars, we need to adjust positioning
                const x = bar.x + 10 + i * 15 - img.width / 2;
                const y = bar.y - img.height / 2;
                ctx.drawImage(img, x, y, img.width, img.height);
              }
            }
          });
        } else {
          img.onload = () => {
            chart.update(); // Redraw chart when image loads
          };
        }
      }
    };
    if (this?.chartRef?.nativeElement) {
      const data = Object.values(bowDetails).map((b: any) => b.runs);
      const labels = Array.from(Array(Object.keys(bowDetails)?.length).keys());
      this.chart = new Chart(this?.chartRef?.nativeElement, {
        plugins: [barImagesPlugin],
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Runs Given',
              data,
              backgroundColor: ['#800080'],
              borderWidth: 2
            }
          ]
        },
        options: {
          elements: {
            point: {
              pointStyle: 'line'
            }
          },
          indexAxis: 'y',
          plugins: {
            legend: {
              display: false
            }
          },
          maintainAspectRatio: false,
          scales: {
            y: {
              grid: {
                display: false
              },
              beginAtZero: true,
              ticks: {
                callback: function (value: number, index, ticks) {
                  return 'Over ' + ++value;
                },
                font: {
                  size: 20,
                  weight: 'bold'
                },
                color: '#000'
              }
            },
            x: {
              max: Math.max(...data) % 2 === 0 ? Math.max(...data) + 2 : Math.max(...data) + 1,
              ticks: {
                font: {
                  size: 20,
                  weight: 'bold'
                },
                color: '#000'
              }
            }
          }
        }
      });
    }
  }

  generateTopBowlerStats(id) {
    const balls = this.currentInnings?.balls?.filter((p) => p.bowler === id);
    let bowlerDetails: any = {};
    (balls || []).forEach((b) => {
      if (bowlerDetails[b.over]) {
        (bowlerDetails[b.over]['wickets'] = b.isOut ? bowlerDetails[b.over]['wickets'] + 1 : bowlerDetails[b.over]['wickets']),
          (bowlerDetails[b.over]['runs'] = (bowlerDetails[b.over]['runs'] || 0) + b.runs.total);
      } else {
        bowlerDetails[b.over] = {
          wickets: b.isOut ? 1 : 0,
          runs: b.runs.total
        };
      }
    });
    return bowlerDetails;
  }

  getTeamLogo(t) {
    return this.teamsList.find((team) => team.id === t)?.logo || 'assets/images/logos/lakeview.png';
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
  }

  getTopBowler() {
    const bowlers = [this.getTopBowlersDetails(true)[0], this.getTopBowlersDetails(false)[0]];
    const player = (bowlers || [])?.sort((a, b) => b.wickets - a.wickets)?.[0];
    return {
      photo: this.players?.find((p) => p?.id === player.id)?.photo,
      details: `${player?.runs}-${player.wickets}(${player.overs})`
    };
  }

  getPlayerDetails(id) {
    return this.players?.find((p) => p.id === id);
  }

  getInningsScore(innings) {
    return innings?.balls?.reduce((acc, ball) => +acc + +ball?.runs?.total, 0);
  }

  getPlayerName(playerId: string) {
    return this.players.find((player) => player.id === playerId)?.name;
  }

  getInningsWickets(innings) {
    return innings?.balls?.filter((ball) => ball?.isOut)?.length;
  }

  getTopBowlersDetails(firstInnings) {
    let players = [];
    const innings = (this.bothInnings || []).find((inn) => inn.currentInnings === firstInnings);
    const bowlers = innings?.balls?.reduce((acc, ball) => {
      if (ball?.bowler) {
        if (acc[ball.bowler]) {
          acc[ball.bowler] = {
            runs: +acc[ball.bowler].runs + +ball.runs.total,
            wickets: +acc[ball.bowler].wickets + (ball.isOut ? 1 : 0),
            dots: ball.runs?.striker === 0 ? +acc[ball.bowler].wickets + 1 : +acc[ball.bowler].wickets
          };
        } else {
          acc[ball.bowler] = {
            runs: +ball.runs.total,
            wickets: ball.isOut ? 1 : 0,
            dots: 0,
            economy: 0
          };
        }
      }
      return acc;
    }, {});
    if (!bowlers) return [];
    const keys = Object.keys(bowlers);
    if (keys.length) {
      for (let player in bowlers) {
        const overs = +this.getBowledOversAndBalls(innings, player);
        players.push({
          id: player,
          runs: bowlers[player].runs,
          wickets: bowlers[player].wickets,
          overs,
          dots: bowlers[player].dots,
          economy: (bowlers[player].runs / overs).toFixed(2)
        });
      }
      // console.log('Eco:', players[0]);
      players?.sort((a, b) => b.wickets - a.wickets);
      // players = players.slice(0, 4);
      // console.log(keys.length);
      if (keys?.length < 6) {
        for (let i = keys.length; i < 7; i++) {
          players.push({
            id: null,
            runs: null,
            wickets: null,
            overs: null,
            dots: 0,
            economy: 0
          });
        }
      }
    }
    const bowlerDetails = this.sortBowlersOnWickets(players);
    this.topBowlerDetails = this.sortBowlersOnWickets(players)?.[0] ?? null;
    return bowlerDetails;
  }

  sortBowlersOnWickets(players) {
    let bowlers = [];
    (players || []).forEach((player) => {
      const ids = bowlers.map((b) => b.id);
      // console.log(ids, player.id, ids.includes(player?.id));
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

  getOverDetails(firstInnings) {
    const innings = (this.bothInnings || []).find((inn) => inn.currentInnings === firstInnings);
    const currentBall = this.getCurrentBall(innings);
    if (currentBall === 6) {
      return `${+this.getCurrentOver(innings) + 1}.0`;
    }
    return `${this.getCurrentOver(innings)}.${currentBall}`;
  }

  getCurrentBall(innings) {
    return innings?.currentBall || 0;
  }

  getExtraRuns() {
    const extraBalls = this.currentInnings?.balls?.filter((ball) => ball?.runs?.extras);
    return extraBalls?.reduce((acc, ball) => acc + ball?.runs?.total - ball?.runs?.striker, 0);
  }

  getScoreDetails(firstInnings) {
    const innings = (this.bothInnings || []).find((inn) => inn.currentInnings === firstInnings);
    return this.getInningsScore(innings) + '-' + this.getInningsWickets(innings);
  }

  getCurrentOver(innings) {
    return innings?.currentOver || 0;
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

  getTeamName(id: string) {
    return this.teamsList?.find((team: any) => team.id === id);
  }

  getTargetBalls() {
    return +this.match?.overs * 6 - ((+this.currentInnings?.currentOver || 0) * 6 + (+this.currentInnings?.currentBall || 0));
  }

  getFallOfWicktes() {
    let fowDetails = [];
    const wickets = this.currentInnings?.balls?.filter((ball) => ball?.isOut);
    (wickets ?? []).forEach((wic, i) => {
      const index = this.currentInnings?.balls?.findIndex((ball) => ball.over === wic.over && ball.ball === wic.ball);
      // console.log('Index:', index, i);
      const fow = {
        wicket: i + 1,
        runs: this.getRuns(index)
      };
      fowDetails.push(fow);
    });
    return fowDetails;
  }

  getRuns(index) {
    const balls = this.currentInnings?.balls?.slice(0, index);
    return (balls ?? [])?.reduce((acc, ball) => +acc + +ball?.runs?.total, 0);
  }

  getExt(num) {
    switch (num) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      case 4:
      case 5:
      case 6:
      case 7:
      case 8:
      case 9:
      case 10:
      case 11:
      case 12:
        return 'th';
      default:
        return null;
    }
  }
}

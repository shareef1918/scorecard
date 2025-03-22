import { Component } from '@angular/core';
import { CommunicationService } from '../communication.service';

@Component({
  selector: 'app-lakeviewbanner',
  standalone: true,
  imports: [],
  templateUrl: './lakeviewbanner.component.html',
  styleUrl: './lakeviewbanner.component.scss'
})
export default class LakeviewbannerComponent {
  public scoreDetails = {
    runs: 0,
    wickets: 0,
    overs: 0,
    balls: 0,
    runRate: 0,
    totalOvers: 0
  };
  public currentPlayers: any;
  public currentBowler: any;
  public playingTeams: any;
  public lastBalls = Array(8).fill('');

  constructor(private readonly comm: CommunicationService) {}

  ngOnInit() {
    this.getScoreData();
    this.comm.scoreDetails.subscribe((data) => {
      this.scoreDetails.runs = +data.runs;
      this.scoreDetails.wickets = +data.wickets;
      this.scoreDetails.overs = +data.overs;
      this.scoreDetails.balls = +data.balls;
      this.scoreDetails.runRate = +data.runRate.toFixed(2);
    });

    this.comm.ballDetails.subscribe((balls: any) => {
      if (balls?.length) {
        for (let i = 0; i < balls?.length; i++) {
          this.lastBalls[i] = balls[i];
        }
      } else {
        this.lastBalls = Array(8).fill('');
      }
    });

    this.comm.currentPlayerDetails.subscribe((players: any) => {
      this.currentPlayers = players;
    });

    this.comm.currentBowlerDetails.subscribe((bowler: any) => {
      this.currentBowler = bowler;
    });

    this.comm.playingTeams.subscribe((teams: any) => {
      this.playingTeams = teams;
    });

    this.comm.getLastBallsData().subscribe((balls: any) => {
      const { data } = balls;
      for (let i = 0; i < data?.length; i++) {
        this.lastBalls[i] = data[i];
      }
    });

    this.comm.ballDetails.subscribe((balls) => {
      const { data } = balls;
      for (let i = 0; i < data?.length; i++) {
        this.lastBalls[i] = data[i];
      }
    });
  }

  getScoreData() {}
}

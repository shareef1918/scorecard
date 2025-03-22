import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, Subject } from 'rxjs';
import { ScoreDetails } from './app.interface';

@Injectable({
  providedIn: 'root'
})
export class CommunicationService {
  private readonly lastBallURL = 'http://localhost:3000/lastBalls';

  public scoreDetails: Subject<ScoreDetails>;
  public currentPlayerDetails: Subject<any>;
  public currentBowlerDetails: Subject<any>;
  public playingTeams: Subject<any>;
  public ballDetails: Subject<any>;

  constructor(private readonly httpClient: HttpClient) {
    this.scoreDetails = new Subject();
    this.currentPlayerDetails = new Subject();
    this.currentBowlerDetails = new Subject();
    this.playingTeams = new Subject();
    this.ballDetails = new Subject();
  }

  updatePlayersData(players: any) {
    this.currentPlayerDetails.next(players);
  }

  updatePlayingTeams(teams: any) {
    this.playingTeams.next(teams);
    // this.httpClient.put(this.teamsURL, teams).subscribe();
  }

  getLastBallsData() {
    return of([]);
    return this.httpClient.get(this.lastBallURL);
  }

  addToBalls(balls: any, clear = false) {
    let last8Balls = [];
    if (!clear) {
      last8Balls = balls.length > 8 ? balls.slice(1).slice(-8) : balls;
    }
    this.ballDetails.next(clear ? [] : last8Balls);
    this.httpClient.put(this.lastBallURL, { data: clear ? [] : last8Balls }).subscribe();
  }
}

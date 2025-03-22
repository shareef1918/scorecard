import { Component } from '@angular/core';

import { ApiService } from '../api.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NavigationItem } from 'src/app/theme/layout/admin/navigation/navigation';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { CommunicationService } from '../communication.service';
import { ScoreDetails } from '../app.interface';
import { TeamsService } from '../teams.service';
import { UtilsService } from '../utils.service';
import { TeamsComponent } from '../teams/teams.component';
import { MatchesCardComponent } from '../matches-card/matches-card.component';
import { ScoreboardComponent } from '../scoreboard/scoreboard.component';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store/lakeview.state';
import { Observable } from 'rxjs';
import { PlayersActions, TeamsActions } from 'src/app/store/lakeview.action';
import { getLiveMatch } from 'src/app/store/lakeview.selector';

@Component({
  selector: 'app-lakeviewboard',
  standalone: true,
  providers: [ApiService, NavigationItem, TeamsService],
  imports: [SharedModule, TeamsComponent, MatchesCardComponent, ScoreboardComponent],
  templateUrl: './lakeviewboard.component.html',
  styleUrl: './lakeviewboard.component.scss'
})
export default class LakeviewboardComponent {
  ///////
  public formData: any;
  public currentPlayers: any;
  public currentPlayersForm: FormGroup;
  public currentBowlerForm: FormGroup;
  public playingTeamsForm: FormGroup;
  public liveMatch$!: Observable<any>;
  public liveMatch: any;

  public striker1 = false;
  public striker2 = false;

  public lastBalls = [];
  public products: Observable<Array<any>>;

  constructor(
    private readonly comm: CommunicationService,
    private readonly fb: FormBuilder,
    private readonly teams: TeamsService,
    private readonly utils: UtilsService,
    private readonly store: Store<AppState>
  ) {
    ////
    this.currentPlayersForm = new FormGroup({
      player1: this.fb.group({
        name: new FormControl(''),
        balls: new FormControl(0),
        runs: new FormControl(0),
        striker: new FormControl(1)
      }),
      player2: this.fb.group({
        name: new FormControl(''),
        balls: new FormControl(0),
        runs: new FormControl(0),
        striker: new FormControl(0)
      })
    });

    this.currentBowlerForm = this.fb.group({
      name: new FormControl(''),
      runs: new FormControl(0),
      wickets: new FormControl(0),
      overs: new FormControl(0),
      balls: new FormControl(0)
    });

    this.playingTeamsForm = this.fb.group({
      team1: new FormControl(''),
      team2: new FormControl('')
    });

    this.liveMatch$ = this.store.select(getLiveMatch);
    this.liveMatch$.subscribe((match) => (this.liveMatch = match));
  }
  public scoreDetailsForm = new FormGroup({
    runs: new FormControl('0'),
    wickets: new FormControl('0'),
    overs: new FormControl('0'),
    balls: new FormControl('0')
  });

  ngOnInit() {
    this.store.dispatch(TeamsActions.loadTeams());
    this.store.dispatch(PlayersActions.loadPlayers());

    this.currentPlayersForm.valueChanges.subscribe((players) => {
      this.striker1 = players.player1.striker;
      this.striker2 = players.player2.striker;
      this.comm.updatePlayersData(players);
    });

    this.playingTeamsForm.valueChanges.subscribe((teams) => {
      this.comm.updatePlayingTeams(teams);
    });

    this.comm.getLastBallsData().subscribe((balls: any) => {
      this.lastBalls = balls.data;
    });
  }

  addScore(runs: any) {
    this.lastBalls = [...this.lastBalls, runs];
    this.comm.addToBalls(this.lastBalls);
  }

  clearBalls() {
    this.comm.addToBalls(null, true);
  }

  addProduct() {
    this.store.dispatch({
      type: 'ADD_PRODUCT',
      payload: <any>{
        name: 'Name',
        price: 123
      }
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { MatchesActions, PlayersActions } from '../store/lakeview.action';
import { Observable } from 'rxjs';
import { getLiveMatch, selectPlayers } from '../store/lakeview.selector';
import { SharedModule } from '../theme/shared/shared.module';
import moment from 'moment';

@Component({
  selector: 'app-players-list',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './players-list.component.html',
  styleUrl: './players-list.component.scss'
})
export default class PlayersListComponent implements OnInit {
  public liveMatch$!: Observable<any>;
  public players$!: Observable<any>;
  public matchInfo$: Observable<any>;
  public players = [];
  public matchInfo: any;
  public teams = [];

  constructor(private readonly store: Store) {
    this.store.dispatch(PlayersActions.loadPlayers());
    this.players$ = this.store.select(selectPlayers);
    this.store.dispatch(MatchesActions.loadMatches());
    this.liveMatch$ = this.store.select(getLiveMatch);
  }

  ngOnInit(): void {
    this.players$.subscribe((players) => (this.players = players));
    this.liveMatch$.subscribe((match) => {
      this.matchInfo = match;
      this.teams = this.matchInfo?.teams;
    });
  }

  getPlayersList(teamId) {
    return this.players.filter((player) => player.team === teamId);
  }

  getDate() {
    return moment().format('DD-MMM-YYYY');
  }
}

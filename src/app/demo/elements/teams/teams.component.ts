import { Component, ElementRef, ViewChild, viewChild } from '@angular/core';
import * as $ from 'jquery';

import { UtilsService } from '../utils.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { TeamsService } from '../teams.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { Player, Team } from '../teams.interface';
import { Store } from '@ngrx/store';
import { PlayersActions, TeamsActions } from 'src/app/store/lakeview.action';
import { Product } from 'src/app/store/product.model';
import { selectPlayers, getTeams } from 'src/app/store/lakeview.selector';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './teams.component.html',
  styleUrl: './teams.component.scss'
})
export class TeamsComponent {
  public addTeamForm: FormGroup;
  public addPlayerForm: FormGroup;
  public PlayersFilterForm: FormGroup;
  public teamsList: Team[] = [];
  public playerList: Player[] = [];
  public deleteTeamId = null;
  public deletePlayerId = null;
  public allPlayers = [];

  products$!: Observable<ReadonlyArray<Product>>;
  teams$!: Observable<any>;
  players$!: Observable<any>;

  @ViewChild('closeAddTeamModal') closeAddModal: ElementRef;
  @ViewChild('deleteTeamModal') deleteTeamModal: ElementRef;
  @ViewChild('closeAddPlayerModal') closePlayerModal: ElementRef;
  @ViewChild('deletePlayerModal') deletePlayerModal: ElementRef;

  constructor(
    private readonly utils: UtilsService,
    private readonly fb: FormBuilder,
    private readonly teams: TeamsService,
    private readonly store: Store
  ) {
    // Teams
    this.addTeamForm = this.fb.group({
      id: new FormControl(''),
      name: new FormControl('', [Validators.required]),
      location: new FormControl('', [Validators.required]),
      createdOn: new FormControl()
    });
    this.PlayersFilterForm = this.fb.group({
      id: new FormControl('')
    });
    // Players
    this.addPlayerForm = this.fb.group({
      id: new FormControl(),
      name: new FormControl('', [Validators.required]),
      team: new FormControl('', [Validators.required]),
      createdOn: new FormControl()
    });
  }

  ngOnInit() {
    this.store.dispatch(PlayersActions.loadPlayers());
    this.teams$ = this.store.select(getTeams);
    this.teams$.subscribe((teams) => (this.teamsList = teams));
    this.players$ = this.store.select(selectPlayers);
    this.players$.subscribe((players) => {
      if (this.PlayersFilterForm.value.id) {
        this.allPlayers = players.filter((player) => player.team === this.PlayersFilterForm.value.id);
      } else {
        this.allPlayers = players;
      }
    });
    this.teams.getPlayersList().subscribe((palyers: Player[]) => {
      this.playerList = palyers;
    });
  }

  getRandNum() {
    return (Math.random() * 10000).toString();
  }

  getTeamName(id: string) {
    return this.teamsList?.find((team) => team.id === id)?.name;
  }

  addNewTeam(): void {
    const teamData = this.addTeamForm.value;
    const team = this.appendIdAndTime(teamData);
    this.store.dispatch(TeamsActions.addTeam({ team }));
    this.addTeamForm.reset();
    this.closeAddModal.nativeElement.click();
  }

  addNewPlayer(): void {
    const playerData = this.addPlayerForm.value;
    const player: any = this.appendIdAndTime(playerData);
    player.isCaptain = false;
    this.store.dispatch(PlayersActions.addPlayer({ player }));
    this.addPlayerForm.reset();
    this.closePlayerModal.nativeElement.click();
    this.store.dispatch(PlayersActions.loadPlayers());
  }

  setPlayerAsCaptian(id) {
    let player: any = JSON.parse(JSON.stringify(this.playerList.find((player) => player.id == id)));
    player.isCaptain = true;
    const teamPlayers = JSON.parse(JSON.stringify(this.playerList.filter((p) => p.team === player.team)));
    for (let p of teamPlayers) {
      p.isCaptain = false;
      this.store.dispatch(PlayersActions.updatePlayer({ player: p }));
    }
    this.store.dispatch(PlayersActions.updatePlayer({ player }));
    this.store.dispatch(PlayersActions.loadPlayers());
  }

  generateTimeFormat(time: number) {
    return this.utils.generateTimeFormat(time);
  }

  setDeleteTeamId(id: string) {
    this.deleteTeamId = id;
  }

  setDeletePlayerId(id: string) {
    this.deletePlayerId = id;
  }

  deleteTeam(status: number) {
    if (status) {
      this.store.dispatch(TeamsActions.removeTeam({ teamId: this.deleteTeamId }));
      setTimeout(() => {
        this.store.dispatch(PlayersActions.loadPlayers());
      }, 1000);
    }
    this.deleteTeamModal.nativeElement.click();
  }

  deletePlayer(status: number) {
    if (status) {
      this.store.dispatch(PlayersActions.removePlayer({ playerId: this.deletePlayerId }));
    }
    this.deletePlayerModal.nativeElement.click();
  }

  appendIdAndTime(obj: any) {
    return { ...obj, ...{ id: this.utils.generateId(), createdOn: this.utils.generateTimeStamp() } };
  }

  updatePlayersFilter() {
    if (this.PlayersFilterForm?.value?.id) {
      this.allPlayers = this.playerList.filter((player) => player.team === this.PlayersFilterForm.value.id);
    } else {
      this.store.dispatch(PlayersActions.loadPlayers());
    }
  }
}

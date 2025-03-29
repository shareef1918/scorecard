import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Team, TeamsUrls } from './teams.interface';
import { UtilsService } from './utils.service';
import { Observable, of, Subject } from 'rxjs';
import { Product } from 'src/app/store/product.model';

@Injectable({
  providedIn: 'root'
})
export class TeamsService {
  public teamsUrl: string;
  public playersUrl: string;
  public urls: any;
  public Teams$: Subject<void>;

  constructor(
    private readonly httpClient: HttpClient,
    private readonly utils: UtilsService
  ) {
    this.urls = TeamsUrls;
    this.teamsUrl = this.utils.generateUrl(this.urls.team);
    this.playersUrl = this.utils.generateUrl(this.urls.player);
    this.Teams$ = new Subject();
  }

  addNewTeam({ team }) {
    try {
      return this.httpClient.post(this.teamsUrl, team);
    } catch (e) {
      throw console.error('Add Teams Api failed.');
    }
  }

  getTeamsList() {
    return this.httpClient.get(this.teamsUrl);
  }

  deleteTeam({ teamId }) {
    // this.httpClient.get(`${this.inningsUrl}`).subscribe((innings: any) => {
    //   (innings || []).forEach((inn) => {
    //     this.httpClient.delete(`${this.inningsUrl}/${inn.id}`).subscribe();
    //   })
    // });
    this.getPlayersList().subscribe((players: any) => {
      const TeamPlayers = players.filter((player) => player.team === teamId.teamId);
      TeamPlayers.forEach((player) => {
        this.deletePlayer({ playerId: player.id }).subscribe();
      });
    });
    return this.httpClient.delete(`${this.teamsUrl}/${teamId.teamId}`);
  }

  addNewPlayer({ player }) {
    try {
      return this.httpClient.post(this.playersUrl, player);
    } catch (e) {
      throw console.error('Add Teams Api failed.');
    }
  }

  getPlayersList() {
    return this.httpClient.get(this.playersUrl);
  }

  deletePlayer({ playerId }) {
    return this.httpClient.delete(`${this.playersUrl}/${playerId}`);
  }

  updatePlayer({ player }) {
    return this.httpClient.put(`${this.playersUrl}/${player?.id}`, player);
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatchesUrls, InningsUrl, MatchInfoUrl } from './matches.interface';
import { UtilsService } from './utils.service';
import { of, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuctionService {
  public playersUrl = 'http://localhost:3000/auctionPlayers';
  public teamsUrl = 'http://localhost:3000/auctionTeams';
  constructor(private readonly httpClient: HttpClient) {}

  getAuctionPlayers() {
    return this.httpClient.get(this.playersUrl);
  }

  updateAuctionPlayer({ player }) {
    return this.httpClient.put(`${this.playersUrl}/${player?.id}`, player);
  }

  getAuctionTeams() {
    return this.httpClient.get(this.teamsUrl);
  }

  updateAuctionTeam({ team }) {
    return this.httpClient.put(`${this.teamsUrl}/${team?.id}`, team);
  }

  deleteAuctionPlayer({ playerId }) {
    return this.httpClient.delete(`${this.playersUrl}/${playerId}`);
  }
}

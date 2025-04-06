import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuctionService {
  public playersUrl = 'http://localhost:3000/auctionPlayers';
  public teamsUrl = 'http://localhost:3000/auctionTeams';
  public auctionInfo = 'http://localhost:3000/auctionInfo';

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
  updateAuctionInfo({ auction }) {
    return this.httpClient.put(`${this.auctionInfo}/${auction?.id}`, auction);
  }

  deleteAuctionTeam({ team }) {
    return this.httpClient.delete(`${this.teamsUrl}/${team.teamId}`);
  }

  deleteAuctionPlayer({ playerId }) {
    return this.httpClient.delete(`${this.playersUrl}/${playerId}`);
  }

  loadAuctionInfo() {
    return this.httpClient.get(`${this.auctionInfo}`);
  }
  createAuction({ auction }) {
    return this.httpClient.post(this.auctionInfo, auction);
  }
  addAuctionTeam({ team }) {
    console.log(team);
    return this.httpClient.post(`${this.teamsUrl}`, team);
  }
  addAuctionPlayer({ player }) {
    return this.httpClient.post(`${this.playersUrl}`, player);
  }
}

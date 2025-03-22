import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatchesUrls, InningsUrl, MatchInfoUrl } from './matches.interface';
import { UtilsService } from './utils.service';
import { of, Subject } from 'rxjs';
import { HOST_NAME } from './teams.interface';

@Injectable({
  providedIn: 'root'
})
export class MatchesService {
  public urls: any;
  public matchesUrl: string;
  public inningsUrl: string;
  public matchInfoUrl: string;
  public MatchStart$: Subject<any>;

  constructor(
    private readonly httpClient: HttpClient,
    private readonly utils: UtilsService
  ) {
    this.urls = MatchesUrls;
    this.matchesUrl = this.utils.generateUrl(this.urls.matches);
    this.inningsUrl = this.utils.generateUrl(InningsUrl.innings);
    this.matchInfoUrl = this.utils.generateUrl(MatchInfoUrl.innings);
    this.MatchStart$ = new Subject();
  }

  getMatches() {
    return this.httpClient.get(this.matchesUrl);
  }

  startMatch({ match }) {
    return this.httpClient.post(this.matchesUrl, match);
  }

  addInnings({ innings }) {
    return this.httpClient.post(this.inningsUrl, innings);
  }

  startScoring(matchData: any) {
    this.httpClient.put(`${this.matchesUrl}/${matchData.id}`, matchData).subscribe();
  }

  updateMatch({ updateMatch }) {
    return this.httpClient.put(`${this.matchesUrl}/${updateMatch.id}`, updateMatch);
  }

  addToUndoList({ innings }) {
    return this.httpClient.post(`${HOST_NAME}undoList`, innings);
  }

  deleteLastBall({ ballId }) {
    return this.httpClient.delete(`${HOST_NAME}undoList/${ballId}`);
  }

  updateInnings({ innings }) {
    return this.httpClient.put(`${this.inningsUrl}/${innings.id}`, innings);
  }

  getInnings() {
    return this.httpClient.get(`${this.inningsUrl}`);
  }

  loadUndoList() {
    return this.httpClient.get(`${HOST_NAME}undoList`);
  }

  clearMatch({ matchId }) {
    (async () => {
      this.httpClient.get(`${this.inningsUrl}`).subscribe((innings: any) => {
        (innings || []).forEach((inn) => {
          this.httpClient.delete(`${this.inningsUrl}/${inn.id}`).subscribe();
        })
      });
      this.httpClient.get(`${this.matchesUrl}`).subscribe((matches: any) => {
        matches.forEach((match: any) => {
          this.httpClient.delete(`${this.matchesUrl}/${match.id}`).subscribe();
        });
      })
      this.httpClient.get(`${HOST_NAME}undoList`).subscribe((undoList: any) => {
        undoList.forEach((undo: any) => {
          this.httpClient.delete(`${HOST_NAME}undoList/${undo.id}`).subscribe();
        });
      });
    })();
    // return this.httpClient.delete(`${this.matchInfoUrl}/${id}`);
    return of('')
  }
}

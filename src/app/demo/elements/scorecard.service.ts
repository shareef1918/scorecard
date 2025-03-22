import { Injectable } from '@angular/core';
import { MatchesService } from './matches.service';

@Injectable({
  providedIn: 'root'
})
export class ScorecardService {
  constructor(private readonly matches: MatchesService) {}
}

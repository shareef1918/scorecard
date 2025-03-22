// Angular Import
import { Component, ElementRef, Inject, PLATFORM_ID, signal, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AuctionPlayers, AuctionTeams } from 'src/app/store/lakeview.action';
import { getAuctionPlayers, getAuctionTeams } from 'src/app/store/lakeview.selector';

@Component({
  selector: 'app-default',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss']
})
export class DefaultComponent {
  // public method

  public players$!: Observable<any>;
  public teams$!: Observable<any>;
  public teams: any;
  public players: any;
  public currentTeamId = null;
  // public selectedPlayerId = null;
  public currentBidTeam = 0;
  public timeLeft = 0;
  public interval;
  public disableSoldOut = true;
  public randNumber = 0;
  public randTimeer: any;
  public showTimerDiv = false;
  isBrowser = signal(false);
  public currentPlayerToDisplay = null;

  @ViewChild('closeViewPlayerDetails') closeViewPlayerDetails: ElementRef;
  @ViewChild('viewPlayerButton') viewPlayerButton: ElementRef;
  @ViewChild('playerModal') playerModal: ElementRef;

  constructor(
    private readonly store: Store,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser.set(isPlatformBrowser(platformId));
  }

  ngOnInit() {
    this.store.dispatch(AuctionPlayers.loadPlayers());
    this.store.dispatch(AuctionTeams.loadTeams());
    this.players$ = this.store.select(getAuctionPlayers);
    this.teams$ = this.store.select(getAuctionTeams);
    this.teams$.subscribe((teams) => (this.teams = teams));
    this.players$.subscribe((players) => (this.players = players));
  }

  getPlayerPic(player) {
    return player?.photo || 'assets/images/players/pic1.jpeg';
  }

  showTeamPlayersList(teamId) {
    this.currentTeamId = teamId;
  }
  getTeamPlayersList() {
    return this.teams?.find((team) => team?.id === this.currentTeamId)?.players;
  }

  teamPlayersCount(id) {
    return this.teams?.find((team) => team?.id === id)?.players?.length;
  }

  selectedPlayerDetails(id) {
    this.disableSoldOut = true;
    // this.selectedPlayerId = id;
    this.currentPlayerToDisplay = this.players.find((player) => player?.id == id);
    this.startTimer();
  }

  getPlayerDetails(id) {
    // const pid = id ?? this.selectedPlayerId;
    const pid = id ?? 10;
    if (!id) {
      const player = this.players.find((player) => player?.id === pid);
      this.currentBidTeam = player?.bidBy;
      return player;
    }
    return this.players[pid];
  }

  getTeamLogo(team) {
    return team?.logo || 'assets/images/logos/lakeview.png';
  }

  updateBidPrice(playerData, teamId) {
    this.currentTeamId = teamId;
    const players = this.getTeamPlayersList();
    // if (this.getTotalSpentAmount(players) >= playerData?.currentBidPrice) {
    this.startTimer();
    this.currentBidTeam = teamId;
    const player = {
      ...playerData,
      ...{ currentBidPrice: playerData?.currentBidPrice + this.getBidAdditionalPrice(playerData?.currentBidPrice), bidBy: teamId }
    };
    this.store.dispatch(AuctionPlayers.updatePlayer({ player }));
    // } else {
    //   console.log('Yourv Puse amount is less than the bid');
    // }
  }

  startTimer() {
    if (this.interval) clearInterval(this.interval);
    this.timeLeft = 30;
    this.interval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.disableSoldOut = false;
        clearInterval(this.interval);
      }
    }, 1000);
  }

  getBidAdditionalPrice(price) {
    if (price < 100) return 10;
    else if (price < 300) return 20;
    else if (price >= 300) return 50;
    return 10;
  }

  soldPlayer(playerId) {
    this.playerModal.nativeElement.className = 'modal fade';
    const playerData = this.players?.find((player) => player?.id == playerId);
    if (playerData?.bidBy) {
      const teamData = this.teams?.find((team) => team?.id === this.currentBidTeam);
      const team = { ...teamData, ...{ players: [...teamData?.players, ...[playerData]] } };
      this.store?.dispatch(AuctionTeams.updateTeam({ team }));
      this.store?.dispatch(AuctionPlayers.deletePlayer({ playerId }));
      this.currentBidTeam = 0;
      this.closeViewPlayerDetails.nativeElement.click();
      this.disableSoldOut = true;
    }
  }

  getTotalSpentAmount(players) {
    return players?.reduce((acc, player) => acc + +player?.currentBidPrice, 0);
  }

  getTotalRemainingAmount(players) {
    return 2500 - this.getTotalSpentAmount(players);
  }

  generateNumber() {
    let interval: any;
    this.showTimerDiv = true;
    if (this.isBrowser()) {
      // check it where you want to write setTimeout or setInterval
      interval = setInterval(() => {
        this.randNumber = Math.trunc(Math.random() * this.players.length + 1);
      }, 70);
    }
    setTimeout(() => {
      if (interval) {
        clearInterval(interval);
        this.showTimerDiv = false;
      }
      this.disableSoldOut = true;
      this.currentPlayerToDisplay = this.players[this.randNumber];
      this.playerModal.nativeElement.className = 'modal fade show d-block';
      this.startTimer();
    }, 3000);
  }

  getCurrentPlayerToDisplay() {
    console.log(this.currentPlayerToDisplay);
    if (this.currentPlayerToDisplay) {
      return this.players.find((player) => player.id == this.currentPlayerToDisplay.id);
    }
  }

  closePlayerModal() {
    this.playerModal.nativeElement.className = 'modal fade';
    this.currentBidTeam = 0;
  }
}

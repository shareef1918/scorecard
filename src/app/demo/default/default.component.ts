// Angular Import
import { Component, ElementRef, Inject, PLATFORM_ID, signal, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AuctionInfo, AuctionPlayers, AuctionTeams } from 'src/app/store/lakeview.action';
import { getAuctionInfo, getAuctionPlayers, getAuctionTeams } from 'src/app/store/lakeview.selector';
import { PlayerRole } from '../elements/teams.interface';
import { auctionPlayers } from '../../store/lakeview.selector';

export const PlayerRoles = ['Batsman', 'Bowler', 'All-Rounder'];

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
  public displayNumber = 0;
  public randTimeer: any;
  public showTimerDiv = false;
  isBrowser = signal(false);
  public currentPlayerToDisplay = null;
  public auctionInfo: any;

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
    this.store.dispatch(AuctionInfo.loadAuction());
    this.store.select(getAuctionInfo).subscribe((info) => (this.auctionInfo = info[0]));
    this.players$ = this.store.select(getAuctionPlayers);
    this.teams$ = this.store.select(getAuctionTeams);
    this.teams$.subscribe((teams) => (this.teams = teams));
    this.players$.subscribe((players) => (this.players = players));
  }

  showTeamPlayersList(teamId) {
    this.currentTeamId = teamId;
  }

  startNextAuctionRound() {
    let auction = JSON.parse(JSON.stringify(this.auctionInfo));
    auction.auctionRound = auction.auctionRound + 1;
    this.store.dispatch(AuctionInfo.updateAuction({ auction }));
    this.store.dispatch(AuctionInfo.loadAuction());
    this.store.dispatch(AuctionPlayers.loadPlayers());
    this.store.dispatch(AuctionTeams.loadTeams());
  }

  getTeamPlayersList() {
    return this.teams?.find((team) => team?.id === this.currentTeamId)?.players;
  }

  getTeamName(id) {
    if (id) {
      return this.teams?.find((team) => team.id === id)?.name;
    }
  }

  teamPlayersCount(id) {
    return this.teams?.find((team) => team?.id === id)?.players?.length || 0;
  }

  selectedPlayerDetails(id) {
    this.disableSoldOut = true;
    // this.selectedPlayerId = id;
    this.currentPlayerToDisplay = this.players.find((player) => player?.id == id);
    this.startTimer();
  }

  getPlayerDetails(id) {
    const pid = id ?? 10;
    if (!id) {
      const player = this.players.find((player) => player?.id === pid);
      this.currentBidTeam = player?.bidBy;
      return player;
    }
    return this.players[pid];
  }

  getPlayerDetailsById(id) {
    return (this.players || []).find((player) => player?.id === id);
  }
  getTeamLogo(team) {
    return team?.logo || 'assets/images/logos/lakeview.png';
  }

  updateBidPrice(playerData, teamId) {
    this.currentTeamId = teamId;
    // const players = this.getTeamPlayersList();
    this.startTimer();
    this.currentBidTeam = teamId;
    const player = {
      ...playerData,
      ...{
        currentBidPrice:
          (playerData?.currentBidPrice ? playerData?.currentBidPrice : this.auctionInfo?.basePrice) +
          this.getBidAdditionalPrice(playerData?.currentBidPrice),
        bidBy: teamId
      }
    };
    this.store.dispatch(AuctionPlayers.updatePlayer({ player }));
  }

  getAuctionPlayers() {
    return this.players?.filter((player) => !player.isCaptain && player.auctionRound === this.auctionInfo?.auctionRound);
  }

  getUnsoldPlayersCount() {
    return this.players?.filter((player) => player?.auctionRound === this.auctionInfo?.auctionRound + 1)?.length;
  }

  getSoldOutPlayersCount() {
    return this.auctionInfo?.auctionPlayersCount - this.getAuctionPlayers()?.length - this.getUnsoldPlayersCount() || 0;
  }

  getCaptainsCount() {
    return this.players?.filter((player) => player.isCaptain)?.length;
  }

  onImageError(event: any): void {
    // If the image fails to load, update the source to the default image.
    event.target.src = 'assets/images/logos/lakeview.png';
  }

  startTimer() {
    if (this.interval) clearInterval(this.interval);
    this.timeLeft = 30;
    this.interval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        clearInterval(this.interval);
      }
      if (this.timeLeft <= 20) {
        this.disableSoldOut = false;
      }
    }, 1000);
  }

  getBidAdditionalPrice(price) {
    if (price < 300) return 20;
    else if (price >= 300) return 50;
    else if (price > 700) return 100;
    return 20;
  }

  soldPlayer(playerId) {
    const playerData = this.players?.find((player) => player?.id == playerId);
    if (playerData?.bidBy) {
      const teamData = this.teams?.find((team) => team?.id === this.currentBidTeam);
      const team = { ...teamData, ...{ players: [...(teamData?.players || []), ...[playerData]] } };
      this.store?.dispatch(AuctionTeams.updateTeam({ team }));
      this.store?.dispatch(AuctionPlayers.deletePlayer({ playerId }));
      this.currentBidTeam = 0;
      this.closeViewPlayerDetails.nativeElement.click();
      this.playerModal.nativeElement.className = 'modal fade';
      this.disableSoldOut = true;
    }
  }

  getPlayerRole(role) {
    return PlayerRole[role];
  }

  getTotalSpentAmount(teamId) {
    if (teamId) {
      const team = this.teams?.find((team) => team.id === teamId);
      return (team?.players || [])?.reduce((acc, player) => acc + +player?.currentBidPrice, 0);
    }
    return 0;
  }

  getTotalRemainingAmount(teamId) {
    const player = this.players?.find((player) => player?.id === this.currentPlayerToDisplay?.id);
    return this.auctionInfo?.teamPurse - this.getTotalSpentAmount(teamId) - (teamId === player?.bidBy ? player.currentBidPrice : 0);
  }

  getRoleText(role: number) {
    return PlayerRoles[role - 1];
  }

  getCategoryWisePlayers() {
    const categoryA = this.players.filter((player) => player.category === '1' && !player?.isCaptain);
    const categoryB = this.players.filter((player) => player.category === '2' && !player?.isCaptain);
    const categoryC = this.players.filter((player) => player.category === '3' && !player?.isCaptain);
    return categoryA?.length ? categoryA : categoryB?.length ? categoryB : categoryC;
  }

  generateNumber() {
    let interval: any;
    this.showTimerDiv = true;
    if (this.isBrowser()) {
      const auctionPlayers = this.getCategoryWisePlayers();
      interval = setInterval(() => {
        this.displayNumber = Math.trunc(Math.random() * 100);
        this.randNumber = Math.trunc(Math.random() * auctionPlayers.length + 1);
      }, 100);
    }
    setTimeout(() => {
      if (interval) {
        clearInterval(interval);
        this.showTimerDiv = false;
      }
      this.disableSoldOut = true;
      const players = this.getCategoryWisePlayers();
      this.currentPlayerToDisplay = players[this.randNumber - 1];
      this.playerModal.nativeElement.className = 'modal fade show d-block';
      this.startTimer();
    }, 3000);
  }

  getCurrentPlayerToDisplay() {
    if (this.currentPlayerToDisplay) {
      const player = this.players.find((player) => player.id == this.currentPlayerToDisplay.id);
      this.currentBidTeam = player?.bidBy;
      return player;
    }
  }

  unSoldPlayer(playerId) {
    let player = JSON.parse(JSON.stringify(this.players?.find((player) => player?.id === playerId)));
    player.auctionRound = this.auctionInfo?.auctionRound + 1;
    this.store.dispatch(AuctionPlayers.updatePlayer({ player }));
    this.closeViewPlayerDetails.nativeElement.click();
    this.playerModal.nativeElement.className = 'modal fade';
    this.disableSoldOut = true;
  }

  closePlayerModal() {
    this.playerModal.nativeElement.className = 'modal fade';
    this.currentBidTeam = 0;
  }
}

import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SharedModule } from '../theme/shared/shared.module';
import moment from 'moment';
import { Store } from '@ngrx/store';
import { getAuctionInfo, getAuctionPlayers, getAuctionTeams, auctionInfo } from '../store/lakeview.selector';
import { Observable } from 'rxjs';
import { AuctionInfo, AuctionPlayers, AuctionTeams } from '../store/lakeview.action';
import { PlayerRole } from '../demo/elements/teams.interface';
import { TeamsService } from '../demo/elements/teams.service';

@Component({
  selector: 'app-auction-admin',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './auction-admin.component.html',
  styleUrl: './auction-admin.component.scss'
})
export class AuctionAdminComponent implements OnInit {
  public createAuctionForm: FormGroup;
  public addPlayerForm: FormGroup;
  public auctionInfo$!: Observable<any>;
  public auctionTeams$!: Observable<any>;
  public auctionPlayers$!: Observable<any>;
  public addTeamForm: FormGroup;
  public auctionTeams: any;
  public auctionPlayers: any;
  public deleteTeamId = null;
  public deletePlayerId = null;
  public selectedFile = null;
  public auctionInfo: any;

  @ViewChild('closeCreateAuctionModal') closeCreateAuctionModal: ElementRef;
  @ViewChild('closeAddTeamModal') closeAddTeamModal: ElementRef;
  @ViewChild('closeAddPlayerModal') closeAddPlayerModal: ElementRef;
  @ViewChild('deleteTeamModal') deleteTeamModal: ElementRef;
  @ViewChild('deletePlayerModal') deletePlayerModal: ElementRef;

  constructor(
    private readonly fb: FormBuilder,
    private readonly store: Store,
    private readonly teamsService: TeamsService
  ) {
    this.createAuctionForm = this.fb.group({
      id: new FormControl(''),
      title: new FormControl('', [Validators.required]),
      subTitle: new FormControl('', [Validators.required]),
      basePrice: new FormControl(10, [Validators.required]),
      teamPurse: new FormControl(100, [Validators.required]),
      auctionDate: new FormControl('', Validators.required)
    });
    this.addPlayerForm = this.fb.group({
      name: new FormControl('', [Validators.required]),
      phone: new FormControl(null, [Validators.required, Validators.minLength(10), Validators.maxLength(10)]),
      role: new FormControl('', [Validators.required]),
      isCaptain: new FormControl(null),
      category: new FormControl(null),
      photo: new FormControl(null)
    });
    this.addTeamForm = this.fb.group({
      name: new FormControl('', [Validators.required]),
      location: new FormControl('', [Validators.required]),
      captainId: new FormControl('', [Validators.required]),
      logo: new FormControl(null)
    });
  }

  ngOnInit(): void {
    this.store.dispatch(AuctionInfo.loadAuction());
    this.store.dispatch(AuctionTeams.loadTeams());
    this.store.dispatch(AuctionPlayers.loadPlayers());
    this.auctionInfo$ = this.store.select(getAuctionInfo);
    this.auctionInfo$.subscribe((info) => (this.auctionInfo = info[0]));
    this.auctionTeams$ = this.store.select(getAuctionTeams);
    this.auctionPlayers$ = this.store.select(getAuctionPlayers);
    this.auctionTeams$.subscribe((teams) => (this.auctionTeams = teams));
    this.auctionPlayers$.subscribe((players) => (this.auctionPlayers = players));
  }

  getTeamName(teamId) {
    return this.auctionTeams?.finf((team) => team.id === teamId);
  }

  getPlayerRole(role) {
    return PlayerRole[role];
  }

  createAuction() {
    let form = this.createAuctionForm.value;
    (form.id = moment().unix().toString()), (form.createdOn = moment());
    form.auctionRound = 1;
    this.store.dispatch(AuctionInfo.createAuction({ auction: form }));
    this.closeCreateAuctionModal.nativeElement.click();
    this.createAuctionForm.reset();
  }

  getCaptains() {
    return this.auctionPlayers.filter((player) => player?.isCaptain && !player.teamCaptain);
  }

  addAuctionPlayer() {
    let form = this.addPlayerForm.value;
    (form.id = moment().unix().toString()), (form.createdOn = moment());
    form.photo = `assets/images/players/${form?.name?.split(' ').join('_').toLowerCase()}.png`;
    form.currentBidPrice = this.auctionInfo?.basePrice;
    if (form.isCaptain) {
      form.teamCaptain = null;
      form.currentBidPrice = 0;
    }
    form.auctionRound = 1;
    this.store.dispatch(AuctionPlayers.addAuctionPlayer({ player: form }));
    this.closeAddPlayerModal.nativeElement.click();
    this.addPlayerForm.reset();
    this.selectedFile = null;
  }

  onFileSelected(file: any) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }

  uploadFile(event) {
    if (event.target.value) {
      const file = event.target.files[0];
      this.onFileSelected(file).then((base64: string): any => {
        this.selectedFile = base64;
      });
    }
  }

  onImageError(event: any): void {
    // If the image fails to load, update the source to the default image.
    event.target.src = 'assets/images/logos/lakeview.png';
  }

  addNewTeam() {
    let form = this.addTeamForm.value;
    form.logo = `assets/images/logos/${form?.name?.split(' ').join('_')}.png`;
    (form.id = moment().unix().toString()), (form.createdOn = moment());
    form.purseAmount = this.auctionInfo.teamPurse;
    const player = JSON.parse(JSON.stringify(this.auctionPlayers.find((player) => player?.id == form.captainId)));
    player.teamCaptain = form.id;
    form.players = [...(form.players || []), player];
    this.store.dispatch(AuctionTeams.addAuctionTeam({ team: form }));
    this.store.dispatch(AuctionPlayers.updatePlayer({ player }));
    this.closeAddTeamModal.nativeElement.click();
    this.selectedFile = null;
    this.addTeamForm.reset();
  }

  getImage(buff) {
    return buff.toString('base64');
  }

  getDate(date) {
    return moment(date)?.format('DD-MM-YYYY hh:mm A');
  }

  deleteTeam(selection) {
    if (selection) {
      this.store.dispatch(AuctionTeams.deleteTeam({ teamId: this.deleteTeamId }));
    }
    this.deleteTeamModal.nativeElement.click();
    this.deleteTeamId = null;
  }

  setDeletePlayerId(id) {
    this.deletePlayerId = id;
  }

  deletePlayer(selection) {
    if (selection) {
      this.store.dispatch(AuctionPlayers.deletePlayer({ playerId: this.deletePlayerId }));
    }
    this.deletePlayerModal.nativeElement.click();
    this.deletePlayerId = null;
  }

  setDeleteTeamId(id) {
    this.deleteTeamId = id;
  }
}

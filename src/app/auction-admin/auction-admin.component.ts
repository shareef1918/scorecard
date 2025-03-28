import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SharedModule } from '../theme/shared/shared.module';
import moment from 'moment';
import { Store } from '@ngrx/store';
import { getAuctionInfo } from '../store/lakeview.selector';
import { Observable } from 'rxjs';
import { AuctionInfo, AuctionPlayers, AuctionTeams } from '../store/lakeview.action';

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
  public addTeamForm: FormGroup;

  @ViewChild('closeCreateAuctionModal') closeCreateAuctionModal: ElementRef;
  @ViewChild('closeAddTeamModal') closeAddTeamModal: ElementRef;
  @ViewChild('closeAddPlayerModal') closeAddPlayerModal: ElementRef;

  constructor(
    private readonly fb: FormBuilder,
    private readonly store: Store
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
      isCaptain: new FormControl(''),
      photo: new FormControl(null)
    });
    this.addTeamForm = this.fb.group({
      name: new FormControl('', [Validators.required]),
      location: new FormControl('', [Validators.required]),
      logo: new FormControl(null)
    });
  }

  ngOnInit(): void {
    this.store.dispatch(AuctionInfo.loadAuction());
    this.auctionInfo$ = this.store.select(getAuctionInfo);
    this.auctionInfo$.subscribe((data) => console.log(data));
  }

  createAuction() {
    let form = this.createAuctionForm.value;
    (form.id = moment().unix()), (form.createdOn = moment());
    this.store.dispatch(AuctionInfo.createAuction({ auction: form }));
    this.closeCreateAuctionModal.nativeElement.click();
    this.createAuctionForm.reset();
  }

  addAuctionPlayer() {
    let form = this.addPlayerForm.value;
    (form.id = moment().unix()), (form.createdOn = moment());
    this.store.dispatch(AuctionPlayers.addAuctionPlayer({ player: form }));
    this.closeAddPlayerModal.nativeElement.click();
    this.addPlayerForm.reset();
  }

  addNewTeam() {
    let form = this.addTeamForm.value;
    (form.id = moment().unix()), (form.createdOn = moment());
    this.store.dispatch(AuctionTeams.addAuctionTeam({ team: form }));
    this.closeAddTeamModal.nativeElement.click();
    this.addTeamForm.reset();
  }

  getDate(date) {
    return moment(date)?.format('DD-MM-YYYY');
  }
}

import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AdminComponent } from './theme/layout/admin/admin.component';
import { NavigationItem } from './theme/layout/admin/navigation/navigation';
import { NavBarComponent } from './theme/layout/admin/nav-bar/nav-bar.component';
import { NavLeftComponent } from './theme/layout/admin/nav-bar/nav-left/nav-left.component';
import { NavRightComponent } from './theme/layout/admin/nav-bar/nav-right/nav-right.component';
import { NavigationComponent } from './theme/layout/admin/navigation/navigation.component';
import { NavLogoComponent } from './theme/layout/admin/nav-bar/nav-logo/nav-logo.component';
import { NavContentComponent } from './theme/layout/admin/navigation/nav-content/nav-content.component';
import { NavGroupComponent } from './theme/layout/admin/navigation/nav-content/nav-group/nav-group.component';
import { NavCollapseComponent } from './theme/layout/admin/navigation/nav-content/nav-collapse/nav-collapse.component';
import { NavItemComponent } from './theme/layout/admin/navigation/nav-content/nav-item/nav-item.component';
import { SharedModule } from './theme/shared/shared.module';
import { ConfigurationComponent } from './theme/layout/admin/configuration/configuration.component';
import { GuestComponent } from './theme/layout/guest/guest.component';
import { provideHttpClient } from '@angular/common/http';
import LakeviewbannerComponent from './demo/elements/lakeviewbanner/lakeviewbanner.component';
import { BannerThemeAComponent } from './demo/elements/banner-theme-a/banner-theme-a.component';
import { ScoreboardComponent } from './demo/elements/scoreboard/scoreboard.component';
import { provideStore } from '@ngrx/store';
import {
  teamsReducer,
  playersReducer,
  matchesReducer,
  InningsReducer,
  auctionPlayersReducer,
  auctionTeamsReducer,
  undoListReducer
} from './store/lakeview.reducer';
import { LakeViweEffects } from './store/lakeview.effects';
import { provideEffects } from '@ngrx/effects';

@NgModule({
  declarations: [
    AppComponent,
    AdminComponent,
    NavBarComponent,
    NavLeftComponent,
    NavRightComponent,
    NavigationComponent,
    NavLogoComponent,
    NavContentComponent,
    NavGroupComponent,
    NavItemComponent,
    NavCollapseComponent,
    ConfigurationComponent,
    GuestComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SharedModule,
    BrowserAnimationsModule,
    LakeviewbannerComponent,
    BannerThemeAComponent,
    ScoreboardComponent
  ],
  providers: [
    NavigationItem,
    provideHttpClient(),
    provideStore({
      teams: teamsReducer,
      matches: matchesReducer,
      players: playersReducer,
      innings: InningsReducer,
      auctionPlayers: auctionPlayersReducer,
      auctionTeams: auctionTeamsReducer,
      undoList: undoListReducer
    }),
    provideHttpClient(),
    provideEffects([LakeViweEffects])
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {}

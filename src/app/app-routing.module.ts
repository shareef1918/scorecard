import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './theme/layout/admin/admin.component';
import LakeviewbannerComponent from './demo/elements/lakeviewbanner/lakeviewbanner.component';
import { BannerThemeAComponent } from './demo/elements/banner-theme-a/banner-theme-a.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: '',
        redirectTo: '/auction',
        pathMatch: 'full'
      },
      {
        path: 'auction',
        loadComponent: () => import('./demo/default/default.component').then((c) => c.DefaultComponent)
      },
      {
        path: 'auction-admin',
        loadComponent: () => import('./auction-admin/auction-admin.component').then((c) => c.AuctionAdminComponent)
      },
      {
        path: 'scorecard',
        loadComponent: () => import('./demo/elements/scorecard/scorecard.component')
      },
      {
        path: 'summary',
        loadComponent: () => import('./demo/elements/match-summary/match-summary.component')
      },
      {
        path: 'lakeviewboard',
        loadComponent: () => import('./demo/elements/lakeviewboard/lakeviewboard.component')
      },
      {
        path: 'aucklandboard',
        loadComponent: () => import('./demo/elements/aucklandboard/aucklandboard.component')
      },
      {
        path: 'players',
        loadComponent: () => import('./players-list/players-list.component')
      },
      {
        path: 'color',
        loadComponent: () => import('./demo/elements/element-color/element-color.component')
      },
      {
        path: 'sample-page',
        loadComponent: () => import('./demo/sample-page/sample-page.component')
      }
    ]
  },
  {
    path: 'lakeviewbanner',
    component: LakeviewbannerComponent
  },
  {
    path: 'theme-1',
    component: BannerThemeAComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}

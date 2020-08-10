import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from './shared/components';

import { HomeRoutingModule } from './home/home-routing.module';
import { InstallRoutingModule } from "./install/install-routing.module";
import { ConfigRoutingModule } from './config/config-routing.module';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'install',
    pathMatch: 'full'
  },
  {
    path: '**',
    component: PageNotFoundComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
    InstallRoutingModule,
    HomeRoutingModule,
    ConfigRoutingModule
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InstallRoutingModule } from './install-routing.module';

import { InstallComponent } from './install.component';
import { SharedModule } from '../shared/shared.module';
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";

@NgModule({
  declarations: [InstallComponent],
  imports: [
    CommonModule,
    FontAwesomeModule,
    SharedModule,
    InstallRoutingModule
  ]
})
export class InstallModule {}

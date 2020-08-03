import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConfigRoutingModule } from './config-routing.module';

import { ConfigComponent } from './config.component';
import { SharedModule } from '../shared/shared.module';
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";

@NgModule({
  declarations: [ConfigComponent],
  imports: [CommonModule, SharedModule, ConfigRoutingModule, FontAwesomeModule]
})
export class ConfigModule {}

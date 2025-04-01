import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import {
  AdvertisementComponent,
  BasePopoverComponent,
  HeaderComponent, PostModalComponent,
  ProfileSummaryComponent,
  StartPostComponent
} from './components';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule
  ],
  declarations: [
    HomePage,
    AdvertisementComponent,
    BasePopoverComponent,
    HeaderComponent,
    PostModalComponent,
    ProfileSummaryComponent,
    StartPostComponent
  ]
})
export class HomePageModule {}

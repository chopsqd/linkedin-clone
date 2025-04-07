import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import {
  AdvertisementComponent, AllPostsComponent,
  BasePopoverComponent,
  HeaderComponent, PostModalComponent,
  ProfileSummaryComponent,
  StartPostComponent, TabsComponent,
  ConnectionProfileComponent, UserProfileComponent,
  RequestsPopoverComponent
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
    AllPostsComponent,
    AdvertisementComponent,
    BasePopoverComponent,
    ConnectionProfileComponent,
    HeaderComponent,
    PostModalComponent,
    ProfileSummaryComponent,
    StartPostComponent,
    TabsComponent,
    UserProfileComponent,
    RequestsPopoverComponent
  ]
})
export class HomePageModule {}

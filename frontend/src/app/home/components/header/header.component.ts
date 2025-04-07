import { Component, OnDestroy, OnInit } from '@angular/core';
import {PopoverController} from '@ionic/angular';
import { Subscription } from 'rxjs';
import {BasePopoverComponent} from '../base-popover/base-popover.component';
import { AuthService } from '../../../auth/services/auth.service';
import { RequestsPopoverComponent } from '../requests-popover/requests-popover.component';
import { FriendRequest } from '../../models';
import { ConnectionProfileService } from '../../services/connection-profile.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  userFullImagePath: string;

  private userImagePathSubscription: Subscription;
  private friendRequestsSubscription: Subscription;

  constructor(
    private readonly popoverController: PopoverController,
    public readonly connectionProfileService: ConnectionProfileService,
    private readonly authService: AuthService
  ) {}

  async presentPopover(event: Event) {
    const popover = await this.popoverController.create({
      component: BasePopoverComponent,
      cssClass: 'custom-popover',
      event,
      showBackdrop: false,
    });
    await popover.present();
  }

  async presentRequestsPopover(event: Event) {
    if (!this.connectionProfileService.friendRequests.length) {
      return;
    }

    const popover = await this.popoverController.create({
      component: RequestsPopoverComponent,
      cssClass: 'custom-popover',
      event,
      showBackdrop: false,
    });
    await popover.present();
  }

  ngOnInit() {
    this.userImagePathSubscription = this.authService.userFullImagePath
      .subscribe((fullPath: string) => {
        this.userFullImagePath = fullPath;
      });

    this.friendRequestsSubscription = this.connectionProfileService
      .getFriendRequests()
      .subscribe((friendRequests: FriendRequest[]) => {
        this.connectionProfileService.friendRequests = friendRequests.filter(
          (friendRequest: FriendRequest) => friendRequest.status === 'pending'
        );
      });
  }

  ngOnDestroy() {
    this.userImagePathSubscription.unsubscribe();
    this.friendRequestsSubscription.unsubscribe();
  }
}

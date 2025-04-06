import { Component, OnDestroy, OnInit } from '@angular/core';
import {PopoverController} from '@ionic/angular';
import { Subscription } from 'rxjs';
import {BasePopoverComponent} from '../base-popover/base-popover.component';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  userFullImagePath: string;
  private userImagePathSubscription: Subscription;

  constructor(
    private readonly popoverController: PopoverController,
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

  ngOnInit() {
    this.userImagePathSubscription = this.authService.userFullImagePath
      .subscribe((fullPath: string) => {
        this.userFullImagePath = fullPath;
      });
  }

  ngOnDestroy() {
    this.userImagePathSubscription.unsubscribe();
  }
}

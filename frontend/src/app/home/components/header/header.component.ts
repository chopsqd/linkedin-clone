import { Component, OnInit } from '@angular/core';
import {PopoverController} from '@ionic/angular';
import {BasePopoverComponent} from '../base-popover/base-popover.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  constructor(public popoverController: PopoverController) { }

  async presentPopover(event: Event) {
    const popover = await this.popoverController.create({
      component: BasePopoverComponent,
      cssClass: 'custom-popover',
      event,
      showBackdrop: false,
    });
    await popover.present();
  }

  ngOnInit() {}
}

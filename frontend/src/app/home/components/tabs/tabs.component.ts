import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import {PostModalComponent} from '../post-modal/post-modal.component';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
})
export class TabsComponent {
  constructor(public modalController: ModalController) {}

  async presentModal() {
    const modal = await this.modalController.create({
      component: PostModalComponent,
      cssClass: 'custom-modal',
    });
    await modal.present();

    const {data} = await modal.onDidDismiss();
    if (!data) {
      return;
    }
    console.log('DATA', data);
  }
}

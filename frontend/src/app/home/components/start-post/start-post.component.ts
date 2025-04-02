import {Component, OnInit} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {PostModalComponent} from '../post-modal/post-modal.component';

@Component({
  selector: 'app-start-post',
  templateUrl: './start-post.component.html',
  styleUrls: ['./start-post.component.scss'],
})
export class StartPostComponent implements OnInit {
  constructor(private modalController: ModalController) {}

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
    console.log('DATA', data)
  }

  ngOnInit() {}
}

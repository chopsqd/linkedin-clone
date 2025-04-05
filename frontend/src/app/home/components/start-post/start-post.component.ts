import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { PostModalComponent } from '../post-modal/post-modal.component';

@Component({
  selector: 'app-start-post',
  templateUrl: './start-post.component.html',
  styleUrls: ['./start-post.component.scss']
})
export class StartPostComponent implements OnInit {
  @Output() create: EventEmitter<string> = new EventEmitter<string>();

  constructor(private readonly modalController: ModalController) {}

  async presentModal() {
    console.log('CREATE POST');
    const modal = await this.modalController.create({
      component: PostModalComponent,
      cssClass: 'custom-modal'
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (!data) {
      return;
    }

    this.create.emit(data.post.body);
  }

  ngOnInit() {}
}

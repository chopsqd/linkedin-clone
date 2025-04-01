import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {ModalController} from '@ionic/angular';

@Component({
  selector: 'app-post-modal',
  templateUrl: './post-modal.component.html',
  styleUrls: ['./post-modal.component.scss'],
})
export class PostModalComponent implements OnInit {
  @ViewChild('form') form: NgForm;

  constructor(private modalController: ModalController) {
  }

  async onDismiss() {
    await this.modalController.dismiss(null, 'dismiss');
  }

  onPost() {
    if (!this.form.valid) {
      return;
    }

    const body = this.form.value.body;
    this.modalController.dismiss({
      post: { body, createdAt: new Date() }
    }, 'post');
  }

  ngOnInit() {
  }
}

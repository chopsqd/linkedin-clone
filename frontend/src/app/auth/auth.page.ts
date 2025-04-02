import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
  @ViewChild('form') form: NgForm;

  submissionType: 'login' | 'join' = 'login';

  constructor() { }

  onSubmit() {
    const { email, password, firstName, lastName } = this.form.value;

    if (!email || !password || (this.submissionType !== 'login' && (!firstName || !lastName))) {
      return;
    }

    if (this.submissionType === 'login') {
      console.log('Login');
    } else {
      console.log('Join');
    }
  }

  toggleSubmissionType() {
    this.submissionType = this.submissionType === 'login'
      ? 'join'
      : 'login';
  }

  ngOnInit() {}
}

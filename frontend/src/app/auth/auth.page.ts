import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss']
})
export class AuthPage implements OnInit {
  @ViewChild('form') form: NgForm;

  submissionType: 'login' | 'join' = 'login';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  onSubmit() {
    const { email, password, firstName, lastName } = this.form.value;

    if (!email || !password || (this.submissionType !== 'login' && (!firstName || !lastName))) {
      return;
    }

    if (this.submissionType === 'login') {
      return this.authService.login(email, password)
        .subscribe(() => {
          this.router.navigateByUrl('/home');
        });
    } else {
      return this.authService.register({ firstName, lastName, password, email })
        .subscribe(() => {
          this.toggleSubmissionType();
        });
    }
  }

  toggleSubmissionType() {
    this.submissionType = this.submissionType === 'login'
      ? 'join'
      : 'login';
  }

  ngOnInit() {}
}

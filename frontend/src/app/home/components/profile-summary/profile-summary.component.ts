import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { BehaviorSubject, catchError, EMPTY, from, Subscription, switchMap, take, tap } from 'rxjs';
import { AuthService } from '../../../auth/services/auth.service';
import { Role } from '../../../auth/models/user.model';
import { FileTypeResult, fromBuffer } from 'file-type/core';
import { BannerColorService } from '../../services/banner-color.service';

type ValidFileExtension = 'png' | 'jpg' | 'jpeg';
type ValidMimeType = 'image/png' | 'image/jpeg';

@Component({
  selector: 'app-profile-summary',
  templateUrl: './profile-summary.component.html',
  styleUrls: ['./profile-summary.component.scss'],
})
export class ProfileSummaryComponent implements OnInit, OnDestroy {
  form: FormGroup;

  validFileExtensions: ValidFileExtension[] = ['png', 'jpg', 'jpeg'];
  validMimeTypes: ValidMimeType[] = ['image/png', 'image/jpeg'];

  fullName$ = new BehaviorSubject<string>(null);
  fullName = '';

  userFullImagePath: string;
  private userImagePathSubscription: Subscription;

  constructor(
    private readonly authService: AuthService,
    public readonly bannerColorService: BannerColorService,
  ) { }

  ngOnInit() {
    this.form = new FormGroup({
      file: new FormControl(null)
    });

    this.authService.userRole
      .pipe(take(1))
      .subscribe((role: Role) => {
        this.bannerColorService.bannerColors =
          this.bannerColorService.getBannerColors(role);
      });

    this.authService.userFullName
      .pipe(take(1))
      .subscribe((fullName: string) => {
        this.fullName = fullName;
        this.fullName$.next(fullName);
      });

    this.userImagePathSubscription = this.authService.userFullImagePath
      .subscribe((fullPath: string) => {
        this.userFullImagePath = fullPath;
      });
  }

  ngOnDestroy() {
    this.userImagePathSubscription.unsubscribe();
  }

  onFileSelect(event: Event): void {
    const file: File = (event.target as HTMLInputElement).files[0];
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    from(file.arrayBuffer())
      .pipe(
        switchMap((buffer: ArrayBuffer) => from(fromBuffer(buffer))),
        tap({
          next: (fileTypeResult: FileTypeResult | null) => {
            if (!fileTypeResult) {
              throw new Error('File format not supported!');
            }

            const isFileTypeLegit = this.validFileExtensions.includes(fileTypeResult.ext as ValidFileExtension);
            const isMimeTypeLegit = this.validMimeTypes.includes(fileTypeResult.mime as ValidMimeType);

            if (!(isFileTypeLegit && isMimeTypeLegit)) {
              throw new Error('File format does not match file extension!');
            }
          },
          error: (error) => console.error({ error })
        }),
        switchMap(() => this.authService.uploadUserImage(formData)),
        catchError((error) => {
          console.error('Error during file processing:', error.message);
          return EMPTY;
        })
      )
      .subscribe();

    this.form.reset();
  }
}

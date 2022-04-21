import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserTransferStateModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MarkdownModule } from 'ngx-markdown';
import { CoreModule } from 'src/app/core/core.module';
import { FirebaseModule } from 'src/app/platform/firebase/firebase.module';
import { AuthComponent } from '../auth.component';

import { AuthSettingsComponent } from './auth-settings.component';
import { AuthSettingsModule } from './auth-settings.module';

describe('AuthSettingsComponent', () => {
  let component: AuthSettingsComponent;
  let fixture: ComponentFixture<AuthSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AuthSettingsComponent],
      imports: [
        CoreModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        MatDialogModule,
        FirebaseModule,
        MarkdownModule.forRoot(),
        BrowserTransferStateModule,
        RouterModule.forRoot([]),
        AuthSettingsModule,
        RouterTestingModule.withRoutes(
          [{ path: 'login', component: AuthComponent }]
        ),
        BrowserAnimationsModule
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

/*
    private fb: FormBuilder,
    private sb: SnackbarService,
    public auth: AuthService,
    private dialog: DialogService,
    private d: MatDialog,
    private nav: NavService,
    public is: ImageUploadService,
    private read: ReadService,
    private db: DbService,
    private router: Router
    */

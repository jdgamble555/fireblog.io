import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthEditService } from '@db/auth/auth-edit.service';
import { DbModule } from '@db/db.module';
import { UserEditService } from '@db/user/user-edit.service';
import { SharedModule } from '@shared/shared.module';
import { MarkdownModule } from 'ngx-markdown';
import { ReLoginComponent } from './re-login.component';

describe('ReLoginComponent', () => {
  let component: ReLoginComponent;
  let fixture: ComponentFixture<ReLoginComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ReLoginComponent],
      imports: [
        SharedModule,
        ReactiveFormsModule,
        DbModule,
        MarkdownModule.forRoot(),
        MatSnackBarModule,
        BrowserAnimationsModule,
        RouterTestingModule
      ],
      providers: [
        AuthEditService,
        UserEditService,
        { provide: MatDialogRef, useValue: ReLoginComponent },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { CoreModule } from '@core/core.module';
import { DbModule } from '@db/db.module';
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
        CoreModule,
        SharedModule,
        ReactiveFormsModule,
        DbModule,
        MarkdownModule.forRoot(),
        MatSnackBarModule,
        BrowserAnimationsModule,
        RouterTestingModule
      ],
      providers: [
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

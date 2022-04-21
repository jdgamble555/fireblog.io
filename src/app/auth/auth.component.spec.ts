import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthModule } from '@angular/fire/auth';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserTransferStateModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';
import { CoreModule } from '../core/core.module';
import { AuthService } from '../platform/firebase/auth.service';
import { FirebaseModule } from '../platform/firebase/firebase.module';

import { AuthComponent } from './auth.component';

describe('AuthComponent', () => {
  let component: AuthComponent;
  let fixture: ComponentFixture<AuthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AuthComponent],
      imports: [
        CoreModule,
        AuthModule,
        FirebaseModule,
        MarkdownModule.forRoot(),
        ReactiveFormsModule,
        RouterModule.forRoot([]),
        BrowserTransferStateModule,
        MatSnackBarModule,
        BrowserAnimationsModule
      ],
      providers: [AuthService]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

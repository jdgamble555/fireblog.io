import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StorageModule } from '@angular/fire/storage';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserTransferStateModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';
import { CoreModule } from 'src/app/core/core.module';
import { AuthService } from 'src/app/platform/firebase/auth.service';
import { FirebaseModule } from 'src/app/platform/firebase/firebase.module';

import { PostFormComponent } from './post-form.component';
import { PostFormModule } from './post-form.module';

describe('PostFormComponent', () => {
  let component: PostFormComponent;
  let fixture: ComponentFixture<PostFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PostFormComponent],
      imports: [
        CoreModule,
        ReactiveFormsModule,
        RouterModule.forRoot([]),
        StorageModule,
        FirebaseModule,
        MarkdownModule.forRoot(),
        MatSnackBarModule,
        BrowserTransferStateModule,
        MatDialogModule,
        PostFormModule,
        BrowserAnimationsModule
      ],
      providers: [AuthService]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PostFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

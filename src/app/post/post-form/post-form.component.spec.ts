import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StorageModule } from '@angular/fire/storage';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { CoreModule } from '@core/core.module';
import { AuthService } from '@db/auth/auth.service';
import { DbModule } from '@db/db.module';
import { MarkdownModule } from 'ngx-markdown';

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
        DbModule,
        MarkdownModule.forRoot(),
        MatSnackBarModule,
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

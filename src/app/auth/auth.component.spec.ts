import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthModule } from '@angular/fire/auth';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { CoreModule } from '@core/core.module';
import { AuthService } from '@db/auth/auth.service';
import { DbModule } from '@db/db.module';
import { MarkdownModule } from 'ngx-markdown';



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
        DbModule,
        MarkdownModule.forRoot(),
        ReactiveFormsModule,
        RouterModule.forRoot([]),
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

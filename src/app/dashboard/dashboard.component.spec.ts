import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { DbModule } from '@db/db.module';
import { MarkdownModule } from 'ngx-markdown';
import { AuthComponent } from '../auth/auth.component';
import { CoreModule } from '../core/core.module';

import { PostListComponent } from '../post/post-list/post-list.component';

import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DashboardComponent, PostListComponent],
      imports: [
        CoreModule,
        DbModule,
        MarkdownModule.forRoot(),
        RouterModule.forRoot([]),
        RouterTestingModule.withRoutes(
          [{ path: 'login', component: AuthComponent }]
        ),
        BrowserAnimationsModule
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

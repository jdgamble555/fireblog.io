import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { DbModule } from '@db/db.module';
import { MarkdownModule } from 'ngx-markdown';
import { CoreModule } from '../core/core.module';

import { PostListComponent } from '../post/post-list/post-list.component';

import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomeComponent, PostListComponent],
      imports: [
        CoreModule,
        RouterModule.forRoot([]),
        BrowserAnimationsModule,
        DbModule,
        MarkdownModule.forRoot()
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

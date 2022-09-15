import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { DbModule } from '@db/db.module';
import { PostDbService } from '@db/post/post-db.service';
import { MarkdownService } from 'ngx-markdown';
import { CoreModule } from '../core/core.module';

import { NavComponent } from './nav.component';
import { NavModule } from './nav.module';

describe('NavComponent', () => {
  let component: NavComponent;
  let fixture: ComponentFixture<NavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NavComponent],
      imports: [NavModule, CoreModule, DbModule, RouterModule.forRoot([])],
      providers: [MarkdownService, PostDbService]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

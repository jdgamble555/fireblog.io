import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserTransferStateModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { MarkdownModule, MarkdownService } from 'ngx-markdown';
import { CoreModule } from 'src/app/core/core.module';
import { FirebaseModule } from 'src/app/platform/firebase/firebase.module';
import { ReadService } from 'src/app/platform/firebase/read.service';
import { TagListComponent } from 'src/app/post/tag-list/tag-list.component';

import { LeftnavComponent } from './leftnav.component';

describe('LeftnavComponent', () => {
  let component: LeftnavComponent;
  let fixture: ComponentFixture<LeftnavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LeftnavComponent, TagListComponent],
      imports: [CoreModule, FirebaseModule, MarkdownModule.forRoot(), BrowserTransferStateModule, RouterModule.forRoot([])],
      providers: [ReadService]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LeftnavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

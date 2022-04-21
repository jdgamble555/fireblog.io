import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserTransferStateModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';
import { CoreModule } from 'src/app/core/core.module';
import { FirebaseModule } from 'src/app/platform/firebase/firebase.module';
import { ReadService } from 'src/app/platform/firebase/read.service';

import { TagListComponent } from './tag-list.component';

describe('TagListComponent', () => {
  let component: TagListComponent;
  let fixture: ComponentFixture<TagListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TagListComponent],
      imports: [CoreModule, FirebaseModule, MarkdownModule.forRoot(), BrowserTransferStateModule, RouterModule.forRoot([])],
      providers: [ReadService]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TagListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

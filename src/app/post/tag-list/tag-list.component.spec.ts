import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { CoreModule } from '@core/core.module';
import { DbModule } from '@db/db.module';
import { ReadService } from '@db/read.service';
import { MarkdownModule } from 'ngx-markdown';


import { TagListComponent } from './tag-list.component';

describe('TagListComponent', () => {
  let component: TagListComponent;
  let fixture: ComponentFixture<TagListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TagListComponent],
      imports: [CoreModule, DbModule, MarkdownModule.forRoot(), RouterModule.forRoot([])],
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

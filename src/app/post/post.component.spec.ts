import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DbModule } from '@db/db.module';
import { MarkdownModule } from 'ngx-markdown';
import { AppRoutingModule } from '../app-routing.module';
import { CoreModule } from '../core/core.module';
import { PostComponent } from './post.component';

describe('PostComponent', () => {
  let component: PostComponent;
  let fixture: ComponentFixture<PostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PostComponent],
      imports: [
        CoreModule,
        AppRoutingModule,
        DbModule,
        MarkdownModule.forRoot()
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

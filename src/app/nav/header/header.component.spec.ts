import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserTransferStateModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { MarkdownModule, MarkdownService } from 'ngx-markdown';
import { CoreModule } from 'src/app/core/core.module';
import { AuthService } from 'src/app/platform/firebase/auth.service';
import { FirebaseModule } from 'src/app/platform/firebase/firebase.module';

import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      imports: [
        CoreModule,
        FirebaseModule,
        MarkdownModule.forRoot(),
        BrowserTransferStateModule,
        RouterModule.forRoot([])
      ],
      providers: [AuthService, MarkdownService]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';
import { Auth } from '@angular/fire/auth';
import { BrowserTransferStateModule } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { MarkdownModule, MarkdownService } from 'ngx-markdown';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { NavModule } from './nav/nav.module';
import { AuthService } from './platform/firebase/auth.service';
import { FirebaseModule } from './platform/firebase/firebase.module';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NavModule,
        CoreModule,
        RouterTestingModule,
        BrowserTransferStateModule,
        FirebaseModule,
        MarkdownModule.forRoot()
      ],
      declarations: [
        AppComponent
      ],
      providers: [AuthService, MarkdownService]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  /*it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.content span')?.textContent).toContain('fireblog.io');
  });*/
});

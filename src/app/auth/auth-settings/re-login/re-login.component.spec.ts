import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ReLoginComponent } from './re-login.component';

describe('ReLoginComponent', () => {
  let component: ReLoginComponent;
  let fixture: ComponentFixture<ReLoginComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ReLoginComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

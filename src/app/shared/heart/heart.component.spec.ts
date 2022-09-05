import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeartComponent } from './heart.component';

describe('HeartComponent', () => {
  let component: HeartComponent;
  let fixture: ComponentFixture<HeartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HeartComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DbModule } from '@db/db.module';
import { ActionDbService } from '@db/post/action-db.service';

import { HeartComponent } from './heart.component';

describe('HeartComponent', () => {
  let component: HeartComponent;
  let fixture: ComponentFixture<HeartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DbModule],
      declarations: [HeartComponent],
      providers: [ActionDbService]
    }).compileComponents();

    fixture = TestBed.createComponent(HeartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

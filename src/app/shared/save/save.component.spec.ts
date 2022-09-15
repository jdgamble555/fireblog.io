import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DbModule } from '@db/db.module';
import { ActionDbService } from '@db/post/action-db.service';

import { SaveComponent } from './save.component';

describe('SaveComponent', () => {
  let component: SaveComponent;
  let fixture: ComponentFixture<SaveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DbModule],
      declarations: [SaveComponent],
      providers: [ActionDbService]
    }).compileComponents();

    fixture = TestBed.createComponent(SaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

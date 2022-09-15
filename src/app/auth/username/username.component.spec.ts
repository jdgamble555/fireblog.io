import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CoreModule } from '@core/core.module';
import { DbModule } from '@db/db.module';
import { UserEditService } from '@db/user/user-edit.service';

import { UsernameComponent } from './username.component';

describe('UsernameComponent', () => {
  let component: UsernameComponent;
  let fixture: ComponentFixture<UsernameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoreModule, DbModule, BrowserAnimationsModule],
      declarations: [UsernameComponent],
      providers: [FormBuilder, UserEditService]
    })
      .compileComponents();

    fixture = TestBed.createComponent(UsernameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

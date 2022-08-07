import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthService } from '@db/auth.service';
import { CoreModule } from 'src/app/core/core.module';


import { RightnavComponent } from './rightnav.component';

describe('RightnavComponent', () => {
  let component: RightnavComponent;
  let fixture: ComponentFixture<RightnavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RightnavComponent],
      imports: [CoreModule],
      providers: [AuthService]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RightnavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

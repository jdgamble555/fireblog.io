import { TestBed } from '@angular/core/testing';
import { DbModule } from '@db/db.module';
import { UserDbService } from '@db/user/user-db.service';
import { UserPostGuard } from './post-list.guard';


describe('PostListGuard', () => {
  let guard: UserPostGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DbModule],
      providers: [UserDbService]
    });
    guard = TestBed.inject(UserPostGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});

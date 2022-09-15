import { TestBed } from '@angular/core/testing';
import { SupabaseService } from '../supabase.service';
import { UserDbService } from '../user/user-db.service';
import { AuthEditService } from './auth-edit.service';
import { AuthService } from './auth.service';

describe('AuthEditService', () => {
  let service: AuthEditService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthEditService, AuthService, UserDbService, SupabaseService]
    });
    service = TestBed.inject(AuthEditService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

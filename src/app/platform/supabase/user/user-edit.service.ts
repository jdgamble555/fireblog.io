import { Injectable } from '@angular/core';
import { UserRec } from '@auth/user.model';
import { AuthEditModule } from '@db/auth-edit.module';
import { firstValueFrom } from 'rxjs';
import { user_messages } from './user.messages';

@Injectable({
  providedIn: AuthEditModule
})
export class UserEditService {

  messages = user_messages;

  constructor(

  ) { }

  async getUid() {

  }

  async updateUser(user: any): Promise<{ error: any }> {
    const uid = await this.getUid();
    let error = null;
    return { error };
  }

  async deleteUser(): Promise<void> {

  }

  async validUsername(name: string): Promise<{ error: any, data: boolean | null }> {
    let data = null;
    let error = null;
    return { data, error };
  }

  async updateUsername(username: string, currentUsername?: string): Promise<{ error: any, message: string | null }> {
    let error = null;
    let message = null;
    return { error, message };
  }

  async hasUsername(): Promise<{ error: any, data: boolean | null }> {
    let error = null;
    let data = null;
    return { error, data };
  }
}

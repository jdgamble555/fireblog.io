import { Injectable } from '@angular/core';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { NavService } from '@nav/nav.service';

@Injectable({
  providedIn: 'root'
})
export class StateService {

  constructor(
    private transferState: TransferState,
    private ns: NavService
  ) { }

  saveState<T>(key: string, data: any): void {
    this.transferState.set<T>(makeStateKey(key), data);
  }

  getState<T>(key: string, defaultValue: any = []): T {
    const state = this.transferState.get<T>(makeStateKey(key), defaultValue);
    this.deleteState(key);
    return state;
  }

  hasState<T>(key: string) {
    return this.transferState.hasKey<T>(makeStateKey(key));
  }

  deleteState<T>(key: string) {
    this.transferState.remove<T>(makeStateKey(key));
  }

  async loadState<T>(key: string, promise: Promise<T>) {
    if (this.ns.isBrowser && this.hasState<T>(key)) {
      return this.getState<T>(key);
    }
    const data = await promise;
    if (this.ns.isServer) {
      this.saveState<T>(key, data);
    }
    return data;
  }
}

import { Injectable, computed, signal } from '@angular/core';
import { CookieService } from './cookie.service';

const USERNAME_COOKIE = 'indepth_coding_username';

/**
 * Tracks the learner's display name. No backend, so identity lives entirely
 * in a browser cookie. First visit -> prompt for a name -> store it ->
 * every later visit reads it straight back from the cookie.
 */
@Injectable({ providedIn: 'root' })
export class UserSessionService {
  private readonly nameSignal = signal<string | null>(null);

  readonly name = computed(() => this.nameSignal());
  readonly hasName = computed(() => !!this.nameSignal());

  constructor(private readonly cookies: CookieService) {
    this.nameSignal.set(this.cookies.get(USERNAME_COOKIE));
  }

  setName(name: string): void {
    const trimmed = name.trim();
    if (!trimmed) return;
    this.cookies.set(USERNAME_COOKIE, trimmed);
    this.nameSignal.set(trimmed);
  }

  clearName(): void {
    this.cookies.delete(USERNAME_COOKIE);
    this.nameSignal.set(null);
  }
}

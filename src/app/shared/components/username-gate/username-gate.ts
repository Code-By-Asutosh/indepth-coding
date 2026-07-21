import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserSessionService } from '../../../core/services/user-session.service';

@Component({
  selector: 'app-username-gate',
  imports: [FormsModule],
  templateUrl: './username-gate.html',
  styleUrl: './username-gate.scss'
})
export class UsernameGate {
  protected readonly session = inject(UserSessionService);
  protected readonly draftName = signal('');

  protected confirm(): void {
    if (!this.draftName().trim()) return;
    this.session.setName(this.draftName());
  }
}

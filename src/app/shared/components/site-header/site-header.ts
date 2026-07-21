import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserSessionService } from '../../../core/services/user-session.service';

@Component({
  selector: 'app-site-header',
  imports: [RouterLink],
  templateUrl: './site-header.html',
  styleUrl: './site-header.scss'
})
export class SiteHeader {
  protected readonly session = inject(UserSessionService);

  protected initial(): string {
    const name = this.session.name();
    return name ? name.trim().charAt(0).toUpperCase() : '?';
  }
}

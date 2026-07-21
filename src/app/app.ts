import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SiteHeader } from './shared/components/site-header/site-header';
import { UsernameGate } from './shared/components/username-gate/username-gate';
import { AiHelpFab } from './shared/components/ai-help-fab/ai-help-fab';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SiteHeader, UsernameGate, AiHelpFab],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}

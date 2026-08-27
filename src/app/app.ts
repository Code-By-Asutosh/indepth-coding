import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SiteHeader } from './shared/components/site-header/site-header';
import { SiteFooter } from './shared/components/site-footer/site-footer';
import { UsernameGate } from './shared/components/username-gate/username-gate';
import { AiHelpFab } from './shared/components/ai-help-fab/ai-help-fab';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SiteHeader, SiteFooter, UsernameGate, AiHelpFab],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}

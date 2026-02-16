import { Component } from '@angular/core';
import { LayoutService } from '../../../services/layout.service';
import { CommonModule } from '@angular/common';
import { FeathericonComponent } from '../../feathericon/feathericon.component';

@Component({
  selector: 'app-theme',
  standalone: true,
  imports: [CommonModule ,FeathericonComponent],
  templateUrl: './theme.component.html',
  styleUrls: ['./theme.component.scss']
})
export class ThemeComponent {

  public dark: boolean = this.layout.config.settings.layout_version == 'dark-only' ? true : false;

  constructor(public layout: LayoutService) { }

  layoutToggle() {
    this.dark = !this.dark;
    this.dark
      ? document.body.classList.add('dark-only')
      : document.body.classList.remove('dark-only');
    this.layout.config.settings.layout_version = this.dark
      ? 'dark-only'
      : 'light-only';

  }

  ngOnInit(): void { }

}

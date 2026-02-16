import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {topBanqueData} from '../../../../shared/data/dashboard/banque/dashboard-banque';
import { SvgIconComponent } from '../../../../shared/component/svg-icon/svg-icon.component';

@Component({
  selector: 'app-top-banque-data',
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  templateUrl: './top-banque-data.component.html',
  styleUrls: ['./top-banque-data.component.scss']
})
export class TopBanqueDataComponent {
  public topBanqueData = topBanqueData;
}

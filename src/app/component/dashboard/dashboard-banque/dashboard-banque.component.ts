import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopBanqueDataComponent } from './top-banque-data/top-banque-data.component';
import { topBanqueData } from '../../../shared/data/dashboard/banque/dashboard-banque';
import { LastDossierBanqueComponent } from './last-dossier-banque/last-dossier-banque.component';

@Component({
  selector: 'app-dashboard-banque',
  standalone: true,
  imports: [CommonModule, TopBanqueDataComponent, LastDossierBanqueComponent],
  templateUrl: './dashboard-banque.component.html',
  styleUrls: ['./dashboard-banque.component.scss']
})
export class DashboardBanqueComponent {
  cards = topBanqueData;
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DossiersData } from '../../../../shared/data/dashboard/banque/dashboard-banque';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-last-dossier-banque',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './last-dossier-banque.component.html',
  styleUrls: ['./last-dossier-banque.component.scss']
})
export class LastDossierBanqueComponent {
  public rows = DossiersData;

  badgeClass(statut: string) {
    switch (statut) {
      case 'Ouvert':
        return 'badge-light-success';
      case 'Visa demandé':
        return 'badge-light-primary';
      case 'Visa refusé':
        return 'badge-light-danger';
      case 'Modification demandée':
        return 'badge-light-info';
      default:
        return 'badge-light-secondary';
    }
  }
}

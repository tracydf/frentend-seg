import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-di-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './di-list.component.html',
  styleUrls: ['./di-list.component.scss']
})
export class DiListComponent {
  rows = [
    {
      dossier: 'DI-458152-MA',
      type: 'Importation',
      importateur: 'ABC SARL',
      exportateur: 'Global Exports Ltd',
      creeLe: '01-05-2025',
      modifieLe: '05-05-2025',
      statut: 'Elaboré',
      statutModifieLe: '05-05-2025',
      signature: 0
    },
    {
      dossier: 'DI-485264-MA',
      type: 'Importation',
      importateur: 'LogiTrade SA',
      exportateur: 'Shenzhen Tech Co',
      creeLe: '03-05-2025',
      modifieLe: '06-05-2025',
      statut: 'Visa demandé',
      statutModifieLe: '06-05-2025',
      signature: 50
    },
    {
      dossier: 'DI-458187-MA',
      type: 'Importation',
      importateur: 'LogiTrade SA',
      exportateur: 'Shenzhen Tech Co',
      creeLe: '03-05-2025',
      modifieLe: '06-05-2025',
      statut: 'Ouvert',
      statutModifieLe: '06-05-2025',
      signature: 100
    },
    {
      dossier: 'DI-458781-MA',
      type: 'Importation',
      importateur: 'Comex Africa',
      exportateur: 'Euro Parts GmbH',
      creeLe: '04-05-2025',
      modifieLe: '07-05-2025',
      statut: 'Visa refusé',
      statutModifieLe: '07-05-2025',
      signature: 0
    },
    {
      dossier: 'DI-458215-AR',
      type: 'Importation',
      importateur: 'Tilia Africa',
      exportateur: 'TOD SARL',
      creeLe: '14-02-2025',
      modifieLe: '16-02-2025',
      statut: 'Modification demandée',
      statutModifieLe: '16-02-2025',
      signature: 60
    },
    {
      dossier: 'DI-458215-AR',
      type: 'Importation',
      importateur: 'Tilia Africa',
      exportateur: 'TOD SARL',
      creeLe: '14-02-2025',
      modifieLe: '16-02-2025',
      statut: 'Modification demandée',
      statutModifieLe: '16-02-2025',
      signature: 60
    },
    {
      dossier: 'DI-458215-AR',
      type: 'Importation',
      importateur: 'Tilia Africa',
      exportateur: 'TOD SARL',
      creeLe: '14-02-2025',
      modifieLe: '16-02-2025',
      statut: 'Modification demandée',
      statutModifieLe: '16-02-2025',
      signature: 60
    },
    {
      dossier: 'DI-458215-AR',
      type: 'Importation',
      importateur: 'Tilia Africa',
      exportateur: 'TOD SARL',
      creeLe: '14-02-2025',
      modifieLe: '16-02-2025',
      statut: 'Modification demandée',
      statutModifieLe: '16-02-2025',
      signature: 60
    },
        {
      dossier: 'DI-458215-AR',
      type: 'Importation',
      importateur: 'Tilia Africa',
      exportateur: 'TOD SARL',
      creeLe: '14-02-2025',
      modifieLe: '16-02-2025',
      statut: 'Modification demandée',
      statutModifieLe: '16-02-2025',
      signature: 60
    },
    {
      dossier: 'DI-458215-AR',
      type: 'Importation',
      importateur: 'Tilia Africa',
      exportateur: 'TOD SARL',
      creeLe: '14-02-2025',
      modifieLe: '16-02-2025',
      statut: 'Modification demandée',
      statutModifieLe: '16-02-2025',
      signature: 60
    },
  ];

  // Pagination (8 lignes par page)
  page = 1;
  readonly pageSize = 8;

  get totalRows(): number {
    return this.rows.length;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalRows / this.pageSize));
  }

  get pagedRows() {
    const start = (this.page - 1) * this.pageSize;
    return this.rows.slice(start, start + this.pageSize);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get rangeLabel(): string {
    const start = this.totalRows === 0 ? 0 : (this.page - 1) * this.pageSize + 1;
    const end = Math.min(this.page * this.pageSize, this.totalRows);
    return `${start}-${end} sur ${this.totalRows}`;
  }

  goTo(page: number) {
    this.page = Math.min(Math.max(1, page), this.totalPages);
  }

  prev() { this.goTo(this.page - 1); }
  next() { this.goTo(this.page + 1); }
}

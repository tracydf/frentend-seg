import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiListComponent } from './di-list/di-list.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-declaration-importation',
  standalone: true,
  imports: [CommonModule, RouterModule, DiListComponent],
  templateUrl: './declaration-importation.component.html',
  styleUrls: ['./declaration-importation.component.scss']
})
export class DeclarationImportationComponent {}

import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { modules } from '../../../../../../shared/data/database';

@Component({
  selector: 'app-resume-dossiers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './resume-dossiers.component.html',
  styleUrls: ['./resume-dossiers.component.scss']
})
export class ResumeDossiersComponent implements OnChanges {
  form: FormGroup;
  @Input() data: any;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      // Bloc 1: Dossier (Elaboré)
      noDossier: [{ value: '', disabled: true }],
      type: [''],
      module: [''],
      dateDebut: [''],
      dateFin: [''],
      creePar: [''],
      creeLe: [''],
      modifieLe: [''],
      etatModifie: [''],

      // Bloc 2: Importateur
      importNom: [''],
      importAdresse: [''],
      importPays: [''],
      importNIU: [''],

      // Bloc 3: Exportateur
      exportNom: [''],
      exportAdresse: [''],
      exportPays: [''],
      exportNIU: [''],

      // Bloc 4: Transitaire
      transNom: [''],
      transAdresse: [''],
      transPays: [''],
      transNIU: [''],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      const modDesc = (() => {
        const code = this.data.module;
        const found = modules.find(m => m.code === code);
        return found ? found.description : (code || '');
      })();
      this.form.patchValue({
        module: modDesc,
        type: 'Importation',
        // Dates
        dateDebut: this.data.dateDebut || '',
        dateFin: this.data.dateFin || '',
        creeLe: this.data.creeLe || '',
        modifieLe: this.data.modifieLe || '',
        // Importateur
        importNom: this.data.importateur?.Nom || '',
        importAdresse: this.data.importateur?.Adresse || '',
        importPays: this.data.importateur?.Pays || '',
        importNIU: this.data.importateur?.NIU || '',
        // Exportateur
        exportNom: this.data.exportateur?.Nom || '',
        exportAdresse: this.data.exportateur?.Adresse || '',
        exportPays: this.data.exportateur?.Pays || '',
        exportNIU: this.data.exportateur?.NIU || '',
        // Transitaire
        transNom: this.data.transitaire?.Nom || '',
        transAdresse: this.data.transitaire?.Adresse || '',
        transPays: this.data.transitaire?.Pays || '',
        transNIU: this.data.transitaire?.NIU || '',
      });
      this.form.disable({ emitEvent: false });
    }
  }
}

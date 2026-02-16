import { Component, Input, OnChanges, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Devise, TauxChange, positions_tarifaires as PositionsTarifaires } from '../../../../../../shared/data/database';

@Component({
  selector: 'app-lignes-commande',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './lignes-commande.component.html',
  styleUrls: ['./lignes-commande.component.scss']
})
export class LignesCommandeComponent implements OnChanges {
  @Input() devise: string | null = null;
  @Input() noFacture: string | null = null;
  @Input() incoterms: string | null = null;
  @Input() fretDevise: number | null = null;
  @Input() assuranceDevise: number | null = null;
  @Input() autresChargesDevise: number | null = null;
  @Input() paysOrigine: string | null = null;
  @Input() valeurDevise: number | null = null;
  @Input() valeurXaf: number | null = null;
  @Input() linesInput: any[] | null = null;
  @Output() linesChange = new EventEmitter<any[]>();
  headerForm: FormGroup;
  lineForm: FormGroup;
  showModal = false;
  editingIndex: number | null = null;
  lines: Array<any> = [];

  devises = Devise || [];
  positions = PositionsTarifaires || [];
  suggestionsPosition: Array<{ code: string; designation: string; categorie: string }> = [];
  showSuggestionsPosition = false;

  constructor(private fb: FormBuilder) {
    this.headerForm = this.fb.group({
      noFacture: [{ value: '', disabled: true }],
      incoterms: [{ value: '', disabled: true }],
      devise: [{ value: 'USD', disabled: true }, Validators.required],
      fretDevise: [0, [Validators.min(0)]],
      assuranceDevise: [0, [Validators.min(0)]],
      paysOrigine: [{ value: '', disabled: true }]
    });

    this.lineForm = this.fb.group({
      positionTarifaire: ['', Validators.required],
      designation: ['', Validators.required],
      marque: [''],
      colisage: ['', Validators.required],
      masseBruteKg: [0, [Validators.required, Validators.min(0)]],
      masseNetteKg: [0, [Validators.min(0)]],
      volumeM3: [0, [Validators.min(0)]],
      quantite: [1, [Validators.required, Validators.min(0.0001)]],
      prixUnitaire: [0, [Validators.required, Validators.min(0)]],
      valeurDevise: [0, [Validators.required, Validators.min(0)]]
    });
  }

  private getLatestTaux() {
    return Array.isArray(TauxChange) && TauxChange.length > 0 ? TauxChange[TauxChange.length - 1] : null;
  }

  private rateForDevise(dev: string | null | undefined): number {
    const d = (dev || '').toUpperCase();
    if (!d) return 1;
    const latest = this.getLatestTaux();
    if (!latest) return 1;
    switch (d) {
      case 'XAF':
        return 1;
      case 'USD':
        return latest.USD_XAF ?? 1;
      case 'EUR':
        return latest.EUR_XAF ?? 1;
      case 'XOF':
        return latest.XAF_XOF ? 1 / latest.XAF_XOF : 1;
      default:
        return 1;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['devise']) {
      const d = this.devise || 'USD';
      this.headerForm.patchValue({ devise: d }, { emitEvent: false });
    }
    
    // Mettre à jour les valeurs du formulaire d'en-tête
    if (changes['noFacture'] || changes['incoterms'] || changes['fretDevise'] || 
        changes['assuranceDevise'] || changes['autresChargesDevise'] || 
        changes['paysOrigine'] || changes['valeurDevise'] || changes['valeurXaf']) {
      
      const updateValues: any = {};
      
      if (changes['noFacture'] || changes['incoterms'] || changes['fretDevise'] || 
          changes['assuranceDevise'] || changes['autresChargesDevise'] ||
          changes['valeurDevise'] || changes['valeurXaf']) {
        updateValues.noFacture = this.noFacture || '';
        updateValues.incoterms = this.incoterms || '';
        updateValues.fretDevise = this.fretDevise ?? 0;
        updateValues.assuranceDevise = this.assuranceDevise ?? 0;
        updateValues.autresChargesDevise = this.autresChargesDevise ?? 0;
        updateValues.valeurDevise = this.valeurDevise ?? 0;
        updateValues.valeurXaf = this.valeurXaf ?? 0;
      }
      
      // Toujours mettre à jour le pays d'origine s'il est disponible
      if (changes['paysOrigine'] && this.paysOrigine) {
        updateValues.paysOrigine = this.paysOrigine;
      }
      
      this.headerForm.patchValue(updateValues, { emitEvent: false });
    }
    
    if (changes['linesInput']) {
      const arr = (this.linesInput && Array.isArray(this.linesInput)) ? this.linesInput : [];
      this.lines = [...arr];
    }
  }

  openAddModal(): void {
    this.editingIndex = null;
    this.lineForm.reset({
      positionTarifaire: '',
      designation: '',
      marque: '',
      colisage: '',
      masseBruteKg: 0,
      masseNetteKg: 0,
      volumeM3: 0,
      quantite: 1,
      prixUnitaire: 0,
      valeurDevise: 0
    });
    this.showModal = true;
  }

  openEditModal(index: number): void {
    const line = this.lines[index];
    if (!line) return;
    this.editingIndex = index;
    this.lineForm.patchValue({
      commande: line.commande,
      positionTarifaire: line.positionTarifaire,
      designation: line.designation,
      marque: line.marque,
      colisage: line.colisage,
      masseBruteKg: line.masseBruteKg,
      masseNetteKg: line.masseNetteKg,
      volumeM3: line.volumeM3,
      quantite: line.quantite,
      prixUnitaire: line.prixUnitaire,
      valeurDevise: line.valeurDevise || 0
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  // Méthode appelée lorsque la valeur en devise change
  onValeurDeviseChange(): void {
    // Cette méthode est appelée par l'événement (input) pour forcer la mise à jour du champ XAF
    // Le changement sera détecté automatiquement par Angular
  }

  // Calcule la valeur en XAF en fonction du taux de change
  calculateValeurXAF(): number {
    const valeurDevise = this.lineForm.get('valeurDevise')?.value || 0;
    const devise = this.headerForm.get('devise')?.value;
    return valeurDevise * this.rateForDevise(devise);
  }

  private buildLinePayload(): any {
    const v = this.lineForm.value as any;
    const valeurDevise = Number(v.valeurDevise) || 0;
    const valeurXaf = this.calculateValeurXAF();
    
    return {
      ...v,
      paysOrigine: this.paysOrigine || '',
      valeurDevise,
      valeurXaf
    };
  }

  addAndContinue(): void {
    if (this.lineForm.invalid) {
      this.lineForm.markAllAsTouched();
      return;
    }
    const payload = this.buildLinePayload();
    if (this.editingIndex !== null) {
      this.lines[this.editingIndex] = payload;
      this.editingIndex = null;
    } else {
      this.lines.push(payload);
    }
    this.linesChange.emit([...this.lines]);
    this.lineForm.reset({
      positionTarifaire: '', designation: '', marque: '', colisage: '',
      masseBruteKg: 0, masseNetteKg: 0, volumeM3: 0, quantite: 1, 
      prixUnitaire: 0, valeurDevise: 0
    });
  }

  addAndClose(): void {
    if (this.lineForm.invalid) {
      this.lineForm.markAllAsTouched();
      return;
    }
    const payload = this.buildLinePayload();
    if (this.editingIndex !== null) {
      this.lines[this.editingIndex] = payload;
      this.editingIndex = null;
    } else {
      this.lines.push(payload);
    }
    this.linesChange.emit([...this.lines]);
    this.closeModal();
  }

  deleteLine(index: number): void {
    this.lines.splice(index, 1);
    this.linesChange.emit([...this.lines]);
  }

  // Helpers validations pour afficher les messages dans le template
  isInvalid(ctrl: string): boolean {
    const c = this.lineForm.get(ctrl);
    return !!(c && c.invalid && (c.touched || c.dirty));
  }

  // Autocomplétion Position tarifaire
  filterPositions(value: string) {
    if (!value) {
      this.suggestionsPosition = [];
      this.showSuggestionsPosition = false;
      return;
    }
    const v = value.toLowerCase();
    this.suggestionsPosition = this.positions
      .filter(p => p.code.toLowerCase().includes(v) || p.categorie.toLowerCase().includes(v) || p.designation.toLowerCase().includes(v))
      .slice(0, 8);
    this.showSuggestionsPosition = this.suggestionsPosition.length > 0;
  }

  selectPosition(item: { code: string }) {
    this.lineForm.get('positionTarifaire')?.setValue(item.code);
    this.showSuggestionsPosition = false;
  }

  hideSuggestionsPosition() {
    setTimeout(() => this.showSuggestionsPosition = false, 150);
  }
}

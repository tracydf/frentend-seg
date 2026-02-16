import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { modules, pays, Organisations } from '../../../../../../shared/data/database';

@Component({
  selector: 'app-dossiers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dossiers.component.html',
  styleUrls: ['./dossiers.component.scss']
})
export class DossiersComponent implements OnChanges {
  form: FormGroup;
  @Input() data: any;
  @Input() formGroup!: FormGroup;
  @Output() formValidity = new EventEmitter<boolean>();
  modules = modules;
  pays = pays;
  suggestions: Array<{ Nom: string; NIU: string } > = [];
  showSuggestions = false;
  suggestionsTransitaire: Array<{ Nom: string; NIU: string }> = [];
  showSuggestionsTransitaire = false;
  suggestionsPays: Array<{ country: string; code: string }> = [];
  showSuggestionsPays = false;
  private selectedTransitaire: { Nom: string; NIU: string; Telephone?: string; Email?: string } | null = null;
  private selectedImportateur: { Nom: string; NIU: string; Adresse?: string; Pays?: string; Telephone?: string; Email?: string } | null = null;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      niuTransitaire: [''],
      module: ['', Validators.required],
      niuImportateur: ['', Validators.required],
      exportateur: ['', Validators.required],
      coordonnees: ['', Validators.required],
      adresse: [''],
      pays: ['', Validators.required],
      notifSMS: [false],
      notifEmail: [false],
      mobile: [''],
      email: ['', [Validators.email]]
    });

    // Écouter les changements de validité du formulaire
    this.form.statusChanges.subscribe(() => {
      this.formValidity.emit(this.form.valid);
    });

    this.form.get('notifSMS')!.valueChanges.subscribe((val: boolean) => {
      const ctrl = this.form.get('mobile')!;
      if (val) {
        ctrl.enable();
        if (this.selectedTransitaire?.Telephone) {
          ctrl.setValue(this.selectedTransitaire.Telephone);
        }
      } else {
        ctrl.disable(); ctrl.reset('');
      }
    });
    this.form.get('notifEmail')!.valueChanges.subscribe((val: boolean) => {
      const ctrl = this.form.get('email')!;
      if (val) {
        ctrl.enable();
        if (this.selectedTransitaire?.Email) {
          ctrl.setValue(this.selectedTransitaire.Email);
        }
      } else { ctrl.disable(); ctrl.reset(''); }
    });

    this.form.get('niuImportateur')!.valueChanges.subscribe((val: string) => {
      const q = (val || '').trim().toLowerCase();
      if (!q) { this.suggestions = []; this.showSuggestions = false; return; }
      this.suggestions = Organisations
        .filter(o => o.Type === 'Importateur')
        .filter(o => o.NIU.toLowerCase().includes(q) || o.Nom.toLowerCase().includes(q))
        .slice(0, 8)
        .map(o => ({ Nom: o.Nom, NIU: o.NIU }));
      this.showSuggestions = this.suggestions.length > 0;
    });

    this.form.get('niuTransitaire')!.valueChanges.subscribe((val: string) => {
      const q = (val || '').trim().toLowerCase();
      if (!q) { this.suggestionsTransitaire = []; this.showSuggestionsTransitaire = false; return; }
      this.suggestionsTransitaire = Organisations
        .filter(o => o.Type === 'Transitaire')
        .filter(o => o.NIU.toLowerCase().includes(q) || o.Nom.toLowerCase().includes(q))
        .slice(0, 8)
        .map(o => ({ Nom: o.Nom, NIU: o.NIU }));
      this.showSuggestionsTransitaire = this.suggestionsTransitaire.length > 0;
    });

    this.form.get('pays')!.valueChanges.subscribe((val: string) => {
      const q = (val || '').trim().toLowerCase();
      if (!q) { this.suggestionsPays = []; this.showSuggestionsPays = false; return; }
      this.suggestionsPays = this.pays
        .filter(p => p.country.toLowerCase().includes(q) || (p.iso_alpha2 || '').toLowerCase().includes(q))
        .slice(0, 8)
        .map(p => ({ country: p.country, code: p.iso_alpha2 }));
      this.showSuggestionsPays = this.suggestionsPays.length > 0;
    });
  }

  selectImportateur(nom: string, niu: string): void {
    this.form.get('niuImportateur')!.setValue(`${nom} - ${niu}`);
    this.showSuggestions = false;
    const match = Organisations.find(o => o.Type === 'Importateur' && o.NIU === niu && o.Nom === nom);
    this.selectedImportateur = match ? { Nom: match.Nom, NIU: match.NIU, Adresse: match.Adresse, Pays: match.Pays, Telephone: match.Telephone, Email: match.Email } : { Nom: nom, NIU: niu };
  }

  hideSuggestions(): void {
    setTimeout(() => this.showSuggestions = false, 150);
  }

  selectTransitaire(nom: string, niu: string): void {
    this.form.get('niuTransitaire')!.setValue(`${nom} - ${niu}`);
    this.showSuggestionsTransitaire = false;
    const match = Organisations.find(o => o.Type === 'Transitaire' && o.NIU === niu && o.Nom === nom);
    this.selectedTransitaire = match ? { Nom: match.Nom, NIU: match.NIU, Telephone: match.Telephone, Email: match.Email } : { Nom: nom, NIU: niu };
    // If notifications already toggled on, refresh values
    if (this.form.get('notifSMS')!.value && this.selectedTransitaire?.Telephone) {
      this.form.get('mobile')!.setValue(this.selectedTransitaire.Telephone);
    }
    if (this.form.get('notifEmail')!.value && this.selectedTransitaire?.Email) {
      this.form.get('email')!.setValue(this.selectedTransitaire.Email);
    }
  }

  hideSuggestionsTransitaire(): void {
    setTimeout(() => this.showSuggestionsTransitaire = false, 150);
  }

  selectPays(country: string, code: string): void {
    this.form.get('pays')!.setValue(`${country} - ${code}`);
    this.showSuggestionsPays = false;
  }

  hideSuggestionsPays(): void {
    setTimeout(() => this.showSuggestionsPays = false, 150);
  }

  getStep1Summary() {
    return {
      module: this.form.get('module')!.value as string,
      importateur: this.selectedImportateur,
      transitaire: this.selectedTransitaire,
      exportateur: {
        Nom: this.form.get('exportateur')!.value as string,
        Adresse: this.form.get('adresse')!.value as string,
        Pays: this.form.get('pays')!.value as string,
        NIU: '',
        Telephone: this.form.get('mobile')?.value || '',
        Email: this.form.get('email')?.value || ''
      },
      // Inclure également les valeurs brutes du formulaire au cas où
      formValues: this.form.value
    };
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      const formValues = this.data.form || {};
      this.form.patchValue({
        niuTransitaire: formValues.niuTransitaire || '',
        module: formValues.module || '',
        niuImportateur: formValues.niuImportateur || '',
        exportateur: formValues.exportateur || '',
        coordonnees: formValues.coordonnees || '',
        adresse: formValues.adresse || '',
        pays: formValues.pays || '',
        notifSMS: !!formValues.notifSMS,
        notifEmail: !!formValues.notifEmail,
        mobile: formValues.mobile || '',
        email: formValues.email || ''
      }, { emitEvent: false });
      this.selectedImportateur = this.data.selectedImportateur || null;
      this.selectedTransitaire = this.data.selectedTransitaire || null;
      // Re-apply enable/disable for notif fields based on values
      if (this.form.get('notifSMS')!.value) this.form.get('mobile')!.enable({ emitEvent: false });
      if (this.form.get('notifEmail')!.value) this.form.get('email')!.enable({ emitEvent: false });
    }
  }

  getRaw() {
    return {
      form: this.form.getRawValue(),
      selectedImportateur: this.selectedImportateur,
      selectedTransitaire: this.selectedTransitaire
    };
  }

  // Méthode pour définir les valeurs du formulaire à partir des données sauvegardées
  setFormValues(data: any): void {
    if (!data) return;
    
    console.log('Restaurer les données:', data);
    
    // Désactiver temporairement la détection des changements
    this.form.disable({ emitEvent: false });
    
    try {
      // Mettre à jour les champs du formulaire sans déclencher les écouteurs d'événements
      this.form.patchValue({
        niuTransitaire: data.niuTransitaire || '',
        module: data.module || '',
        niuImportateur: data.niuImportateur || '',
        exportateur: data.exportateur || '',
        coordonnees: data.coordonnees || '',
        adresse: data.adresse || '',
        pays: data.pays || '',
        notifSMS: data.notifSMS || false,
        notifEmail: data.notifEmail || false,
        mobile: data.mobile || '',
        email: data.email || ''
      }, { emitEvent: false });

      // Mettre à jour les objets sélectionnés
      if (data.selectedImportateur) {
        this.selectedImportateur = { 
          Nom: data.selectedImportateur.Nom || '',
          NIU: data.selectedImportateur.NIU || '',
          Adresse: data.selectedImportateur.Adresse,
          Pays: data.selectedImportateur.Pays,
          Telephone: data.selectedImportateur.Telephone,
          Email: data.selectedImportateur.Email
        };
        
        // Mettre à jour le champ d'affichage pour l'importateur
        if (data.niuImportateur) {
          this.form.get('niuImportateur')?.setValue(data.niuImportateur, { emitEvent: false });
        } else if (this.selectedImportateur.Nom && this.selectedImportateur.NIU) {
          this.form.get('niuImportateur')?.setValue(
            `${this.selectedImportateur.Nom} - ${this.selectedImportateur.NIU}`, 
            { emitEvent: false }
          );
        }
      }
      
      if (data.selectedTransitaire) {
        this.selectedTransitaire = { 
          Nom: data.selectedTransitaire.Nom || '',
          NIU: data.selectedTransitaire.NIU || '',
          Telephone: data.selectedTransitaire.Telephone,
          Email: data.selectedTransitaire.Email
        };
        
        // Mettre à jour le champ d'affichage pour le transitaire
        if (data.niuTransitaire) {
          this.form.get('niuTransitaire')?.setValue(data.niuTransitaire, { emitEvent: false });
        } else if (this.selectedTransitaire.Nom && this.selectedTransitaire.NIU) {
          this.form.get('niuTransitaire')?.setValue(
            `${this.selectedTransitaire.Nom} - ${this.selectedTransitaire.NIU}`, 
            { emitEvent: false }
          );
        }
        
        // Mettre à jour les champs de notification si nécessaire
        if (data.notifSMS && this.selectedTransitaire.Telephone) {
          this.form.get('mobile')?.setValue(this.selectedTransitaire.Telephone, { emitEvent: false });
        }
        
        if (data.notifEmail && this.selectedTransitaire.Email) {
          this.form.get('email')?.setValue(this.selectedTransitaire.Email, { emitEvent: false });
        }
      }
      
      // Activer/désactiver les champs de notification en fonction des valeurs
      const mobileControl = this.form.get('mobile');
      const emailControl = this.form.get('email');
      
      if (data.notifSMS) {
        mobileControl?.enable({ emitEvent: false });
      } else {
        mobileControl?.disable({ emitEvent: false });
        mobileControl?.setValue('', { emitEvent: false });
      }
      
      if (data.notifEmail) {
        emailControl?.enable({ emitEvent: false });
      } else {
        emailControl?.disable({ emitEvent: false });
        emailControl?.setValue('', { emitEvent: false });
      }
      
      // Mettre à jour les suggestions si nécessaire
      if (data.niuImportateur) {
        const importateurValue = data.niuImportateur;
        const q = importateurValue.trim().toLowerCase();
        if (q) {
          this.suggestions = Organisations
            .filter(o => o.Type === 'Importateur')
            .filter(o => o.NIU.toLowerCase().includes(q) || o.Nom.toLowerCase().includes(q))
            .slice(0, 8)
            .map(o => ({ Nom: o.Nom, NIU: o.NIU }));
          this.showSuggestions = this.suggestions.length > 0;
        }
      }
      
      if (data.niuTransitaire) {
        const transitaireValue = data.niuTransitaire;
        const q = transitaireValue.trim().toLowerCase();
        if (q) {
          this.suggestionsTransitaire = Organisations
            .filter(o => o.Type === 'Transitaire')
            .filter(o => o.NIU.toLowerCase().includes(q) || o.Nom.toLowerCase().includes(q))
            .slice(0, 8)
            .map(o => ({ Nom: o.Nom, NIU: o.NIU }));
          this.showSuggestionsTransitaire = this.suggestionsTransitaire.length > 0;
        }
      }
      
      if (data.pays) {
        const paysValue = data.pays;
        const q = paysValue.trim().toLowerCase();
        if (q) {
          this.suggestionsPays = this.pays
            .filter(p => p.country.toLowerCase().includes(q) || (p.iso_alpha2 || '').toLowerCase().includes(q))
            .slice(0, 8)
            .map(p => ({ country: p.country, code: p.iso_alpha2 }));
          this.showSuggestionsPays = this.suggestionsPays.length > 0;
        }
      }
      
    } finally {
      // Réactiver la détection des changements
      this.form.enable({ emitEvent: false });
      
      // Forcer la mise à jour de la vue
      this.form.updateValueAndValidity({ emitEvent: false });
    }
  }
}

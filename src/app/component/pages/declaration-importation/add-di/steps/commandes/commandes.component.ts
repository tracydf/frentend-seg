import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { Devise, pays, Banques, Incoterms as IncotermsData, TauxChange } from '../../../../../../shared/data/database';

interface Pays {
  country: string;
  iso_alpha2: string;
  iso_alpha3: string;
  // Pour la compatibilité avec le code existant
  [key: string]: any;
}

interface Port {
  name: string;
  city: string;
  countryCode: string;
  type: 'maritimes' | 'fluviaux';
}

interface Aeroport {
  name: string;
  code: string;
  city: string;
  countryCode?: string;
}

interface DeviseItem {
  country_or_region: string;
  currency_name: string;
  alpha3: string;
  numeric?: string;
  minor_unit?: string;
  symbol?: string;
  label?: string; // Pour la compatibilité avec le code existant
}

interface IncotermItem {
  code: string;
  name: string;
  description: string;
  modeTransport: 'multimodal' | 'maritime-fluvial';
}

// Extension de l'interface FormGroup pour le typage fort
export interface CommandesFormGroup extends FormGroup {
  controls: {
    [key: string]: FormControl;
  };
}

@Component({
  selector: 'app-commandes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './commandes.component.html',
  styleUrls: ['./commandes.component.scss']
})
export class CommandesComponent implements OnChanges {
  @Input() set formGroup(value: FormGroup) {
    console.log('FormGroup reçu dans CommandesComponent:', value);
    this._formGroup = value;
    if (value) {
      console.log('FormGroup valide:', value.valid);
      console.log('Valeurs du formulaire:', value.value);
      
      // Initialiser les groupes de formulaires
      this.initializeFormGroups();
      // Abonner les recalculs une seule fois
      this.initializeValueSubscriptions();
      // Calcul initial Valeur XAF
      this.computeValeurXaf();
    }
  }
  
  get formGroup(): FormGroup {
    return this._formGroup;
  }
  
  private _formGroup!: FormGroup;
  private currentActiveModule: string | null = null;
  private _moduleType: string | null = null;

  @Input() 
  set moduleType(value: string | null) {
    console.log('moduleType reçu:', value);
    const previousModuleType = this._moduleType;
    this._moduleType = value;
    
    if (this._formGroup && value) {
      if (previousModuleType) {
        this.resetModuleSpecificFields(previousModuleType);
      }
      this.initializeFormGroups();
    }
  }

  // Réinitialise les champs spécifiques au module précédent
  private resetModuleSpecificFields(previousModule: string): void {
    switch (previousModule) {
      case 'AERIEN':
        this._formGroup.removeControl('aerien');
        break;
      case 'MARITIME':
        this._formGroup.removeControl('maritime');
        break;
      case 'FLUVIAL':
        this._formGroup.removeControl('fluvial');
        break;
      case 'ROUTIER':
        this._formGroup.removeControl('troncon');
        this._formGroup.removeControl('corridor');
        break;
    }
  }

  get moduleType(): string | null {
    return this._moduleType;
  }

  // Méthode utilitaire pour obtenir un contrôle de formulaire en toute sécurité
  private getFormControl(groupName: string, controlName: string): FormControl {
    const group = this.formGroup.get(groupName) as FormGroup;
    if (group && group.get(controlName)) {
      return group.get(controlName) as FormControl;
    }
    // Retourne un contrôle vide si le contrôle n'existe pas
    return new FormControl('');
  }

  // Getters pour les contrôles de formulaire
  getAeroportEmbarquementControl(): FormControl {
    return this.getFormControl('aerien', 'aeroportEmbarquement');
  }

  getAeroportDebarquementControl(): FormControl {
    return this.getFormControl('aerien', 'aeroportDebarquement');
  }

  getPortEmbarquementControl(): FormControl {
    return this.getFormControl('maritime', 'portEmbarquement');
  }

  getPortDebarquementControl(): FormControl {
    return this.getFormControl('maritime', 'portDebarquement');
  }

  getFleuveEmbarquementControl(): FormControl {
    return this.getFormControl('fluvial', 'fleuveEmbarquement');
  }

  getFleuveDebarquementControl(): FormControl {
    return this.getFormControl('fluvial', 'fleuveDebarquement');
  }
  
  // Données pour les listes déroulantes
  devises: DeviseItem[] = (Devise as unknown) as DeviseItem[];
  paysList: Pays[] = pays as unknown as Pays[];
  banquesList = Banques;
  private _subscriptionsInitialized = false;
  incotermsAll: IncotermItem[] = (IncotermsData as unknown) as IncotermItem[];
  
  // États pour l'autocomplétion des devises
  suggestionsDevise: DeviseItem[] = [];
  showSuggestionsDevise = false;
  
  // États pour l'autocomplétion des incoterms
  suggestionsIncoterms: IncotermItem[] = [];
  showSuggestionsIncoterms = false;
  
  // États pour l'autocomplétion des aéroports
  suggestionsAeroports: Aeroport[] = [];
  showSuggestionsAeroports = false;
  suggestionsAeroportsDebarq: Aeroport[] = [];
  showSuggestionsAeroportsDebarq = false;
  
  // États pour l'autocomplétion des ports
  suggestionsPorts: Port[] = [];
  showSuggestionsPorts = false;
  suggestionsPortsDebarq: Port[] = [];
  showSuggestionsPortsDebarq = false;
  
  
  // Méthode utilitaire pour obtenir un contrôle de formulaire par chemin complet
  getFormControlByPath(path: string): FormControl {
    const control = this.formGroup.get(path);
    if (!control) {
      throw new Error(`Le contrôle '${path}' n'existe pas dans le formulaire.`);
    }
    return control as FormControl;
  }

  // Méthode pour masquer les suggestions de devises
  hideSuggestionsDevise(): void {
    setTimeout(() => this.showSuggestionsDevise = false, 150);
  }

  // Méthode pour rechercher les ports
  searchPorts(event: Event, type: 'maritimes' | 'fluviaux', isDebarquement = false): void {
    const input = event.target as HTMLInputElement;
    const searchTerm = input.value.toLowerCase();
    
    // Récupérer le pays d'embarquement
    const paysEmbarquement = this.formGroup.get('paysEmbarquement')?.value;
    
    // Filtrer les ports en fonction du type et du pays
    let filteredPorts: Port[] = [];
    
    this.paysList.forEach(pays => {
      if (pays.country.toLowerCase() === paysEmbarquement?.toLowerCase()) {
        const ports = pays[`ports_${type}`] || [];
        filteredPorts = ports.map((port: any) => ({
          name: port.name,
          city: port.city || '',
          countryCode: pays.iso_alpha2,
          type: type as 'maritimes' | 'fluviaux'
        }));
      }
    });

    // Filtrer par terme de recherche
    if (searchTerm) {
      filteredPorts = filteredPorts.filter(port => 
        port.name.toLowerCase().includes(searchTerm) || 
        (port.city && port.city.toLowerCase().includes(searchTerm))
      );
    }

    if (isDebarquement) {
      this.suggestionsPortsDebarq = filteredPorts;
      this.showSuggestionsPortsDebarq = filteredPorts.length > 0;
    } else {
      this.suggestionsPorts = filteredPorts;
      this.showSuggestionsPorts = filteredPorts.length > 0;
    }
  }

  // Méthode pour sélectionner un port
  selectPort(port: Port, type: 'embarquement' | 'debarquement', portType: 'maritimes' | 'fluviaux'): void {
    const ctrlPath = type === 'embarquement' 
      ? `${portType === 'maritimes' ? 'maritime' : 'fluvial'}.${portType === 'maritimes' ? 'portEmbarquement' : 'fleuveEmbarquement'}` 
      : `${portType === 'maritimes' ? 'maritime' : 'fluvial'}.${portType === 'maritimes' ? 'portDebarquement' : 'fleuveDebarquement'}`;

    this.formGroup.get(ctrlPath)?.setValue(port.name);
    
    if (type === 'embarquement') {
      this.showSuggestionsPorts = false;
    } else {
      this.showSuggestionsPortsDebarq = false;
    }
  }

  // Masquer les suggestions de ports d'embarquement
  hideSuggestionsPorts(): void {
    setTimeout(() => this.showSuggestionsPorts = false, 150);
  }

  // Masquer les suggestions de ports de débarquement
  hideSuggestionsPortsDebarq(): void {
    setTimeout(() => this.showSuggestionsPortsDebarq = false, 150);
  }

  // Masquer les suggestions de pays d'embarquement
  hideSuggestionsPaysEmbarque(): void {
    setTimeout(() => this.showSuggestionsPaysEmbarque = false, 150);
  }

  // Masquer les suggestions de pays de débarquement
  hideSuggestionsPaysDebarq(): void {
    setTimeout(() => this.showSuggestionsPaysDebarq = false, 150);
  }

  // États pour l'autocomplétion des pays d'embarquement
  suggestionsPaysEmbarque: Pays[] = [];
  showSuggestionsPaysEmbarque = false;
  
  // États pour l'autocomplétion des pays de débarquement
  suggestionsPaysDebarq: Pays[] = [];
  showSuggestionsPaysDebarq = false;
  
  // États pour l'autocomplétion des pays de destination
  suggestionsPaysDest: Pays[] = [];
  showSuggestionsPaysDest = false;
  
  // Masquer les suggestions d'aéroports avec un léger délai
  hideSuggestionsAeroports(): void {
    setTimeout(() => this.showSuggestionsAeroports = false, 150);
  }
  
  // Masquer les suggestions d'aéroports de débarquement avec un léger délai
  hideSuggestionsAeroportsDebarq(): void {
    setTimeout(() => this.showSuggestionsAeroportsDebarq = false, 150);
  }
  
  // Méthode pour rechercher les aéroports (unifiée pour embarquement et débarquement)
  searchAeroports(event: Event, type: 'embarquement' | 'debarquement' = 'embarquement'): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.toLowerCase();
    
    if (!value) {
      if (type === 'embarquement') {
        this.suggestionsAeroports = [];
        this.showSuggestionsAeroports = false;
      } else {
        this.suggestionsAeroportsDebarq = [];
        this.showSuggestionsAeroportsDebarq = false;
      }
      return;
    }
    
    // Récupérer tous les aéroports de tous les pays
    const allAeroports = this.paysList.flatMap((pays: any) => 
      ((pays['airports'] as Aeroport[]) || []).map((aeroport: Aeroport) => ({
        ...aeroport,
        countryCode: pays.iso_alpha2
      }))
    );
    
    // Filtrer les aéroports en fonction de la recherche
    const filtered = allAeroports.filter((a: Aeroport) => 
      a.name.toLowerCase().includes(value) || 
      a.code.toLowerCase().includes(value) ||
      (a.city && a.city.toLowerCase().includes(value))
    );
    
    if (type === 'embarquement') {
      this.suggestionsAeroports = filtered;
      this.showSuggestionsAeroports = filtered.length > 0;
    } else {
      // Pour le débarquement, ne montrer que les aéroports du Congo (CG)
      const congoAeroports = filtered.filter(a => a.countryCode === 'CG');
      this.suggestionsAeroportsDebarq = congoAeroports;
      this.showSuggestionsAeroportsDebarq = congoAeroports.length > 0;
    }
  }
  
  // Sélection d'un aéroport
  selectAeroport(aeroport: Aeroport, type: 'embarquement' | 'debarquement' = 'embarquement'): void {
    const ctrlPath = type === 'embarquement' 
      ? 'aerien.aeroportEmbarquement' 
      : 'aerien.aeroportDebarquement';
    
    this.formGroup.get(ctrlPath)?.setValue(aeroport.code);
    
    if (type === 'embarquement') {
      this.showSuggestionsAeroports = false;
    } else {
      this.showSuggestionsAeroportsDebarq = false;
    }
  }
  
  // Alias pour la sélection d'un aéroport de débarquement
  selectAeroportDebarquement(aeroport: Aeroport) {
    this.selectAeroport(aeroport, 'debarquement');
  }
  
  private initializeFormGroups() {
    console.log('Initialisation des groupes de formulaire');
    if (this.formGroup) {
      // Initialiser les contrôles obligatoires
      const requiredFields = [
        'noFacture',
        'incoterms',
        'devise',
        'paysOrigine',
        'paysEmbarquement',
        'domicilBanque',
        'numeroCompteBancaire'
      ];
      

      requiredFields.forEach(field => {
        if (!this.formGroup.get(field)) {
          this.formGroup.addControl(field, new FormControl('', Validators.required));
        } else {
          this.formGroup.get(field)?.setValidators(Validators.required);
          this.formGroup.get(field)?.updateValueAndValidity();
        }
      });
      
      // Initialiser le champ paysDebarquement avec 'CONGO' et le rendre en lecture seule
      if (!this.formGroup.get('paysDebarquement')) {
        this.formGroup.addControl('paysDebarquement', new FormControl({value: 'CONGO', disabled: true}));
      } else {
        this.formGroup.get('paysDebarquement')?.setValue('CONGO');
        this.formGroup.get('paysDebarquement')?.disable();
      }

      // Initialiser les contrôles s'ils n'existent pas déjà
      if (!this.formGroup.get('troncon')) {
        this.formGroup.addControl('troncon', new FormControl(''));
      }
      if (!this.formGroup.get('corridor')) {
        this.formGroup.addControl('corridor', new FormControl(''));
      }
      // S'assurer que les groupes de formulaires sont correctement initialisés
      if (!this.formGroup.get('maritime')) {
        this.formGroup.addControl('maritime', new FormGroup({
          portEmbarquement: new FormControl(''),
          portDebarquement: new FormControl('')
        }));
      }
      
      if (!this.formGroup.get('aerien')) {
        this.formGroup.addControl('aerien', new FormGroup({
          aeroportEmbarquement: new FormControl(''),
          aeroportDebarquement: new FormControl('')
        }));
      }
      
      if (!this.formGroup.get('fluvial')) {
        this.formGroup.addControl('fluvial', new FormGroup({
          fleuveEmbarquement: new FormControl(''),
          fleuveDebarquement: new FormControl('')
        }));
      }
      
      if (!this.formGroup.get('routier')) {
        this.formGroup.addControl('routier', new FormGroup({
          troncon: new FormControl('')
        }));
      }
    }
    
    if (!this._formGroup.get('fluvial')) {
      this._formGroup.addControl('fluvial', new FormGroup({
        fleuveEmbarquement: new FormControl(''),
        fleuveDebarquement: new FormControl('')
      }));
    }
    
    if (!this._formGroup.get('routier')) {
      this._formGroup.addControl('routier', new FormGroup({
        troncon: new FormControl('')
      }));
    }
  }





  constructor() {
    console.log('CommandesComponent - constructeur');
    // Les abonnements seront configurés quand formGroup est injecté
  }
  
 
  
  // Alias pour la compatibilité avec le code existant
  get pays(): any[] {
    return this.paysList;
  }
  
  // Alias pour la propriété formGroup pour la compatibilité
  // avec le code existant qui utilise this.form
  get form(): FormGroup {
    return this.formGroup;
  }
  
  // Alias pour banquesList pour la compatibilité avec le template
  get banques() {
    return this.banquesList;
  }
  
  // Méthode pour n'autoriser que les chiffres dans le champ de numéro de compte
  onlyNumberKey(event: KeyboardEvent): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    // Seuls les chiffres 0-9 sont autorisés
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  
  // Méthode appelée quand les inputs changent
  ngOnChanges(changes: SimpleChanges): void {
    console.log('Changement détecté :', changes);
    if (changes['moduleType']) {
      console.log('Nouveau moduleType :', this.moduleType);
      this.initializeFormGroups();
    }
    if (changes['formGroup'] && this.formGroup) {
      console.log('FormGroup valide:', this.formGroup.valid);
      console.log('Valeurs du formulaire:', this.formGroup.value);
    }
  }
  
  // Méthodes d'aide pour l'autocomplétion
  filterDevises(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    
    if (!value) {
      this.suggestionsDevise = [];
      this.showSuggestionsDevise = false;
      return;
    }
    
    const searchTerm = value.toLowerCase();
    this.suggestionsDevise = this.devises
      .filter(dev => 
        dev.alpha3.toLowerCase().includes(searchTerm) || 
        (dev.currency_name && dev.currency_name.toLowerCase().includes(searchTerm)) ||
        (dev.country_or_region && dev.country_or_region.toLowerCase().includes(searchTerm))
      )
      .slice(0, 5);
    this.showSuggestionsDevise = this.suggestionsDevise.length > 0;
  }
  
  selectDevise(devise: DeviseItem | null) {
    if (devise) {
      this.formGroup.get('devise')?.setValue(devise.alpha3);
      this.hideDeviseSuggestions();
    }
  }
  
  hideDeviseSuggestions() {
    setTimeout(() => this.showSuggestionsDevise = false, 150);
  }

  // Autocomplétion Incoterms
  private currentIncotermsPool(): IncotermItem[] {
    const mod = (this.moduleType || '').toUpperCase();
    if (mod === 'AERIEN' || mod === 'ROUTIER') {
      return this.incotermsAll.filter(i => i.modeTransport === 'multimodal');
    }
    if (mod === 'MARITIME' || mod === 'FLUVIAL') {
      return this.incotermsAll.filter(i => i.modeTransport === 'maritime-fluvial');
    }
    return this.incotermsAll;
  }

  filterIncoterms(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    
    if (!value) {
      this.suggestionsIncoterms = this.currentIncotermsPool();
      this.showSuggestionsIncoterms = this.suggestionsIncoterms.length > 0;
      return;
    }
    
    const search = value.toLowerCase();
    const pool = this.currentIncotermsPool();
    this.suggestionsIncoterms = pool
      .filter(i => 
        i.code.toLowerCase().includes(search) || 
        (i.name && i.name.toLowerCase().includes(search)) ||
        (i.description && i.description.toLowerCase().includes(search))
      )
      .slice(0, 7);
    this.showSuggestionsIncoterms = this.suggestionsIncoterms.length > 0;
  }

  selectIncoterm(item: IncotermItem | null) {
    if (item) {
      this.formGroup.get('incoterms')?.setValue(item.code);
      this.hideSuggestionsIncoterms();
    }
  }

  hideSuggestionsIncoterms() {
    setTimeout(() => this.showSuggestionsIncoterms = false, 150);
  }
  
  // Méthodes d'aide pour les pays
  searchPaysEmbarque(event: Event, type: 'embarquement' | 'debarquement' | 'destination' = 'embarquement'): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.toLowerCase();
    
    if (!value) {
      if (type === 'embarquement') {
        this.suggestionsPaysEmbarque = [];
        this.showSuggestionsPaysEmbarque = false;
      } else {
        this.suggestionsPaysDebarq = [];
        this.showSuggestionsPaysDebarq = false;
      }
      return;
    }
    
    const filtered = this.paysList.filter(p => 
      p.country.toLowerCase().includes(value) || 
      p.iso_alpha2.toLowerCase() === value || 
      p.iso_alpha3.toLowerCase() === value
    );
    
    if (type === 'embarquement') {
      this.suggestionsPaysEmbarque = filtered;
      this.showSuggestionsPaysEmbarque = filtered.length > 0;
    } else {
      this.suggestionsPaysDebarq = filtered;
      this.showSuggestionsPaysDebarq = filtered.length > 0;
    }
  }
  

  
  
  
  
  
  // Méthode pour masquer les suggestions de pays de destination
  hideSuggestionsPaysDest() {
    setTimeout(() => this.showSuggestionsPaysDest = false, 150);
  }
  
  // Sélection d'un pays de destination
  selectPaysDestination(pays: Pays) {
    this.selectPays(pays, 'destination');
  }
  
  // Initialisation des abonnements aux changements de valeurs
  initializeValueSubscriptions(): void {
    if (this._subscriptionsInitialized) return;
    // Abonnements pour recalculer Valeur XAF
    const fg = this.formGroup;
    if (!fg) return;
    const deviseCtrl = fg.get('devise');
    const valeurDeviseCtrl = fg.get('valeurDevise');
    if (deviseCtrl && valeurDeviseCtrl) {
      deviseCtrl.valueChanges.subscribe(() => this.computeValeurXaf());
      valeurDeviseCtrl.valueChanges.subscribe(() => this.computeValeurXaf());
      this._subscriptionsInitialized = true;
    }
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
        return latest.XAF_XOF ? 1 / latest.XAF_XOF : 1; // si XAF->XOF = 1, alors XOF->XAF = 1
      default:
        return 1; // fallback si devise non gérée
    }
  }

  private computeValeurXaf(): void {
    const fg = this.formGroup;
    if (!fg) return;
    const valDev = Number(fg.get('valeurDevise')?.value || 0);
    const dev = fg.get('devise')?.value;
    const rate = this.rateForDevise(dev);
    const xaf = valDev * rate;
    fg.get('valeurXaf')?.setValue(xaf, { emitEvent: false });
  }
  
  selectPays(pays: Pays, type: 'embarquement' | 'debarquement' | 'destination' = 'embarquement'): void {
    if (type === 'embarquement') {
      this.formGroup.get('paysEmbarque')?.setValue(pays.country);
      this.showSuggestionsPaysEmbarque = false;
    } else if (type === 'debarquement') {
      this.formGroup.get('paysDebarquement')?.setValue(pays.country);
      this.showSuggestionsPaysDebarq = false;
    } else {
      this.formGroup.get('paysDestination')?.setValue(pays.country);
      this.showSuggestionsPaysDest = false;
    }
  }
  
  hidePaysSuggestions(type: 'embarquement' | 'debarquement' | 'destination' = 'embarquement'): void {
    setTimeout(() => {
      if (type === 'embarquement') {
        this.showSuggestionsPaysEmbarque = false;
      } else if (type === 'debarquement') {
        this.showSuggestionsPaysDebarq = false;
      } else {
        this.showSuggestionsPaysDest = false;
      }
    }, 200);
  }

  private initializeModuleSpecificFields(moduleType: string): void {
    if (!this._formGroup) return;
    
    switch (moduleType.toUpperCase()) {
      case 'AERIEN':
        if (!this._formGroup.get('aerien')) {
          this._formGroup.addControl('aerien', new FormGroup({
            aeroportEmbarquement: new FormControl('', Validators.required),
            aeroportDebarquement: new FormControl('', Validators.required)
          }));
        }
        break;
        
      case 'MARITIME':
        if (!this._formGroup.get('maritime')) {
          this._formGroup.addControl('maritime', new FormGroup({
            portEmbarquement: new FormControl('', Validators.required),
            portDebarquement: new FormControl('', Validators.required)
          }));
        }
        break;
        
      case 'FLUVIAL':
        if (!this._formGroup.get('fluvial')) {
          this._formGroup.addControl('fluvial', new FormGroup({
            fleuveEmbarquement: new FormControl('', Validators.required),
            fleuveDebarquement: new FormControl('', Validators.required)
          }));
        }
        break;
        
      case 'ROUTIER':
        if (!this._formGroup.get('troncon')) {
          this._formGroup.addControl('troncon', new FormControl('', Validators.required));
        }
        if (!this._formGroup.get('corridor')) {
          this._formGroup.addControl('corridor', new FormControl('', Validators.required));
        }
        break;
    }
  }

  // Méthode appelée lors du clic sur le bouton Suivant
  onNext(): void {
    if (this.formGroup.valid) {
      // Émettre un événement ou appeler un service de navigation
      // Par exemple : this.router.navigate(['/etape-suivante']);
      console.log('Navigation vers l\'étape suivante');
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      this.markFormGroupTouched(this.formGroup);
    }
  }

  // Méthode appelée lors du clic sur le bouton Précédent
  onPrevious(): void {
    // Émettre un événement ou appeler un service de navigation
    // Par exemple : this.router.navigate(['/etape-precedente']);
    console.log('Retour à l\'étape précédente');
  }

  // Méthode utilitaire pour marquer tous les champs comme touchés
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Vérifie si tous les champs obligatoires sont valides
  isFormValid(): boolean {
    if (!this.formGroup) return false;
    
    // Vérification des champs obligatoires de base
    const requiredFields = [
      'noFacture',
      'incoterms',
      'devise',
      'paysOrigine',
      'paysEmbarquement',
      'banque',
      'numeroCompteBancaire'
    ];

    // Vérifier les champs obligatoires de base
    const baseFieldsValid = requiredFields.every(field => {
      const control = this.formGroup.get(field);
      return control && control.valid && control.value && control.value.toString().trim() !== '';
    });

    // Vérification des champs spécifiques au module
    let moduleSpecificValid = true;
    
    if (this.moduleType === 'AERIEN') {
      const aerienGroup = this.formGroup.get('aerien') as FormGroup;
      if (aerienGroup) {
        moduleSpecificValid = moduleSpecificValid && 
          !!aerienGroup.get('aeroportEmbarquement')?.value &&
          !!aerienGroup.get('aeroportDebarquement')?.value;
      }
    } else if (this.moduleType === 'MARITIME') {
      const maritimeGroup = this.formGroup.get('maritime') as FormGroup;
      if (maritimeGroup) {
        moduleSpecificValid = moduleSpecificValid && 
          !!maritimeGroup.get('portEmbarquement')?.value &&
          !!maritimeGroup.get('portDebarquement')?.value;
      }
    } else if (this.moduleType === 'FLUVIAL') {
      const fluvialGroup = this.formGroup.get('fluvial') as FormGroup;
      if (fluvialGroup) {
        moduleSpecificValid = moduleSpecificValid && 
          !!fluvialGroup.get('fleuveEmbarquement')?.value &&
          !!fluvialGroup.get('fleuveDebarquement')?.value;
      }
    } else if (this.moduleType === 'ROUTIER') {
      moduleSpecificValid = moduleSpecificValid && 
        !!this.formGroup.get('troncon')?.value &&
        !!this.formGroup.get('corridor')?.value;
    }

    return baseFieldsValid && moduleSpecificValid;
  }
}

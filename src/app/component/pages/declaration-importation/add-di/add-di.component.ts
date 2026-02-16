import { Component, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { DossiersComponent } from './steps/dossiers/dossiers.component';
import { ResumeDossiersComponent } from './steps/resume-dossiers/resume-dossiers.component';
import { CommandesComponent } from './steps/commandes/commandes.component';
import { LignesCommandeComponent } from './steps/lignes-commande/lignes-commande.component';
import { DocumentsComponent } from './steps/documents/documents.component';
import { SummaryComponent } from './steps/summary/summary.component';
import { RouterModule } from '@angular/router';
import { modules } from '../../../../shared/data/database';

// Interface pour les données des parties (importateur, exportateur, transitaire)
interface PartyData {
  Nom?: string;
  nom?: string;
  Adresse?: string;
  adresse?: string;
  Pays?: string;
  pays?: string;
  NIU?: string;
  niu?: string;
  Telephone?: string;
  telephone?: string;
  Email?: string;
  email?: string;
  [key: string]: any; // Pour les propriétés supplémentaires
}

@Component({
  selector: 'app-add-di',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, DossiersComponent, ResumeDossiersComponent, CommandesComponent, LignesCommandeComponent, DocumentsComponent, SummaryComponent],
  templateUrl: './add-di.component.html',
  styleUrls: ['./add-di.component.scss']
})
export class AddDiComponent implements OnInit {
  step = 1;
  readonly totalSteps = 6;
  isEtape1Valid = false;
  isEtape3Valid = false;
  @ViewChild(DossiersComponent) step1?: DossiersComponent;
  @ViewChild(CommandesComponent) commandesComponent?: CommandesComponent;
  // Persistance des lignes de l'étape 4
  lignesEtape4: any[] = [];

  // Getters pour les FormGroup
  get etape1Form(): FormGroup {
    return this.form.get('etape1') as FormGroup;
  }

  // Méthode pour récupérer toutes les données pour le résumé
  getSummaryData() {
    // Récupérer les données de l'étape 1 (Dossiers)
    const etape1Data = this.etape1Form.value;
    
    // Récupérer les données de l'étape 3 (Commandes)
    const etape3Data = this.etape3Form.value;
    
    // Récupérer les données du composant Dossiers si disponible
    let importateurData: PartyData = {};
    let exportateurData: PartyData = {};
    let transitaireData: PartyData = {};
    
    if (this.step1) {
      const step1Data = this.step1.getStep1Summary();
      if (step1Data) {
        importateurData = step1Data.importateur || {};
        exportateurData = step1Data.exportateur || {};
        transitaireData = step1Data.transitaire || {};
      }
    }
    
    return {
      // Données de l'étape 1
      ...etape1Data,
      
      // Données de l'étape 3
      ...etape3Data,
      
      // Données du bureau de dédouanement et autres champs spécifiques
      bureauDedouanement: etape3Data.bureauDedouanement || '',
      echeancePaiement: etape3Data.echeanceTransfer || '',
      banque: etape3Data.domicilBanque || '',
      agence: etape3Data.agenceBanque || '',
      numeroCompte: etape3Data.numeroCompteBancaire || '',
      
      // Lignes de commande
      lignesCommande: this.lignesEtape4,
      
      // Données de l'importateur/exportateur/transitaire
      importateur: {
        nom: importateurData.Nom || importateurData.nom || '',
        adresse: importateurData.Adresse || importateurData.adresse || '',
        pays: importateurData.Pays || importateurData.pays || '',
        niu: importateurData.NIU || importateurData.niu || '',
        telephone: importateurData.Telephone || importateurData.telephone || '',
        email: importateurData.Email || importateurData.email || ''
      },
      exportateur: {
        nom: exportateurData.Nom || exportateurData.nom || '',
        adresse: exportateurData.Adresse || exportateurData.adresse || '',
        pays: exportateurData.Pays || exportateurData.pays || '',
        niu: exportateurData.NIU || exportateurData.niu || '',
        telephone: exportateurData.Telephone || exportateurData.telephone || '',
        email: exportateurData.Email || exportateurData.email || ''
      },
      transitaire: {
        nom: transitaireData.Nom || transitaireData.nom || '',
        adresse: transitaireData.Adresse || transitaireData.adresse || '',
        pays: transitaireData.Pays || transitaireData.pays || '',
        niu: transitaireData.NIU || transitaireData.niu || '',
        telephone: transitaireData.Telephone || transitaireData.telephone || '',
        email: transitaireData.Email || transitaireData.email || ''
      }
    };
  }

  get etape3Form(): FormGroup {
    return this.form.get('etape3') as FormGroup;
  }

  get moduleType(): string | null {
    const code: string | null = this.etape1Form?.get('module')?.value || null;
    if (!code) return null;
    const found = modules.find(m => m.code === code);
    return found ? found.description : code;
  }

  // Formulaire principal
  form = this.fb.group({
    // Étape 1
    etape1: this.fb.group({
      module: ['', Validators.required],
      // autres champs de l'étape 1...
    }),
    
    // Étape 3
    etape3: this.fb.group({
      // Champs communs
      paysOrigine: [''],
      paysEmbarque: ['', Validators.required],
      paysDebarquement: ['', Validators.required],
      paysDestination: [''],
      destinationFinale: [''],
      
      // Groupes conditionnels
      aerien: this.fb.group({
        aeroportEmbarquement: [''],
        aeroportDebarquement: ['']
      }),
      maritime: this.fb.group({
        portEmbarquement: [''],
        portDebarquement: ['']
      }),
      fluvial: this.fb.group({
        fleuveEmbarquement: [''],
        fleuveDebarquement: ['']
      }),
      routier: this.fb.group({
        troncon: ['']
      }),
      
      // Autres champs communs...
      dossier: [''],
      noFacture: [''],
      intitule: [''],
      incoterms: [''],
      incotermsLignes: [''],
      devise: [''],
      valeurDevise: [''],
      valeurXaf: [''],
      volumeM3: [''],
      masseBruteKg: [''],
      fretDevise: [''],
      assuranceDevise: [''],
      autresChargesDevise: [''],
      echeanceTransfer: [''],
      motifTransaction: [''],
      modalitePaiement: [''],
      uniteChargement: [''],
      relationsFournisseur: [''],
      domicilBanque: [''],
      agenceBanque: [''],
      numeroCompteBancaire: [''],
    })
  });
  
  resumeData: any = null;
  step1Data: any = null;
  commandesFormData: any = null; // Pour sauvegarder l'état du formulaire des commandes

  constructor(private fb: FormBuilder) {}

  // Gestion de la validité de l'étape 1
  onEtape1ValidityChange(isValid: boolean): void {
    this.isEtape1Valid = isValid;
  }

  ngOnInit(): void {
    this.setupFormListeners();
    this.setupEtape3Validation();
  }
  
  private setupFormListeners() {
    // Écoute des changements du module
    this.form.get('etape1.module')?.valueChanges.subscribe(moduleType => {
      this.updateStep3Validators(moduleType);
    });
  }
  
  private updateStep3Validators(moduleCode: string | null) {
    const etape3 = this.form.get('etape3');
    if (!etape3 || !moduleCode) return;

    // Désactiver tous les groupes conditionnels
    ['aerien', 'maritime', 'fluvial', 'routier'].forEach(group => {
      etape3.get(group)?.disable({ emitEvent: false });
    });

    // Activer et définir les validateurs pour le groupe sélectionné
    switch(moduleCode) {
      case 'AR':
        this.setupAerienValidators(etape3);
        break;
      case 'MA':
        this.setupMaritimeValidators(etape3);
        break;
      case 'FL':
        this.setupFluvialValidators(etape3);
        break;
      case 'RO':
        this.setupRoutierValidators(etape3);
        break;
    }
  }
  
  private setupAerienValidators(etape3: AbstractControl) {
    const group = etape3.get('aerien');
    group?.enable({ emitEvent: false });
    this.setRequired(group, 'aeroportEmbarquement');
    this.setRequired(group, 'aeroportDebarquement');
  }

  private setupMaritimeValidators(etape3: AbstractControl) {
    const group = etape3.get('maritime');
    group?.enable({ emitEvent: false });
    this.setRequired(group, 'portEmbarquement');
    this.setRequired(group, 'portDebarquement');
  }

  private setupFluvialValidators(etape3: AbstractControl) {
    const group = etape3.get('fluvial');
    group?.enable({ emitEvent: false });
    this.setRequired(group, 'fleuveEmbarquement');
    this.setRequired(group, 'fleuveDebarquement');
  }

  private setupRoutierValidators(etape3: AbstractControl) {
    const group = etape3.get('routier');
    group?.enable({ emitEvent: false });
    this.setRequired(group, 'troncon');
  }

  private setRequired(group: AbstractControl | null, controlName: string) {
    const control = group?.get(controlName);
    if (control) {
      control.setValidators([Validators.required]);
      control.updateValueAndValidity();
    }
  }

  private setupEtape3Validation(): void {
    // Toujours valide pour désactiver la validation
    this.isEtape3Valid = true;
    
    // Ne plus écouter les changements de statut
    // car on veut que le bouton soit toujours actif
  }

  get progress(): string {
    const ratio = (this.step - 1) / (this.totalSteps - 1);
    return `${Math.round(ratio * 100)}%`;
  }

  next(): void {
    // Sauvegarder les données de l'étape actuelle avant de passer à la suivante
    if (this.step === 1 && this.step1) {
      const s = this.step1.getStep1Summary();
      const rawData = this.step1.getRaw();
      
      const now = new Date();
      const sixMonths = new Date(now);
      sixMonths.setMonth(sixMonths.getMonth() + 6);
      const toDate = (d: Date) => d.toISOString().slice(0, 10);
      
      this.resumeData = {
        module: rawData.form.module,
        importateur: s.importateur,
        transitaire: s.transitaire,
        exportateur: s.exportateur,
        dateDebut: toDate(now),
        dateFin: toDate(sixMonths)
      };
      
      // Sauvegarder les données complètes de l'étape 1
      this.step1Data = { 
        ...rawData.form,
        selectedImportateur: rawData.selectedImportateur,
        selectedTransitaire: rawData.selectedTransitaire,
        notifSMS: rawData.form.notifSMS || false,
        notifEmail: rawData.form.notifEmail || false,
        mobile: rawData.form.mobile || '',
        email: rawData.form.email || ''
      };
      
      console.log('Données de l\'étape 1 sauvegardées:', this.step1Data);
      
      // Mettre à jour le moduleType avant de passer à l'étape suivante
      if (this.etape1Form) {
        this.etape1Form.patchValue({
          module: rawData.form.module
        });
      }
    } else if (this.step === 3 && this.commandesComponent) {
      this.commandesFormData = { ...this.commandesComponent.formGroup.value };
      console.log('Données des commandes sauvegardées:', this.commandesFormData);
    }
    
    if (this.step < this.totalSteps) {
      const previousStep = this.step;
      this.step++;
      
      // Utiliser setTimeout pour s'assurer que le DOM est mis à jour avant de restaurer les données
      setTimeout(() => {
        // Restaurer les données de l'étape si elles existent
        if (this.step === 3 && this.commandesFormData && this.commandesComponent) {
          console.log('Restauration des données des commandes...');
          console.log('ModuleType actuel:', this.moduleType);
          
          // S'assurer que le moduleType est correctement défini avant de restaurer les données
          if (this.moduleType) {
            this.commandesComponent.formGroup.patchValue(this.commandesFormData, { emitEvent: false });
            this.commandesComponent.formGroup.markAsPristine();
          } else {
            console.error('ModuleType non défini lors de la restauration des commandes');
          }
        } else if (this.step === 1 && this.step1 && this.step1Data) {
          console.log('Restauration des données de l\'étape 1...');
          this.step1.setFormValues(this.step1Data);
        }
      });
    }
  }

  prev(): void {
    if (this.step <= 1) return;
    
    const currentStep = this.step;
    
    // Sauvegarder les données de l'étape actuelle avant de revenir
    if (currentStep === 3 && this.commandesComponent) {
      this.commandesFormData = { ...this.commandesComponent.formGroup.value };
      console.log('Données des commandes sauvegardées (retour arrière):', this.commandesFormData);
    } else if (currentStep === 2 && this.step1) {
      // Sauvegarder les données de l'étape 1 si on revient de l'étape 2
      const rawData = this.step1.getRaw();
      this.step1Data = { 
        ...rawData.form,
        selectedImportateur: rawData.selectedImportateur,
        selectedTransitaire: rawData.selectedTransitaire,
        notifSMS: rawData.form.notifSMS || false,
        notifEmail: rawData.form.notifEmail || false,
        mobile: rawData.form.mobile || '',
        email: rawData.form.email || ''
      };
      console.log('Données de l\'étape 1 sauvegardées (retour arrière):', this.step1Data);
    }
    
    this.step--;
    
    // Utiliser setTimeout pour s'assurer que le DOM est mis à jour avant de restaurer les données
    setTimeout(() => {
      // Restaurer les données de l'étape si elles existent
      if (this.step === 3 && this.commandesFormData && this.commandesComponent) {
        console.log('Restauration des données des commandes (retour arrière)...');
        console.log('ModuleType actuel (retour arrière):', this.moduleType);
        
        // S'assurer que le moduleType est correctement défini avant de restaurer les données
        if (this.moduleType) {
          this.commandesComponent.formGroup.patchValue(this.commandesFormData, { emitEvent: false });
          this.commandesComponent.formGroup.markAsPristine();
        } else {
          console.error('ModuleType non défini lors de la restauration des commandes (retour arrière)');
        }
      } else if (this.step === 1 && this.step1 && this.step1Data) {
        console.log('Restauration des données de l\'étape 1 (retour arrière)...');
        this.step1.setFormValues(this.step1Data);
        
        // S'assurer que le module est correctement défini dans le formulaire
        if (this.step1Data.module) {
          this.etape1Form.patchValue({
            module: this.step1Data.module
          });
        }
      }
    });
  }

  goTo(step: number): void {
    if (step >= 1 && step <= this.totalSteps) {
      // Si l'utilisateur saute directement aux commandes (étape 3),
      // synchroniser le module depuis l'étape 1 (enfant) vers le parent
      if (step === 3) {
        const raw = this.step1?.getRaw();
        const moduleCode = raw?.form?.module || this.etape1Form?.get('module')?.value || null;
        if (moduleCode) {
          // Mettre à jour le form parent si nécessaire
          if (this.etape1Form?.get('module')?.value !== moduleCode) {
            this.etape1Form.patchValue({ module: moduleCode }, { emitEvent: false });
          }
          // Appliquer les validateurs conditionnels
          this.updateStep3Validators(moduleCode);
        }
      }
      this.step = step;
    }
  }
}

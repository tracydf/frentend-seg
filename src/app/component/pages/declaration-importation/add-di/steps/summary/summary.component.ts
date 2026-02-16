// summary.component.ts
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

interface FormData {
  [key: string]: any;
  type: string;
  module: string;
  noFacture: string;
  intitule: string;
  incoterms: string;
  uniteChargement: string;
  bureauDedouanement: string;
  modalitePaiement: string;
  echeancePaiement: string;
  banque: string;
  agence: string;
  masseNette: string;
  volume: string;
  valeurDevise: string;
  valeurXAF: string;
  fretDevise: string;
  assuranceDevise: string;
  autresCharges: string;
  numeroCompte: string;
  paysOrigine: string;
  paysEmbarquement: string;
  paysDebarquement: string;
  aeroportEmbarquement: string;
  aeroportDebarquement: string;
  troncon: string;
  corridor: string;
  portEmbarquement: string;
  portDebarquement: string;
  fleuveEmbarquement: string;
  fleuveDebarquement: string;
  masseBrute: string;
  importNom: string;
  importAdresse: string;
  importPays: string;
  importNIU: string;
  exportNom: string;
  exportAdresse: string;
  exportPays: string;
  exportNIU: string;
  transNom: string;
  transAdresse: string;
  transPays: string;
  transNIU: string;
}

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss']
})
export class SummaryComponent implements OnChanges {
  form: FormGroup;
  @Input() data: any;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      // Bloc Dossier
      type: [{ value: '', disabled: true }],
      module: [{ value: '', disabled: true }],

      // Bloc Commandes
      noFacture: [{ value: '', disabled: true }],
      intitule: [{ value: '', disabled: true }],
      incoterms: [{ value: '', disabled: true }],
      uniteChargement: [{ value: '', disabled: true }],
      bureauDedouanement: [{ value: '', disabled: true }],
      modalitePaiement: [{ value: '', disabled: true }],
      echeancePaiement: [{ value: '', disabled: true }],
      banque: [{ value: '', disabled: true }],
      agence: [{ value: '', disabled: true }],
      masseNette: [{ value: '', disabled: true }],
      volume: [{ value: '', disabled: true }],
      valeurDevise: [{ value: '', disabled: true }],
      valeurXAF: [{ value: '', disabled: true }],
      fretDevise: [{ value: '', disabled: true }],
      assuranceDevise: [{ value: '', disabled: true }],
      autresCharges: [{ value: '', disabled: true }],
      numeroCompte: [{ value: '', disabled: true }],
      paysOrigine: [{ value: '', disabled: true }],
      paysEmbarquement: [{ value: '', disabled: true }],
      paysDebarquement: [{ value: '', disabled: true }],
      aeroportEmbarquement: [{ value: '', disabled: true }],
      aeroportDebarquement: [{ value: '', disabled: true }],
      troncon: [{ value: '', disabled: true }],
      corridor: [{ value: '', disabled: true }],
      portEmbarquement: [{ value: '', disabled: true }],
      portDebarquement: [{ value: '', disabled: true }],
      fleuveEmbarquement: [{ value: '', disabled: true }],
      fleuveDebarquement: [{ value: '', disabled: true }],
      masseBrute: [{ value: '', disabled: true }],

      // Bloc Importateur
      importNom: [{ value: '', disabled: true }],
      importAdresse: [{ value: '', disabled: true }],
      importPays: [{ value: '', disabled: true }],
      importNIU: [{ value: '', disabled: true }],

      // Bloc Exportateur
      exportNom: [{ value: '', disabled: true }],
      exportAdresse: [{ value: '', disabled: true }],
      exportPays: [{ value: '', disabled: true }],
      exportNIU: [{ value: '', disabled: true }],

      // Bloc Transitaire
      transNom: [{ value: '', disabled: true }],
      transAdresse: [{ value: '', disabled: true }],
      transPays: [{ value: '', disabled: true }],
      transNIU: [{ value: '', disabled: true }],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      // Initialisation de toutes les propriétés avec des valeurs par défaut
      const formData: FormData = {
        type: '',
        module: '',
        noFacture: '',
        intitule: '',
        incoterms: '',
        uniteChargement: '',
        bureauDedouanement: '',
        modalitePaiement: '',
        echeancePaiement: '',
        banque: '',
        agence: '',
        masseNette: '',
        volume: '',
        valeurDevise: '',
        valeurXAF: '',
        fretDevise: '',
        assuranceDevise: '',
        autresCharges: '',
        numeroCompte: '',
        paysOrigine: '',
        paysEmbarquement: '',
        paysDebarquement: '',
        aeroportEmbarquement: '',
        aeroportDebarquement: '',
        troncon: '',
        corridor: '',
        portEmbarquement: '',
        portDebarquement: '',
        fleuveEmbarquement: '',
        fleuveDebarquement: '',
        masseBrute: '',
        importNom: '',
        importAdresse: '',
        importPays: '',
        importNIU: '',
        exportNom: '',
        exportAdresse: '',
        exportPays: '',
        exportNIU: '',
        transNom: '',
        transAdresse: '',
        transPays: '',
        transNIU: ''
      };

      // Mise à jour avec les valeurs fournies
      // Bloc Dossier
      formData.type = this.data.type || 'Importation';
      formData.module = this.data.module || '';

      // Bloc Commandes
      formData.noFacture = this.data.noFacture || '';
      formData.intitule = this.data.intitule || '';
      formData.incoterms = this.data.incoterms || '';
      formData.uniteChargement = this.data.uniteChargement || '';
      formData.bureauDedouanement = this.data.bureauDedouanement || '';
      formData.modalitePaiement = this.data.modalitePaiement || '';
      formData.echeancePaiement = this.data.echeancePaiement || '';
      formData.banque = this.data.banque || '';
      formData.agence = this.data.agence || '';
      formData.masseNette = this.data.masseNette || '';
      formData.volume = this.data.volume || '';
      formData.valeurDevise = this.data.valeurDevise || '';
      formData.valeurXAF = this.data.valeurXAF || '';
      formData.fretDevise = this.data.fretDevise || '';
      formData.assuranceDevise = this.data.assuranceDevise || '';
      formData.autresCharges = this.data.autresCharges || this.data.autresChargesDevise || '';
      formData.numeroCompte = this.data.numeroCompte || '';
      formData.paysOrigine = this.data.paysOrigine || '';
      formData.paysEmbarquement = this.data.paysEmbarquement || this.data.paysEmbarque || '';
      formData.paysDebarquement = this.data.paysDebarquement || '';
      formData.aeroportEmbarquement = this.data.aeroportEmbarquement || (this.data.aerien?.aeroportEmbarquement || '');
      formData.aeroportDebarquement = this.data.aeroportDebarquement || (this.data.aerien?.aeroportDebarquement || '');
      formData.troncon = this.data.troncon || (this.data.routier?.troncon || '');
      formData.corridor = this.data.corridor || (this.data.routier?.corridor || '');
      formData.portEmbarquement = this.data.portEmbarquement || (this.data.maritime?.portEmbarquement || '');
      formData.portDebarquement = this.data.portDebarquement || (this.data.maritime?.portDebarquement || '');
      formData.fleuveEmbarquement = this.data.fleuveEmbarquement || (this.data.fluvial?.fleuveEmbarquement || '');
      formData.fleuveDebarquement = this.data.fleuveDebarquement || (this.data.fluvial?.fleuveDebarquement || '');
      formData.masseBrute = this.data.masseBrute || '';

      // Ajout des champs spécifiques au module si nécessaire
      if (this.data.module === 'aerien') {
        formData.aeroportEmbarquement = this.data.aeroportEmbarquement || '';
        formData.aeroportDebarquement = this.data.aeroportDebarquement || '';
      } else if (this.data.module === 'routier') {
        formData.troncon = this.data.troncon || '';
        formData.corridor = this.data.corridor || '';
      } else if (this.data.module === 'maritime') {
        formData.portEmbarquement = this.data.portEmbarquement || '';
        formData.portDebarquement = this.data.portDebarquement || '';
      } else if (this.data.module === 'fluvial') {
        formData.fleuveEmbarquement = this.data.fleuveEmbarquement || '';
        formData.fleuveDebarquement = this.data.fleuveDebarquement || '';
      }

      // Mise à jour des champs de l'importateur, exportateur et transitaire
      const updatePartyFields = (prefix: string, party: any) => {
        if (!party) return;
        
        // Mise à jour directe des propriétés
        const nom = party.Nom || party.nom || '';
        const adresse = party.Adresse || party.adresse || '';
        const pays = party.Pays || party.pays || '';
        const niu = party.NIU || party.niu || '';
        
        // Mise à jour conditionnelle en fonction du préfixe
        if (prefix === 'import') {
          formData.importNom = nom;
          formData.importAdresse = adresse;
          formData.importPays = pays;
          formData.importNIU = niu;
        } else if (prefix === 'export') {
          formData.exportNom = nom;
          formData.exportAdresse = adresse;
          formData.exportPays = pays;
          formData.exportNIU = niu;
        } else if (prefix === 'trans') {
          formData.transNom = nom;
          formData.transAdresse = adresse;
          formData.transPays = pays;
          formData.transNIU = niu;
        }
      };

      // Mise à jour des parties
      updatePartyFields('import', this.data.importateur);
      updatePartyFields('export', this.data.exportateur);
      updatePartyFields('trans', this.data.transitaire);

      // Application des valeurs au formulaire
      this.form.patchValue(formData);
    }
  }
}
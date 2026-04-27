import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { pays as paysData } from '../../../shared/data/database';
import { CertificatOrigineService } from '../../../services/certificat-origine.service';
import {
  CertificatOrigineDto,
  CertificateLineDto,
  PartenaireDto,
  ExportateurDto,
  CertificateTypeDto,
  CreerCertificatOrigineDto,
  ModifierCertificatOrigineDto,
  CreerCertificateLineDto,
} from '../../../models/certificat-origine.models';

// ─── Statuts (miroir GECO) ────────────────────────────────────────────────────
export type StatutId = 1 | 2 | 4 | 5 | 6 | 7 | 8 | 10 | 12 | 13 | 14 | 15;

export interface StatutDef {
  id: StatutId;
  label: string;
  cssClass: string;
}

export const STATUTS: Record<number, StatutDef | undefined> = {
  1:  { id: 1,  label: 'Élaboré',             cssClass: 'statut-elabore'     },
  2:  { id: 2,  label: 'Soumis',              cssClass: 'statut-soumis'      },
  4:  { id: 4,  label: 'Contrôlé',            cssClass: 'statut-controle'    },
  5:  { id: 5,  label: 'Rejeté',              cssClass: 'statut-rejete'      },
  6:  { id: 6,  label: 'Modif. demandée',     cssClass: 'statut-modif'       },
  7:  { id: 7,  label: 'Approuvé',            cssClass: 'statut-approuve'    },
  8:  { id: 8,  label: 'Validé',              cssClass: 'statut-valide'      },
  10: { id: 10, label: 'Refusé',              cssClass: 'statut-refuse'      },
  12: { id: 12, label: 'Formule A soumise',   cssClass: 'statut-fa-soumis'   },
  13: { id: 13, label: 'Formule A contrôlée', cssClass: 'statut-fa-controle' },
  14: { id: 14, label: 'Formule A approuvée', cssClass: 'statut-fa-approuve' },
  15: { id: 15, label: 'Formule A validée',   cssClass: 'statut-valide'      },
};

// ─── Rôles simulés (miroir GECO) ──────────────────────────────────────────────
export type RoleId = 1 | 3 | 4 | 6;

export interface RoleSimule {
  id: RoleId;
  label: string;
  team: number;
}

export const ROLES: RoleSimule[] = [
  { id: 1, label: 'Exportateur',         team: 4 },
  { id: 3, label: 'Contrôleur CCIAM',    team: 1 },
  { id: 4, label: 'Superviseur CCIAM',   team: 1 },
  { id: 6, label: 'Président CCIAM',     team: 1 },
];

// ─── Interfaces ───────────────────────────────────────────────────────────────
export interface LigneProduit {
  produit: string;
  description: string;
  typeLigne: 'BOIS' | 'HYDRO';
  quantite: number | null;
  uniteStatistique: string;
  // Bois
  volume: number | null;
  poidsBrut: number | null;
  poidsNet: number | null;
  valeurFob: number | null;
  devise: string;
  // Hydro
  densiteAir: number | null;
  densiteVide: number | null;
  api: number | null;
}

export interface FichierJoint {
  numeroFacture: string;
  nom: string;
  taille: number;
  type: string;
}

export interface Destinataire {
  nom: string;
  adresse: string;
  paysDestination: string;
  paysOrigine: string;
  zoneCoupe: string;
}

export interface CommentaireApprobation {
  role: string;
  action: string;
  commentaire: string;
  date: string;
}

export interface CertificatOrigine {
  id: string;
  numeroCertificat: string;
  chambreCommerce: string;
  moduleTransport: string;
  destinataire: string;
  adresseDestinataire: string;
  paysDestination: string;
  paysOrigine: string;
  zoneCoupe: string;
  formule: string;           // CO / CO+ALC / EUR1
  typeCertificat: string;    // 1=BOIS, 2=HYDRO
  navire: string;
  pavillon: string;
  statutId: number;
  isFormuleA: boolean;
  statutFormuleA: number | null;
  creeLe: string;
  lignes: LigneProduit[];
  fichiers: FichierJoint[];
  historique: CommentaireApprobation[];
  portEmbarquement?: string;
  portDestination?: string;
  aeroportEmbarquement?: string;
  aeroportDestination?: string;
  troncon?: string;
  routeEmbarquement?: string;
  fleuveEmbarquement?: string;
  fleuveDestination?: string;
}

// ─── Transitions valides (miroir ProcessController) ───────────────────────────
const TRANSITIONS_VALIDES: Record<number, number[]> = {
  1:  [2],
  2:  [4, 5],
  4:  [7, 5],
  7:  [8, 5],
  10: [7, 5],
  12: [13, 5],
  13: [14, 5],
  14: [15, 5],
};

const TRANSITIONS_PAR_ROLE: { from: number; to: number; roles: number[] }[] = [
  { from: 2,  to: 4,  roles: [3, 4] },
  { from: 2,  to: 5,  roles: [3, 4] },
  { from: 4,  to: 7,  roles: [3, 4] },
  { from: 4,  to: 5,  roles: [3, 4] },
  { from: 7,  to: 8,  roles: [6]    },
  { from: 7,  to: 5,  roles: [6]    },
  { from: 10, to: 7,  roles: [3, 4] },
  { from: 12, to: 13, roles: [3, 4] },
  { from: 13, to: 14, roles: [3, 4] },
  { from: 14, to: 15, roles: [6]    },
];

@Component({
  selector: 'app-certificat-origine',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './certificat-origine.component.html',
  styleUrls: ['./certificat-origine.component.scss']
})
export class CertificatOrigineComponent implements OnInit {

  // ─── Expose STATUTS pour le template ──────────────────────────────────────
  readonly STATUTS = STATUTS;

  // ─── Vue principale ────────────────────────────────────────────────────────
  vue: 'liste' | 'formulaire' | 'detail' = 'liste';
  modeEdition = false;
  idEnEdition: string | null = null;

  // ─── Rôle simulé (en production : vient du AuthService) ───────────────────
  roles = ROLES;
  roleActifId: RoleId = 1;
  get roleActif(): RoleSimule { return ROLES.find(r => r.id === this.roleActifId)!; }

  // ─── Stepper (formulaire) ─────────────────────────────────────────────────
  etapeActive = 0;
  readonly ETAPES = [
    { label: 'Identification', icon: 'icofont-id-card'     },
    { label: 'Transport',      icon: 'icofont-paper-plane' },
  ];

  // ─── Formulaire principal ─────────────────────────────────────────────────
  form!: FormGroup;

  // ─── Formulaire ligne produit ─────────────────────────────────────────────
  formLigne!: FormGroup;
  afficherFormLigne = false;
  indexLigneEdition: number | null = null;
  lignesData: LigneProduit[] = [];
  typeLigneActive: 'BOIS' | 'HYDRO' = 'BOIS';

  // ─── Formulaire approbation ───────────────────────────────────────────────
  formApprobation!: FormGroup;
  afficherModalApprobation = false;
  actionEnCours: number | null = null;

  // ─── Destinataires ────────────────────────────────────────────────────────
  destinataires: Destinataire[] = [];
  formDestinataire!: FormGroup;
  afficherModalCreateDestinataire = false;
  suggestionsPaysDestinataire: { country: string; code: string }[] = [];
  showSuggestionsPaysDestinataire = false;
  suggestionsPaysOrigineDestinataire: { country: string; code: string }[] = [];
  showSuggestionsPaysOrigineDestinataire = false;

  // ─── Fichiers ─────────────────────────────────────────────────────────────
  fichiersJoints: FichierJoint[] = [];
  formFacture!: FormGroup;
  afficherModalFacture = false;
  fichierFactureEnAttente: File | null = null;
  erreurFacture = '';

  // ─── Feedback UI ──────────────────────────────────────────────────────────
  showSuccesLigne      = false;
  showSuccesSoumission = false;
  erreurApprobation    = '';
  showSuccesApprobation = false;

  // ─── Transport ────────────────────────────────────────────────────────────
  moduleActuel: string = '';

  // ─── Référentiels API ─────────────────────────────────────────────────────
  partenairesApi:     PartenaireDto[]     = [];
  exportateursApi:    ExportateurDto[]    = [];
  typesCertificatsApi:CertificateTypeDto[]= [];
  exportateursFiltres:ExportateurDto[]    = []; // filtrés par partenaire sélectionné

  // ─── Référentiels locaux ──────────────────────────────────────────────────
  chambresCommerce = [
    'CCI Congo – Pointe-Noire',
    'CCI Congo – Brazzaville',
    'CCI Congo – Dolisie',
    'CCI Congo – Ouesso',
  ];

  formules = [
    { value: 'CO',      label: 'CO Standard'   },
    { value: 'CO+ALC',  label: 'CO + ALC'      },
    { value: 'EUR1',    label: 'EUR-1'          },
  ];

  // Formules disponibles selon la CCI choisie
  readonly formuleParCCI: Record<string, { value: string; label: string }[]> = {
    'CCI Congo – Pointe-Noire': [
      { value: 'CO',       label: 'Certificat d\'origine'              },
      { value: 'CO+FA',    label: 'Certificat d\'origine + Formule A'  },
    ],
    'CCI Congo – Ouesso': [
      { value: 'CO',       label: 'Certificat d\'origine'                        },
      { value: 'CO+EUR1',  label: 'Certificat d\'origine + EUR-1'                },
      { value: 'CO+ALC',   label: 'CO + Attestation de libre commercialisation'  },
    ],
  };

  get formulesDisponibles(): { value: string; label: string }[] {
    const partenaireId = this.form?.get('chambreCommerce')?.value || '';
    const partenaire   = this.partenairesApi.find(p => p.id === partenaireId);
    const nom          = partenaire?.nom ?? partenaireId;
    // Cherche par nom ou par fragment du nom
    const key = Object.keys(this.formuleParCCI).find(k => nom.includes(k) || k.includes(nom));
    return key ? this.formuleParCCI[key] : this.formules;
  }

  typesCertificats = [
    { value: '1', label: 'Type 1 — Bois / Grumes'         },
    { value: '2', label: 'Type 2 — Hydrocarbures / Pétrole'},
  ];

  zonesCoupe = [
    'Zone Nord', 'Zone Sud', 'Zone Centre',
    'Zone Ouest', 'Zone Est', 'Bassin du Congo', 'Sangha', 'Léfini',
  ];

  devises = ['XAF', 'EUR', 'USD', 'GBP', 'CNY'];
  unitesStatistiques = ['KG', 'T', 'M3', 'L', 'Unité', 'Carton', 'Palette', 'M2', 'Tonne'];
  troncons = [
    'Pointe-Noire – Brazzaville', 'Brazzaville – Ouesso',
    'Pointe-Noire – Dolisie',     'Dolisie – Brazzaville',
    'Brazzaville – Bangui',
  ];
  routesEmbarquement = [
    'RN1 – Route nationale 1', 'RN2 – Route nationale 2',
    'RN4 – Route nationale 4', 'Route du CFCO',
  ];
  fleuvesEmbarquement = [
    'Fleuve Congo – Brazzaville', 'Rivière Sangha',
    'Rivière Oubangui',           'Rivière Likouala', 'Rivière Alima',
  ];
  fleuvesDestination = [
    'Fleuve Congo – Kinshasa', 'Fleuve Congo – Bangui',
    'Rivière Sangha – Cameroun', 'Rivière Oubangui – RCA',
  ];

  portsMaritimes: string[] = [];
  suggestionsPortEmbarquement: string[] = [];
  suggestionsPortDestination: string[] = [];
  showPortsEmbarquement = false;
  showPortsDestination  = false;

  aeroports: string[] = [
    'Aéroport Maya-Maya – Brazzaville', 'Aéroport de Pointe-Noire',
    'Aéroport d\'Ollombo',              'Aéroport de Dolisie',
    'Aéroport de Ouesso',               'Aéroport Charles de Gaulle – Paris',
    'Aéroport d\'Heathrow – Londres',   'Aéroport de Francfort',
    'Aéroport JFK – New York',          'Aéroport de Pékin',
  ];
  suggestionsAeroportEmbarquement: string[] = [];
  suggestionsAeroportDestination: string[]  = [];
  showAeroportsEmbarquement = false;
  showAeroportsDestination  = false;

  paysListe: { country: string; code: string }[] = [];
  suggestionsPays: { country: string; code: string }[] = [];
  showSuggestionsPays = false;
  suggestionsPaysOrigine: { country: string; code: string }[] = [];
  showSuggestionsPaysOrigine = false;

  produitsRef = [
    { code: '4403', libelle: 'Bois bruts / Grumes',          type: 'BOIS'  },
    { code: '4407', libelle: 'Bois sciés / Dédossés',        type: 'BOIS'  },
    { code: '4408', libelle: 'Feuilles pour placage',         type: 'BOIS'  },
    { code: '2709', libelle: 'Pétrole brut',                  type: 'HYDRO' },
    { code: '2710', libelle: 'Huiles de pétrole raffinées',   type: 'HYDRO' },
    { code: '1801', libelle: 'Cacao en fèves',                type: 'BOIS'  },
    { code: '0901', libelle: 'Café',                          type: 'BOIS'  },
    { code: '1511', libelle: 'Huile de palme',                type: 'BOIS'  },
    { code: '3104', libelle: 'Potasse / Engrais potassiques', type: 'BOIS'  },
    { code: '2601', libelle: 'Minerais de fer',               type: 'BOIS'  },
    { code: '2603', libelle: 'Minerais de cuivre',            type: 'BOIS'  },
  ];

  // ─── Liste certificats (chargée depuis l'API) ─────────────────────────────
  certificats: CertificatOrigine[] = [];

  certificatSelectionne: CertificatOrigine | null = null;
  searchTerm = '';

  // ─── État API ─────────────────────────────────────────────────────────────
  chargement = false;
  erreurApi   = '';
  successApi  = '';

  // ─── Constructeur ─────────────────────────────────────────────────────────
  constructor(private fb: FormBuilder, private coService: CertificatOrigineService) {}

  ngOnInit(): void {
    this._buildForm();
    this._buildFormLigne();
    this._buildFormApprobation();
    this._buildFormDestinataire();
    this._buildFormFacture();
    this._loadReferentiels();
    this._chargerReferentielsApi();
    this._chargerCertificats();
  }

  // ─── Chargement référentiels depuis l'API ─────────────────────────────────
  private _chargerReferentielsApi(): void {
    // Partenaires (Chambres de commerce)
    this.coService.getPartenaires().subscribe({
      next: (list) => { this.partenairesApi = list; },
      error: () => {} // silencieux, fallback sur données locales
    });

    // Exportateurs
    this.coService.getExportateurs().subscribe({
      next: (list) => {
        this.exportateursApi = list;
        this.exportateursFiltres = list;
      },
      error: () => {}
    });

    // Types de certificats
    this.coService.getTypesCertificats().subscribe({
      next: (list) => { this.typesCertificatsApi = list; },
      error: () => {}
    });
  }

  // ─── Filtre les exportateurs quand on change de partenaire ───────────────
  onChambreCommerceChange(): void {
    const partenaireId = this.form.get('chambreCommerce')?.value || '';
    // Filtre exportateurs par partenaire
    this.exportateursFiltres = partenaireId
      ? this.exportateursApi.filter(e => e.partenaireId === partenaireId)
      : this.exportateursApi;
    // Reset exportateur si hors liste
    const currentExp = this.form.get('exportateurId')?.value;
    if (currentExp && !this.exportateursFiltres.some(e => e.id === currentExp)) {
      this.form.patchValue({ exportateurId: '' });
    }
    // Reset formule si hors liste CCI
    const cci = this.partenairesApi.find(p => p.id === partenaireId)?.nom ?? partenaireId;
    const dispo = this.formuleParCCI[cci] ?? this.formules;
    const actuelle = this.form.get('formule')?.value;
    if (!dispo.some(f => f.value === actuelle)) {
      this.form.patchValue({ formule: dispo[0]?.value ?? '' });
    }
  }

  // ─── Chargement liste depuis l'API ────────────────────────────────────────
  private _chargerCertificats(): void {
    this.chargement = true;
    this.coService.getAll().subscribe({
      next: (list) => {
        this.certificats = list.map(dto => this._dtoToLocal(dto));
        this.chargement = false;
      },
      error: (err) => {
        this.erreurApi = err.message;
        this.chargement = false;
      }
    });
  }

  // ─── Convertit un DTO API → modèle local ─────────────────────────────────
  private _dtoToLocal(dto: CertificatOrigineDto): CertificatOrigine {
    // Résout les noms depuis les référentiels chargés
    const partenaire   = this.partenairesApi.find(p => p.id === dto.abonnementId) ?? null;
    const exportateur  = this.exportateursApi.find(e => e.id === dto.exportateur)  ?? null;
    const typeCert     = this.typesCertificatsApi.find(t => t.id === dto.type)     ?? null;

    return {
      id:                   dto.id,
      numeroCertificat:     dto.certificateNo   ?? '',
      chambreCommerce:      dto.partenaire       ?? partenaire?.nom ?? '',
      moduleTransport:      '',
      destinataire:         dto.exportateur      ?? exportateur?.raisonSociale ?? exportateur?.nom ?? '',
      adresseDestinataire:  exportateur?.adresse ?? '',
      paysDestination:      dto.paysDestination  ?? '',
      paysOrigine:          '',
      zoneCoupe:            '',
      formule:              dto.formule          ?? '',
      typeCertificat:       dto.type             ?? typeCert?.nom ?? '1',
      navire:               dto.navire           ?? '',
      pavillon:             '',
      statutId:             this._statutNomToId(dto.statutNom),
      isFormuleA:           false,
      statutFormuleA:       null,
      creeLe:               dto.creeLe ? new Date(dto.creeLe).toLocaleDateString('fr-FR').replace(/\//g,'-') : '',
      lignes:               (dto.certificateLines ?? []).map(l => this._lineDtoToLocal(l)),
      fichiers:             [],
      historique:           (dto.commentaires ?? []).map(c => ({
        role:         c.auteur      ?? '',
        action:       c.contenu     ?? '',
        commentaire:  '',
        date:         c.creeLe ? new Date(c.creeLe).toLocaleDateString('fr-FR').replace(/\//g,'-') : '',
      })),
      portEmbarquement:     dto.portCongo   ?? '',
      portDestination:      dto.portSortie  ?? '',
    };
  }

  private _lineDtoToLocal(l: CertificateLineDto): LigneProduit {
    return {
      produit:          l.hsCode              ?? '',
      description:      l.lineNatureOfProduct ?? '',
      typeLigne:        'BOIS',
      quantite:         l.lineQuantity        ? parseFloat(l.lineQuantity) : null,
      uniteStatistique: l.lineUnits           ?? '',
      volume:           l.lineVolume          ? parseFloat(l.lineVolume)   : null,
      poidsBrut:        l.lineGrossWeight     ? parseFloat(l.lineGrossWeight) : null,
      poidsNet:         l.lineNetWeight       ? parseFloat(l.lineNetWeight)   : null,
      valeurFob:        l.lineFOBValue        ? parseFloat(l.lineFOBValue)    : null,
      devise:           'XAF',
      densiteAir:       null,
      densiteVide:      null,
      api:              null,
      _id:              l.id,
    } as any;
  }

  private _statutNomToId(nom: string | null): number {
    const map: Record<string, number> = {
      'Élaboré': 1, 'Elaboré': 1, 'elabore': 1,
      'Soumis': 2,
      'Contrôlé': 4, 'Controle': 4,
      'Rejeté': 5, 'Rejete': 5,
      'Modification': 6,
      'Approuvé': 7, 'Approuve': 7,
      'Validé': 8, 'Valide': 8,
      'Refusé': 10,
    };
    return map[nom ?? ''] ?? 1;
  }

  // ─── Accès rapide controls ────────────────────────────────────────────────
  get f() { return this.form.controls; }

  // ─── Construction formulaire principal ────────────────────────────────────
  private _buildForm(): void {
    this.form = this.fb.group({
      numeroCertificat:     [{ value: '', disabled: true }],
      chambreCommerce:      ['', Validators.required],
      exportateurId:        ['', Validators.required],
      moduleTransport:      ['', Validators.required],
      formule:              ['', Validators.required],
      typeCertificat:       [''],
      navire:               [''],
      pavillon:             [''],
      portEmbarquement:     [''],
      portDestination:      [''],
      aeroportEmbarquement: [''],
      aeroportDestination:  [''],
      troncon:              [''],
      routeEmbarquement:    [''],
      fleuveEmbarquement:   [''],
      fleuveDestination:    [''],
      destinataire:         [''],
      adresseDestinataire:  [''],
      paysDestination:      [''],
      paysOrigine:          [''],
      zoneCoupe:            [''],
    });
  }

  // ─── Construction formulaire ligne ────────────────────────────────────────
  private _buildFormLigne(): void {
    this.formLigne = this.fb.group({
      produit:          ['', Validators.required],
      description:      [''],
      typeLigne:        ['BOIS'],
      quantite:         [null, [Validators.required, Validators.min(0.001)]],
      uniteStatistique: ['', Validators.required],
      devise:           ['XAF'],
      // Bois
      volume:           [null],
      poidsBrut:        [null],
      poidsNet:         [null],
      valeurFob:        [null],
      // Hydro
      densiteAir:       [null],
      densiteVide:      [null],
      api:              [null],
    });
  }

  // ─── Construction formulaire approbation ──────────────────────────────────
  private _buildFormApprobation(): void {
    this.formApprobation = this.fb.group({
      motDePasse:  ['', Validators.required],
      commentaire: [''],
    });
  }

  // ─── Chargement référentiels ──────────────────────────────────────────────
  private _loadReferentiels(): void {
    this.paysListe = (paysData as any[]).map(p => ({
      country: p.country,
      code: p.iso_alpha2 || p.iso_alpha3 || ''
    }));
    const portsSet = new Set<string>();
    (paysData as any[]).forEach(p => {
      (p.ports_maritimes || []).forEach((pm: any) => portsSet.add(pm.name));
    });
    this.portsMaritimes = Array.from(portsSet);
  }

  // ─── Helpers statut ───────────────────────────────────────────────────────
  getStatut(cert: CertificatOrigine): StatutDef {
    const id = cert.isFormuleA && cert.statutFormuleA ? cert.statutFormuleA : cert.statutId;
    return (STATUTS[id] ?? STATUTS[1])!;
  }

  getStatutClass(cert: CertificatOrigine): string {
    return this.getStatut(cert).cssClass;
  }

  getStatutLabel(cert: CertificatOrigine): string {
    return this.getStatut(cert).label;
  }

  // ─── Stepper navigation ───────────────────────────────────────────────────
  allerEtape(n: number): void {
    if (n < this.etapeActive) { this.etapeActive = n; return; }
    if (n === 1 && !this._validerEtape0()) { this.form.markAllAsTouched(); return; }
    if (n === 2 && !this._validerEtape1()) return;
    if (n >= 3 && this.lignesData.length === 0) return;
    this.etapeActive = n;
  }

  etapeSuivante(): void  { this.allerEtape(this.etapeActive + 1); }
  etapePrecedente(): void { this.etapeActive = Math.max(0, this.etapeActive - 1); }

  private _validerEtape0(): boolean {
    const ctrl = ['chambreCommerce', 'moduleTransport', 'formule', 'typeCertificat'];
    return ctrl.every(c => this.form.get(c)?.valid);
  }

  private _validerEtape1(): boolean {
    return !!this.form.get('paysDestination')?.value &&
           !!this.form.get('paysOrigine')?.value &&
           !!this.form.get('destinataire')?.value;
  }

  etapeValide(n: number): boolean {
    if (n === 0) return this._validerEtape0();
    if (n === 1) return this._validerEtape1();
    if (n === 2) return this.lignesData.length > 0;
    if (n === 3) return this.fichiersJoints.length > 0;
    return false;
  }

  // ─── Module transport ─────────────────────────────────────────────────────
  onModuleTransportChange(): void {
    this.moduleActuel = this.form.get('moduleTransport')?.value || '';
    this.form.patchValue({
      portEmbarquement: '', portDestination: '',
      aeroportEmbarquement: '', aeroportDestination: '',
      troncon: '', routeEmbarquement: '',
      fleuveEmbarquement: '', fleuveDestination: '',
    });
  }

  // ─── Chambre de commerce → reset formule si hors liste CCI ────────────────

  // ─── Type certificat → type ligne ─────────────────────────────────────────
  onTypeCertificatChange(): void {
    const t = this.form.get('typeCertificat')?.value;
    this.typeLigneActive = t === '2' ? 'HYDRO' : 'BOIS';
    this.lignesData = [];
  }

  get typeLigneFormActuel(): 'BOIS' | 'HYDRO' {
    const type = this.certificatSelectionne?.typeCertificat
      ?? this.form.get('typeCertificat')?.value;
    return type === '2' ? 'HYDRO' : 'BOIS';
  }

  // ─── Autocomplete ports ───────────────────────────────────────────────────
  onPortInput(type: 'embarquement' | 'destination', val: string): void {
    const v = val.toLowerCase();
    const filtered = v.length >= 2
      ? this.portsMaritimes.filter(p => p.toLowerCase().includes(v)).slice(0, 6) : [];
    if (type === 'embarquement') {
      this.suggestionsPortEmbarquement = filtered;
      this.showPortsEmbarquement = filtered.length > 0;
    } else {
      this.suggestionsPortDestination = filtered;
      this.showPortsDestination = filtered.length > 0;
    }
  }

  selectPort(type: 'embarquement' | 'destination', port: string): void {
    this.form.patchValue(type === 'embarquement' ? { portEmbarquement: port } : { portDestination: port });
    if (type === 'embarquement') this.showPortsEmbarquement = false;
    else this.showPortsDestination = false;
  }

  hidePortSuggestions(type: 'embarquement' | 'destination'): void {
    setTimeout(() => {
      if (type === 'embarquement') this.showPortsEmbarquement = false;
      else this.showPortsDestination = false;
    }, 200);
  }

  // ─── Autocomplete aéroports ───────────────────────────────────────────────
  onAeroportInput(type: 'embarquement' | 'destination', val: string): void {
    const v = val.toLowerCase();
    const filtered = v.length >= 2
      ? this.aeroports.filter(a => a.toLowerCase().includes(v)).slice(0, 6) : [];
    if (type === 'embarquement') {
      this.suggestionsAeroportEmbarquement = filtered;
      this.showAeroportsEmbarquement = filtered.length > 0;
    } else {
      this.suggestionsAeroportDestination = filtered;
      this.showAeroportsDestination = filtered.length > 0;
    }
  }

  selectAeroport(type: 'embarquement' | 'destination', a: string): void {
    this.form.patchValue(type === 'embarquement' ? { aeroportEmbarquement: a } : { aeroportDestination: a });
    if (type === 'embarquement') this.showAeroportsEmbarquement = false;
    else this.showAeroportsDestination = false;
  }

  hideAeroportSuggestions(type: 'embarquement' | 'destination'): void {
    setTimeout(() => {
      if (type === 'embarquement') this.showAeroportsEmbarquement = false;
      else this.showAeroportsDestination = false;
    }, 200);
  }

  // ─── Autocomplete pays ────────────────────────────────────────────────────
  onPaysDestinationInput(val: string): void {
    const v = val.toLowerCase();
    this.suggestionsPays = v.length >= 2
      ? this.paysListe.filter(p => p.country.toLowerCase().includes(v)).slice(0, 6) : [];
    this.showSuggestionsPays = this.suggestionsPays.length > 0;
  }

  selectPays(pays: string): void {
    this.form.patchValue({ paysDestination: pays });
    this.showSuggestionsPays = false;
  }

  hideSuggestionsPays(): void { setTimeout(() => { this.showSuggestionsPays = false; }, 200); }

  onPaysOrigineInput(val: string): void {
    const v = val.toLowerCase();
    this.suggestionsPaysOrigine = v.length >= 2
      ? this.paysListe.filter(p => p.country.toLowerCase().includes(v)).slice(0, 6) : [];
    this.showSuggestionsPaysOrigine = this.suggestionsPaysOrigine.length > 0;
  }

  selectPaysOrigine(pays: string): void {
    this.form.patchValue({ paysOrigine: pays });
    this.showSuggestionsPaysOrigine = false;
  }

  hideSuggestionsPaysOrigine(): void { setTimeout(() => { this.showSuggestionsPaysOrigine = false; }, 200); }

  // ─── Modal destinataire ───────────────────────────────────────────────────
  private _buildFormDestinataire(): void {
    this.formDestinataire = this.fb.group({
      nom:             ['', Validators.required],
      adresse:         [''],
      paysDestination: ['', Validators.required],
      paysOrigine:     ['', Validators.required],
      zoneCoupe:       [''],
    });
  }

  ouvrirModalDestinataire(): void {
    this.formDestinataire.reset();
    this.suggestionsPaysDestinataire = [];
    this.showSuggestionsPaysDestinataire = false;
    this.suggestionsPaysOrigineDestinataire = [];
    this.showSuggestionsPaysOrigineDestinataire = false;
    this.afficherModalCreateDestinataire = true;
  }

  fermerModalDestinataire(): void {
    this.afficherModalCreateDestinataire = false;
  }

  sauvegarderDestinataire(): void {
    if (this.formDestinataire.invalid) { this.formDestinataire.markAllAsTouched(); return; }
    const d: Destinataire = this.formDestinataire.value;
    this.destinataires.push(d);
    // Sélectionner automatiquement le nouveau destinataire dans le formulaire principal
    this.form.patchValue({
      destinataire:        d.nom,
      adresseDestinataire: d.adresse,
      paysDestination:     d.paysDestination,
      paysOrigine:         d.paysOrigine,
      zoneCoupe:           d.zoneCoupe,
    });
    this.fermerModalDestinataire();
  }

  onDestinataireChange(nom: string): void {
    const d = this.destinataires.find(x => x.nom === nom);
    if (d) {
      this.form.patchValue({
        adresseDestinataire: d.adresse,
        paysDestination:     d.paysDestination,
        paysOrigine:         d.paysOrigine,
        zoneCoupe:           d.zoneCoupe,
      });
    }
  }

  // Autocomplete pays destination (modal destinataire)
  onPaysDestinataireInput(val: string): void {
    const v = val.toLowerCase();
    this.suggestionsPaysDestinataire = v.length >= 2
      ? this.paysListe.filter(p => p.country.toLowerCase().includes(v)).slice(0, 6) : [];
    this.showSuggestionsPaysDestinataire = this.suggestionsPaysDestinataire.length > 0;
  }

  selectPaysDestinataire(pays: string): void {
    this.formDestinataire.patchValue({ paysDestination: pays });
    this.showSuggestionsPaysDestinataire = false;
  }

  hideSuggestionsPaysDestinataire(): void {
    setTimeout(() => { this.showSuggestionsPaysDestinataire = false; }, 200);
  }

  // Autocomplete pays origine (modal destinataire)
  onPaysOrigineDestinataireInput(val: string): void {
    const v = val.toLowerCase();
    this.suggestionsPaysOrigineDestinataire = v.length >= 2
      ? this.paysListe.filter(p => p.country.toLowerCase().includes(v)).slice(0, 6) : [];
    this.showSuggestionsPaysOrigineDestinataire = this.suggestionsPaysOrigineDestinataire.length > 0;
  }

  selectPaysOrigineDestinataire(pays: string): void {
    this.formDestinataire.patchValue({ paysOrigine: pays });
    this.showSuggestionsPaysOrigineDestinataire = false;
  }

  hideSuggestionsPaysOrigineDestinataire(): void {
    setTimeout(() => { this.showSuggestionsPaysOrigineDestinataire = false; }, 200);
  }

  // ─── Gestion lignes produits ──────────────────────────────────────────────
  ouvrirFormLigne(): void {
    this.indexLigneEdition = null;
    this.typeLigneActive = this.typeLigneFormActuel;
    this.formLigne.reset({ devise: 'XAF', typeLigne: this.typeLigneActive });
    this.afficherFormLigne = true;
  }

  editerLigne(index: number): void {
    this.indexLigneEdition = index;
    this.formLigne.patchValue(this.lignesData[index]);
    this.typeLigneActive = this.lignesData[index].typeLigne;
    this.afficherFormLigne = true;
  }

  validerLigne(): void {
    if (this.formLigne.invalid) { this.formLigne.markAllAsTouched(); return; }
    if (!this.certificatSelectionne) return;

    const v = this.formLigne.value;
    const dto: CreerCertificateLineDto = {
      hsCode:              v.produit,
      lineNatureOfProduct: v.description,
      lineQuantity:        String(v.quantite ?? ''),
      lineUnits:           v.uniteStatistique,
      lineGrossWeight:     String(v.poidsBrut ?? ''),
      lineNetWeight:       String(v.poidsNet  ?? ''),
      lineFOBValue:        String(v.valeurFob ?? ''),
      lineVolume:          String(v.volume    ?? ''),
    };

    this.chargement = true;
    const certId  = this.certificatSelectionne.id;
    const ligneId = (this.lignesData[this.indexLigneEdition ?? -1] as any)?._id;

    const call$ = (this.indexLigneEdition !== null && ligneId)
      ? this.coService.modifierLigne(certId, ligneId, dto)
      : this.coService.ajouterLigne(certId, dto);

    call$.subscribe({
      next: () => {
        // Recharge les lignes depuis l'API
        this.coService.getLignes(certId).subscribe({
          next: (lignes) => {
            this.certificatSelectionne!.lignes = lignes.map(l => this._lineDtoToLocal(l));
            this.lignesData = [...this.certificatSelectionne!.lignes];
            this._afficherSuccesLigne();
            this.afficherFormLigne = false;
            this.indexLigneEdition = null;
            this.formLigne.reset({ devise: 'XAF', typeLigne: this.typeLigneActive });
            this.chargement = false;
          },
          error: () => { this.chargement = false; }
        });
      },
      error: (err) => { this.erreurApi = err.message; this.chargement = false; }
    });
  }

  supprimerLigne(index: number): void {
    if (!this.certificatSelectionne) return;
    const ligneId = (this.lignesData[index] as any)?._id;
    if (!ligneId) { this.lignesData.splice(index, 1); return; }

    this.chargement = true;
    this.coService.supprimerLigne(this.certificatSelectionne.id, ligneId).subscribe({
      next: () => {
        this.lignesData.splice(index, 1);
        this.certificatSelectionne!.lignes = [...this.lignesData];
        if (this.indexLigneEdition === index) {
          this.afficherFormLigne = false;
          this.indexLigneEdition = null;
        }
        this.chargement = false;
      },
      error: (err) => { this.erreurApi = err.message; this.chargement = false; }
    });
  }

  annulerFormLigne(): void {
    this.afficherFormLigne = false;
    this.indexLigneEdition = null;
    this.formLigne.reset({ devise: 'XAF' });
  }

  private _afficherSuccesLigne(): void {
    this.showSuccesLigne = true;
    setTimeout(() => { this.showSuccesLigne = false; }, 3000);
  }

  onProduitChange(code: string): void {
    const p = this.produitsRef.find(x => x.code === code);
    if (p) {
      this.formLigne.patchValue({ description: p.libelle });
      this.typeLigneActive = p.type as 'BOIS' | 'HYDRO';
    }
  }

  // ─── Formulaire facture ────────────────────────────────────────────────────
  private _buildFormFacture(): void {
    this.formFacture = this.fb.group({
      numeroFacture: ['', Validators.required],
    });
  }

  ouvrirModalFacture(): void {
    this.formFacture.reset();
    this.fichierFactureEnAttente = null;
    this.erreurFacture = '';
    this.afficherModalFacture = true;
  }

  fermerModalFacture(): void {
    this.afficherModalFacture = false;
    this.fichierFactureEnAttente = null;
    this.erreurFacture = '';
  }

  onFichierFactureSelectionne(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      this.erreurFacture = 'Seuls les fichiers PDF sont acceptés.';
      this.fichierFactureEnAttente = null;
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      this.erreurFacture = 'Le fichier dépasse la taille maximale de 4 Mo.';
      this.fichierFactureEnAttente = null;
      return;
    }
    this.erreurFacture = '';
    this.fichierFactureEnAttente = file;
  }

  sauvegarderFacture(): void {
    if (this.formFacture.invalid) { this.formFacture.markAllAsTouched(); return; }
    if (!this.fichierFactureEnAttente) {
      this.erreurFacture = 'Veuillez sélectionner un fichier PDF.';
      return;
    }
    const fj: FichierJoint = {
      numeroFacture: this.formFacture.value.numeroFacture,
      nom:           this.fichierFactureEnAttente.name,
      taille:        this.fichierFactureEnAttente.size,
      type:          this.fichierFactureEnAttente.type,
    };
    // Ajouter au certificat sélectionné si on est en vue detail
    if (this.certificatSelectionne) {
      this.certificatSelectionne.fichiers.push(fj);
    } else {
      this.fichiersJoints.push(fj);
    }
    this.fermerModalFacture();
  }

  supprimerFichier(index: number): void {
    if (this.certificatSelectionne) {
      this.certificatSelectionne.fichiers.splice(index, 1);
    } else {
      this.fichiersJoints.splice(index, 1);
    }
  }

  // Helper : retourne la valeur uniquement si c'est un UUID valide, sinon null
  private _uuidOrNull(val: string | null | undefined): string | undefined {
    if (!val) return undefined;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(val) ? val : undefined;
  }

  // ─── Sauvegarde brouillon → API POST/PUT ─────────────────────────────────
  sauvegarderBrouillon(): void {
    const champsRequis = ['chambreCommerce', 'exportateurId', 'moduleTransport', 'formule'];
    const invalide = champsRequis.some(c => this.form.get(c)?.invalid);
    if (invalide) { this.form.markAllAsTouched(); return; }
    const val = this.form.getRawValue();
    this.chargement = true;
    this.erreurApi  = '';

    if (this.modeEdition && this.idEnEdition) {
      const dto: ModifierCertificatOrigineDto = {
        partenaireId:      this._uuidOrNull(val.chambreCommerce),
        exportateurId:     this._uuidOrNull(val.exportateurId),
        formule:           val.formule  || undefined,
        typeId:            this._uuidOrNull(val.typeCertificat),
        navire:            val.navire   || undefined,
        observation:       val.observation || undefined,
      };
      this.coService.modifier(this.idEnEdition, dto).subscribe({
        next: (updated) => {
          const idx = this.certificats.findIndex(c => c.id === this.idEnEdition);
          if (idx !== -1) {
            this.certificats[idx] = this._dtoToLocal(updated);
            this.certificatSelectionne = this.certificats[idx];
          }
          this.lignesData = [...(this.certificatSelectionne?.lignes ?? [])];
          this.chargement = false;
          this.vue = 'detail';
        },
        error: (err) => { this.erreurApi = err.message; this.chargement = false; }
      });
    } else {
      const dto: CreerCertificatOrigineDto = {
        // certificateNo absent → le backend génère le numéro automatiquement
        partenaireId:  this._uuidOrNull(val.chambreCommerce),
        exportateurId: this._uuidOrNull(val.exportateurId),
        formule:       val.formule,
        typeId:        this._uuidOrNull(val.typeCertificat),
        navire:        val.navire || undefined,
        moduleId:      undefined,
        carnetAdresseId:   undefined,
        paysDestinationId: undefined,
        zoneProductionId:  undefined,
      };
      this.coService.creer(dto).subscribe({
        next: (created) => {
          const cert = this._dtoToLocal(created);
          this.certificats.unshift(cert);
          this.certificatSelectionne = cert;
          this.idEnEdition = cert.id;
          this.modeEdition = true;
          this.lignesData = [];
          this.chargement = false;
          this.vue = 'detail';
        },
        error: (err) => { this.erreurApi = err.message; this.chargement = false; }
      });
    }
  }

  // ─── Soumission → API workflow/soumettre ─────────────────────────────────
  soumettreDepuisDetail(): void {
    if (!this.certificatSelectionne) return;
    this.chargement = true;
    this.coService.soumettre(this.certificatSelectionne.id, { userId: 'exportateur' }).subscribe({
      next: (updated) => {
        const idx = this.certificats.findIndex(c => c.id === updated.id);
        const cert = this._dtoToLocal(updated);
        if (idx !== -1) this.certificats[idx] = cert;
        this.certificatSelectionne = cert;
        this.showSuccesSoumission = true;
        this.chargement = false;
        setTimeout(() => { this.showSuccesSoumission = false; }, 3000);
      },
      error: (err) => { this.erreurApi = err.message; this.chargement = false; }
    });
  }

  // ─── Soumission formulaire (ancien — conservé pour compatibilité) ─────────
  soumettreFormulaire(): void { this.sauvegarderBrouillon(); }
  private _buildCertificatFromForm(val: any, statutId: number = 1): CertificatOrigine {
    const now = new Date().toLocaleDateString('fr-FR').replace(/\//g, '-');
    const num = `CO${100000 + this.certificats.length}${this._dateCode()}`;
    return {
      id: this.idEnEdition || String(Date.now()),
      numeroCertificat: this.modeEdition && this.certificatSelectionne
        ? this.certificatSelectionne.numeroCertificat : num,
      chambreCommerce:      val.chambreCommerce,
      moduleTransport:      val.moduleTransport,
      formule:              val.formule,
      typeCertificat:       val.typeCertificat,
      navire:               val.navire,
      pavillon:             val.pavillon,
      destinataire:         val.destinataire,
      adresseDestinataire:  val.adresseDestinataire,
      paysDestination:      val.paysDestination,
      paysOrigine:          val.paysOrigine,
      zoneCoupe:            val.zoneCoupe,
      statutId,
      isFormuleA:           false,
      statutFormuleA:       null,
      creeLe:               now,
      lignes:               [...this.lignesData],
      fichiers:             [...this.fichiersJoints],
      historique:           [],
      portEmbarquement:     val.portEmbarquement,
      portDestination:      val.portDestination,
      aeroportEmbarquement: val.aeroportEmbarquement,
      aeroportDestination:  val.aeroportDestination,
      troncon:              val.troncon,
      routeEmbarquement:    val.routeEmbarquement,
      fleuveEmbarquement:   val.fleuveEmbarquement,
      fleuveDestination:    val.fleuveDestination,
    };
  }

  private _dateCode(): string {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yy = String(d.getFullYear()).slice(2);
    return `${dd}${mm}${yy}`;
  }

  // ─── Circuit d'approbation ────────────────────────────────────────────────
  get actionsDisponibles(): { statutCible: number; label: string; cssClass: string }[] {
    if (!this.certificatSelectionne) return [];
    const cert = this.certificatSelectionne;
    const currentStatut = cert.isFormuleA && cert.statutFormuleA
      ? cert.statutFormuleA : cert.statutId;

    const transitions = TRANSITIONS_VALIDES[currentStatut] || [];
    return transitions
      .filter(to => this._roleAutorise(currentStatut, to))
      .map(to => {
        const statut = STATUTS[to];
        return {
          statutCible: to,
          label: to === 5 ? 'Rejeter' : `Valider → ${statut?.label}`,
          cssClass: to === 5 ? 'btn-danger' : 'btn-success',
        };
      });
  }

  private _roleAutorise(from: number, to: number): boolean {
    const t = TRANSITIONS_PAR_ROLE.find(x => x.from === from && x.to === to);
    return t ? t.roles.includes(this.roleActifId) : false;
  }

  ouvrirApprobation(statutCible: number): void {
    this.actionEnCours = statutCible;
    this.formApprobation.reset();
    this.erreurApprobation = '';
    this.afficherModalApprobation = true;
  }

  fermerApprobation(): void {
    this.afficherModalApprobation = false;
    this.actionEnCours = null;
    this.erreurApprobation = '';
  }

  confirmerApprobation(): void {
    if (this.formApprobation.invalid) { this.formApprobation.markAllAsTouched(); return; }
    if (!this.certificatSelectionne || this.actionEnCours === null) return;

    const { motDePasse, commentaire } = this.formApprobation.value;
    if (!motDePasse || motDePasse.length < 4) {
      this.erreurApprobation = 'Mot de passe incorrect.';
      return;
    }

    const id  = this.certificatSelectionne.id;
    const req = { userId: String(this.roleActifId), password: motDePasse, commentaire: commentaire || '' };
    this.chargement = true;

    let call$;
    switch (this.actionEnCours) {
      case 4:  call$ = this.coService.controler(id, req);  break;
      case 7:  call$ = this.coService.approuver(id, req);  break;
      case 8:  call$ = this.coService.valider(id, req);    break;
      case 5:  call$ = this.coService.rejeter(id, { ...req, commentaire: commentaire || '' }); break;
      default: call$ = this.coService.approuver(id, req);
    }

    call$.subscribe({
      next: (updated) => {
        const idx  = this.certificats.findIndex(c => c.id === updated.id);
        const cert = this._dtoToLocal(updated);
        if (idx !== -1) this.certificats[idx] = cert;
        this.certificatSelectionne = cert;
        this.showSuccesApprobation = true;
        this.fermerApprobation();
        this.chargement = false;
        setTimeout(() => { this.showSuccesApprobation = false; }, 3000);
      },
      error: (err) => {
        this.erreurApprobation = err.message;
        this.chargement = false;
      }
    });
  }

  demanderFormuleA(): void {
    if (!this.certificatSelectionne) return;
    this.chargement = true;
    this.coService.creerFormuleA(this.certificatSelectionne.id, { userId: String(this.roleActifId) }).subscribe({
      next: (updated) => {
        const cert = this._dtoToLocal(updated);
        const idx  = this.certificats.findIndex(c => c.id === cert.id);
        if (idx !== -1) this.certificats[idx] = cert;
        this.certificatSelectionne = cert;
        this.chargement = false;
      },
      error: (err) => { this.erreurApi = err.message; this.chargement = false; }
    });
  }

  // ─── Navigation vues ──────────────────────────────────────────────────────
  ouvrirFormulaire(): void {
    this.modeEdition = false;
    this.idEnEdition = null;
    this.form.reset();
    this.lignesData = [];
    this.fichiersJoints = [];
    this.afficherFormLigne = false;
    this.moduleActuel = '';
    this.etapeActive = 0;
    this.showSuccesSoumission = false;
    this.vue = 'formulaire';
  }

  modifierCertificat(cert: CertificatOrigine): void {
    this.modeEdition = true;
    this.idEnEdition = cert.id;
    this.certificatSelectionne = cert;
    this.lignesData = [...cert.lignes];
    this.fichiersJoints = [...cert.fichiers];
    this.etapeActive = 0;
    this.moduleActuel = cert.moduleTransport;

    // Filtre les exportateurs selon le partenaire du certificat
    const partenaireId = this.partenairesApi.find(p => p.nom === cert.chambreCommerce)?.id ?? cert.chambreCommerce;
    this.exportateursFiltres = partenaireId
      ? this.exportateursApi.filter(e => e.partenaireId === partenaireId)
      : this.exportateursApi;

    this.form.patchValue({
      chambreCommerce:      partenaireId,
      exportateurId:        this.exportateursApi.find(e => e.nom === cert.destinataire || e.raisonSociale === cert.destinataire)?.id ?? '',
      moduleTransport:      cert.moduleTransport,
      formule:              cert.formule,
      typeCertificat:       this.typesCertificatsApi.find(t => t.nom === cert.typeCertificat)?.id ?? cert.typeCertificat,
      navire:               cert.navire,
      destinataire:         cert.destinataire,
      adresseDestinataire:  cert.adresseDestinataire,
      paysDestination:      cert.paysDestination,
      paysOrigine:          cert.paysOrigine,
      zoneCoupe:            cert.zoneCoupe,
      portEmbarquement:     cert.portEmbarquement || '',
      portDestination:      cert.portDestination || '',
      aeroportEmbarquement: cert.aeroportEmbarquement || '',
      aeroportDestination:  cert.aeroportDestination || '',
      troncon:              cert.troncon || '',
      routeEmbarquement:    cert.routeEmbarquement || '',
      fleuveEmbarquement:   cert.fleuveEmbarquement || '',
      fleuveDestination:    cert.fleuveDestination || '',
    });
    this.afficherFormLigne = false;
    this.vue = 'formulaire';
  }

  afficher(cert: CertificatOrigine): void {
    this.certificatSelectionne = cert;
    this.lignesData = [...cert.lignes];
    this.afficherFormLigne = false;
    this.afficherModalApprobation = false;
    this.vue = 'detail';
  }

  retourListe(): void {
    this.vue = 'liste';
    this.certificatSelectionne = null;
    this.modeEdition = false;
    this.idEnEdition = null;
    this.afficherModalApprobation = false;
  }

  // ─── PDF ──────────────────────────────────────────────────────────────────
  genererPDF(type: 'CO' | 'FormuleA' | 'EUR1' | 'ALC'): void {
    if (!this.certificatSelectionne) return;
    const id = this.certificatSelectionne.id;
    const map: Record<string, 'co' | 'eur1' | 'alc' | 'formule-a' | 'ouesso'> = {
      CO: 'co', EUR1: 'eur1', ALC: 'alc', FormuleA: 'formule-a',
    };
    // CCI Ouesso → PDF spécifique
    const isOuesso = this.certificatSelectionne.chambreCommerce?.toLowerCase().includes('ouesso');
    const pdfType  = isOuesso && type === 'CO' ? 'ouesso' : (map[type] ?? 'co');
    this.coService.ouvrirPdf(id, pdfType);
  }

  // ─── Liste filtrée ────────────────────────────────────────────────────────
  get certificatsFiltres(): CertificatOrigine[] {
    const t = this.searchTerm.toLowerCase();
    if (!t) return this.certificats;
    return this.certificats.filter(c =>
      c.numeroCertificat.toLowerCase().includes(t) ||
      c.destinataire.toLowerCase().includes(t) ||
      c.paysDestination.toLowerCase().includes(t) ||
      c.chambreCommerce.toLowerCase().includes(t)
    );
  }

  // ─── Permissions ─────────────────────────────────────────────────────────
  get peutSoumettre(): boolean {
    return this.roleActifId === 1 &&
           !!this.certificatSelectionne &&
           this.certificatSelectionne.statutId === 1;
  }

  peutModifier(cert: CertificatOrigine): boolean {
    return this.roleActifId === 1 && [1, 5].includes(cert.statutId);
  }

  peutDemanderFormuleA(cert: CertificatOrigine): boolean {
    return this.roleActifId === 1 && cert.statutId === 8 && !cert.isFormuleA;
  }

  peutGenererPDF(cert: CertificatOrigine): boolean {
    return cert.statutId === 8 || cert.statutFormuleA === 15;
  }
}
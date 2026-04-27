import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AssuranceService } from '../../../services/assurance.service';
import { Assurance, CreateAssuranceCommand } from '../../../models/assurance.models';

@Component({
  selector: 'app-assurances',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './assurances.component.html',
  styleUrls: ['./assurances.component.scss']
})
export class AssurancesComponent implements OnInit {

  vue: 'liste' | 'detail' | 'formulaire' = 'liste';
  stepDetail: number = 1;

  // ── Liste ─────────────────────────────────────────────────
  searchTerm: string = '';
  assurances: Assurance[] = [];
  assuranceSelectionnee: Assurance | null = null;
  loading = false;
  erreur = '';

  // ── Référentiel (chargé depuis le microservice) ───────────
  deviseList: any[] = [];
  specificitesList: any[] = [];
  typeTransportList: any[] = [];
  garantieList: any[] = [];
  paysList: any[] = [];
  assureList: any[] = [];

  // ── Formulaire ────────────────────────────────────────────
  form!: FormGroup;
  step = 1;
  totalSteps = 6;
  progress = '0%';
  factureFileName = '';

  constructor(
    private fb: FormBuilder,
    private assuranceService: AssuranceService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.chargerAssurances();
    this.chargerReferentiel();
  }

  // ── Chargements HTTP ──────────────────────────────────────

  chargerAssurances(): void {
    this.loading = true;
    this.erreur = '';
    this.assuranceService.getAll().subscribe({
      next: (data) => { this.assurances = data; this.loading = false; },
      error: (err) => {
        console.error(err);
        this.erreur = 'Impossible de charger les assurances.';
        this.loading = false;
      }
    });
  }

  chargerReferentiel(): void {
    this.assuranceService.getDevises().subscribe({ next: d => this.deviseList = d, error: () => {} });
    this.assuranceService.getSpecificites().subscribe({ next: d => this.specificitesList = d, error: () => {} });
    this.assuranceService.getTypeTransports().subscribe({ next: d => this.typeTransportList = d, error: () => {} });
    this.assuranceService.getGaranties().subscribe({ next: d => this.garantieList = d, error: () => {} });
    this.assuranceService.getPays().subscribe({ next: d => this.paysList = d, error: () => {} });
  }

  // ── Filtre liste ──────────────────────────────────────────

  assurancesFiltrees(): Assurance[] {
    if (!this.searchTerm) return this.assurances;
    const t = this.searchTerm.toLowerCase();
    return this.assurances.filter(a =>
      a.noPolice?.toLowerCase().includes(t) ||
      a.importateur?.toLowerCase().includes(t) ||
      a.statut?.toLowerCase().includes(t) ||
      a.designation?.toLowerCase().includes(t)
    );
  }

  // ── Utilitaires affichage ─────────────────────────────────

  getStatutClass(statut: string | undefined): string {
    const map: { [k: string]: string } = {
      'Elaboré':               'statut-elabore',
      'Visa demandé':          'statut-visa-demande',
      'Ouvert':                'statut-ouvert',
      'Visa refusé':           'statut-visa-refuse',
      'Modification demandée': 'statut-modification'
    };
    return map[statut || ''] || '';
  }

  getGarantieName(id: string | undefined): string {
    if (!id) return '—';
    const g = this.garantieList.find(g => g.id === id);
    return g ? (g.nomGarantie || g.nom || id) : id;
  }

  getSignatureColor(val: number): string { return val === 0 ? '#e8e8e8' : '#198754'; }
  getSignatureDash(val: number): string { return val + ' 100'; }
  getSignatureClass(val: number): string {
    if (val === 100) return 'sig-full';
    if (val > 0) return 'sig-partial';
    return 'sig-empty';
  }

  // ── Navigation vues ───────────────────────────────────────

  afficher(a: Assurance): void {
    this.assuranceSelectionnee = a;
    this.vue = 'detail';
  }

  ouvrirFormulaire(): void {
    this.resetFormulaire();
    this.vue = 'formulaire';
  }

  retourListe(): void {
    this.vue = 'liste';
    this.assuranceSelectionnee = null;
    this.stepDetail = 1;
  }

  // ── Formulaire multi-steps ────────────────────────────────

  initForm(): void {
    this.form = this.fb.group({
      typePartenaire: this.fb.group({
        assure:         ['', Validators.required],
        typePartenaire: ['', Validators.required]
      }),
      voyage: this.fb.group({
        modeTransport:    ['', Validators.required],
        lieuTransit:      [''],
        dureeTransit:     [''],
        paysProvenance:   [''],
        paysDestination:  [''],
        portEmbarquement: [''],
        portDebarquement: [''],
        nomTransporteur:  ['', Validators.required],
        nomNavire:        [''],
        typeNavire:       ['']
      }),
      marchandise: this.fb.group({
        designation:               ['', Validators.required],
        nature:                    ['', Validators.required],
        specificites:              ['', Validators.required],
        conditionnement:           ['', Validators.required],
        valeurDevise:              ['', Validators.required],
        valeurFCFA:                [''],
        devise:                    ['', Validators.required],
        masseKg:                   ['', Validators.required],  // affiché comme masseBrute en API
        marque:                    [''],
        descriptionConditionnement:['']                        // affiché comme description en API
      }),
      contrat: this.fb.group({
        dateDebut:   ['', Validators.required],
        dateFin:     ['', Validators.required],
        duree:       ['', Validators.required],
        typeContrat: ['', Validators.required],
        garantie:    ['', Validators.required],  // envoyé comme garantieId à l'API
        module:      ['']
      }),
      partenaires: this.fb.group({
        facture: ['', Validators.required]
      })
    });
  }

  resetFormulaire(): void {
    this.step = 1;
    this.factureFileName = '';
    this.initForm();
    this.updateProgress();
  }

  next(): void {
    const groupName = this.getGroupName(this.step);
    if (groupName) {
      const group = this.form.get(groupName);
      if (group) { group.markAllAsTouched(); if (group.invalid) return; }
    }
    if (this.step < this.totalSteps) { this.step++; this.updateProgress(); }
  }

  previous(): void {
    if (this.step > 1) { this.step--; this.updateProgress(); }
  }

  updateProgress(): void {
    this.progress = ((this.step - 1) / (this.totalSteps - 1)) * 100 + '%';
  }

  getGroupName(step: number): string {
    const map: { [k: number]: string } = {
      1: 'typePartenaire', 2: 'voyage', 3: 'marchandise', 4: 'contrat', 5: 'partenaires'
    };
    return map[step] || '';
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.factureFileName = input.files[0].name;
      this.form.get('partenaires.facture')?.setValue(this.factureFileName);
    }
  }

  // ── Soumission → POST /api/v1/assurances ─────────────────

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const v = this.form.value;

    // L'assuré est sélectionné par id depuis assureList — on résout son nom
    const assureSelectionne = this.assureList.find(a => a.id === v.typePartenaire.assure);

    const cmd: CreateAssuranceCommand = {
      importateurNom:   assureSelectionne?.nom || v.typePartenaire.assure,
      importateurNIU:   assureSelectionne?.niu || undefined,
      dateDebut:        v.contrat.dateDebut ? new Date(v.contrat.dateDebut).toISOString() : undefined,
      dateFin:          v.contrat.dateFin   ? new Date(v.contrat.dateFin).toISOString()   : undefined,
      typeContrat:      v.contrat.typeContrat,
      duree:            v.contrat.duree,
      module:           v.contrat.module,
      garantieId:       v.contrat.garantie || undefined,       // template: "garantie" → API: "garantieId"
      statut:           'Elaboré',
      designation:      v.marchandise.designation,
      nature:           v.marchandise.nature,
      specificites:     v.marchandise.specificites,
      conditionnement:  v.marchandise.conditionnement,
      description:      v.marchandise.descriptionConditionnement,  // template: "descriptionConditionnement"
      valeurDevise:     parseFloat(v.marchandise.valeurDevise) || 0,
      valeurFCFA:       parseFloat(v.marchandise.valeurFCFA)   || 0,
      devise:           v.marchandise.devise,
      masseBrute:       v.marchandise.masseKg,                 // template: "masseKg" → API: "masseBrute"
      marque:           v.marchandise.marque,
      nomTransporteur:  v.voyage.nomTransporteur,
      nomNavire:        v.voyage.nomNavire,
      typeNavire:       v.voyage.typeNavire,
      paysProvenance:   v.voyage.paysProvenance,
      paysDestination:  v.voyage.paysDestination,
      portEmbarquement: v.voyage.portEmbarquement || undefined,
      portDebarquement: v.voyage.portDebarquement || undefined
    };

    this.assuranceService.create(cmd).subscribe({
      next: (created) => {
        // Recharger la liste depuis le serveur pour avoir l'id réel
        this.chargerAssurances();
        alert('Assurance créée avec succès.');
        this.vue = 'liste';
      },
      error: (err) => {
        console.error('Erreur création', err);
        alert('Erreur lors de la création. Vérifier la console.');
      }
    });
  }
}

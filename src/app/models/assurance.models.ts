// Modèles générés depuis AssuranceService.Api v1 (OAS 3.0)

/** Réponse paginée retournée par GET /assurance/assurances */
export interface PagedResult<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
}

export interface Assurance {
  id: string;
  noPolice?: string;
  numeroCert?: string;
  importateur?: string;
  importateurNom?: string;
  importateurNIU?: string;
  dateDebut?: string;
  dateFin?: string;
  typeContrat?: string;
  duree?: string;
  module?: string;
  statut?: string;
  ocre?: string;
  assureurId?: string;
  intermediaireId?: string;
  garantieId?: string;
  designation?: string;
  nature?: string;
  specificites?: string;
  conditionnement?: string;
  description?: string;
  valeurFCFA?: number;
  valeurDevise?: number;
  devise?: string;
  masseBrute?: string;
  uniteStatistique?: string;
  marque?: string;
  nomTransporteur?: string;
  nomNavire?: string;
  typeNavire?: string;
  lieuSejour?: string;
  dureeSejour?: string;
  paysProvenance?: string;
  paysDestination?: string;
  portEmbarquement?: string;
  portDebarquement?: string;
  aeroportEmbarquement?: string;
  aeroportDebarquement?: string;
  routeNationale?: string;
}

export interface CreateAssuranceCommand {
  importateurNom?: string;
  importateurNIU?: string;
  dateDebut?: string;
  dateFin?: string;
  typeContrat?: string;
  duree?: string;
  module?: string;
  assureurId?: string;
  intermediaireId?: string;
  garantieId?: string;
  ocre?: string;
  statut?: string;
  designation?: string;
  nature?: string;
  specificites?: string;
  conditionnement?: string;
  description?: string;
  valeurFCFA?: number;
  valeurDevise?: number;
  devise?: string;
  masseBrute?: string;
  uniteStatistique?: string;
  marque?: string;
  nomTransporteur?: string;
  nomNavire?: string;
  typeNavire?: string;
  lieuSejour?: string;
  dureeSejour?: string;
  paysProvenance?: string;
  paysDestination?: string;
  portEmbarquement?: string;
  portDebarquement?: string;
  aeroportEmbarquement?: string;
  aeroportDebarquement?: string;
  routeNationale?: string;
}

export interface UpdateAssuranceCommand {
  id: string;
  noPolice?: string;
  numeroCert?: string;
  importateur?: string;
  dateDebut?: string;
  dateFin?: string;
  typeContrat?: string;
  duree?: string;
  statut?: string;
  module?: string;
  assureurId?: string;
  intermediaireId?: string;
  garantieId?: string;
  nomTransporteur?: string;
  nomNavire?: string;
  typeNavire?: string;
  modifierPar?: string;
}

export interface ChoisirAssureurRequest {
  assureurId: string;
}

export interface SignerAssuranceRequest {
  signataireId: string;
  decision?: string;
}

export interface SubmitAssuranceCommand {
  assuranceId: string;
}

export interface CreatePrimeCommand {
  taux?: number;
  valeurFCFA: number;
  valeurDevise: number;
  primeNette?: number;
  accessoires?: number;
  taxe?: number;
  primeTotale?: number;
  assuranceId: string;
  statut?: string;
}

export interface CreateGarantieCommand {
  nomGarantie?: string;
  taux?: number;
  accessoires: number;
  actif: boolean;
}

export interface UpdateGarantieCommand {
  id: string;
  nomGarantie?: string;
  taux?: number;
  accessoires: number;
  actif: boolean;
}
// ─── DTOs retournés par l'API ─────────────────────────────────────────────

export interface PartenaireDto {
  id:               string;
  codePartenaire:   string | null;
  nom:              string | null;
  adresse:          string | null;
  telephone:        string | null;
  email:            string | null;
  typePartenaireId: string | null;
  typePartenaireNom:string | null;
  departementId:    string | null;
  departementNom:   string | null;
  actif:            boolean;
}

export interface ExportateurDto {
  id:               string;
  codeExportateur:  string | null;
  nom:              string | null;
  raisonSociale:    string | null;
  adresse:          string | null;
  telephone:        string | null;
  email:            string | null;
  actif:            boolean;
  partenaireId:     string | null;
  partenaireNom:    string | null;
}

export interface CertificateTypeDto {
  id:   string;
  code: string | null;
  nom:  string | null;
}

export interface StatutCertificatDto {
  id: string;
  code: string | null;
  nom:  string | null;
}

export interface CertificateLineDto {
  id:                   string;
  certificateId:        string;
  hsCode:               string | null;
  lineNatureOfProduct:  string | null;
  lineQuantity:         string | null;
  lineUnits:            string | null;
  lineGrossWeight:      string | null;
  lineNetWeight:        string | null;
  lineFOBValue:         string | null;
  lineVolume:           string | null;
  creeLe:               string | null;
}

export interface CertificatOrigineDto {
  id:                   string;
  certificateNo:        string | null;
  exportateur:          string | null;
  partenaire:           string | null;
  paysDestination:      string | null;
  portSortie:           string | null;
  portCongo:            string | null;
  type:                 string | null;
  formule:              string | null;
  mandataire:           string | null;
  statutCertificatId:   string | null;
  statutNom:            string | null;
  observation:          string | null;
  carnetAdresseId:      string | null;
  navire:               string | null;
  documentsId:          string | null;
  creeLe:               string;
  creePar:              string | null;
  modifierLe:           string | null;
  certificateLines:     CertificateLineDto[] | null;
  commentaires:         CommentaireDto[] | null;
  abonnementId:         string | null;
}

export interface CommentaireDto {
  id:          string;
  contenu:     string | null;
  auteur:      string | null;
  creeLe:      string | null;
}

// ─── DTOs envoyés à l'API ─────────────────────────────────────────────────

export interface CreerCertificatOrigineDto {
  certificateNo?:        string;
  exportateurId?:        string;
  partenaireId?:         string;
  paysDestinationId?:    string;
  portSortieId?:         string;
  portCongoId?:          string;
  typeId?:               string;
  formule?:              string;
  mandataire?:           string;
  observation?:          string;
  carnetAdresseId?:      string;
  navire?:               string;
  documentsId?:          string;
  zoneProductionId?:     string;
  bureauDedouanementId?: string;
  moduleId?:             string;
  deviseId?:             string;
  certificateLines?:     CreerCertificateLineDto[];
}
export interface ModifierCertificatOrigineDto {
  exportateurId?:       string;
  partenaireId?:        string;
  paysDestinationId?:   string;
  portSortieId?:        string;
  portCongoId?:         string;
  typeId?:              string;
  formule?:             string;
  mandataire?:          string;
  observation?:         string;
  carnetAdresseId?:     string;
  navire?:              string;
  documentsId?:         string;
  zoneProductionId?:    string;
  bureauDedouanementId?:string;
  moduleId?:            string;
  deviseId?:            string;
}

export interface CreerCertificateLineDto {
  hsCode?:              string;
  lineNatureOfProduct?: string;
  lineQuantity?:        string;
  lineUnits?:           string;
  lineGrossWeight?:     string;
  lineNetWeight?:       string;
  lineFOBValue?:        string;
  lineVolume?:          string;
}

export interface ModifierCertificateLineDto extends CreerCertificateLineDto {}

// ─── Requêtes workflow ──────────────────────────────────────────────────── 

export interface SoumettreCertificatRequest  { userId?: string; }
export interface ControleCertificatRequest   { userId?: string; password?: string; }
export interface ApprouverCertificatRequest  { userId?: string; password?: string; }
export interface ValiderCertificatRequest    { userId?: string; password?: string; }
export interface RejeterCertificatRequest    { userId?: string; password?: string; commentaire?: string; }
export interface DemanderModificationRequest { userId?: string; commentaire?: string; }
export interface CreerFormuleARequest        { userId?: string; password?: string; }
export interface CreerCommentaireDto         { contenu: string; auteur?: string; }
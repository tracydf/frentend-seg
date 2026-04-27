import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import {
  CertificatOrigineDto,
  CertificateLineDto,
  CommentaireDto,
  StatutCertificatDto,
  PartenaireDto,
  ExportateurDto,
  CertificateTypeDto,
  CreerCertificatOrigineDto,
  ModifierCertificatOrigineDto,
  CreerCertificateLineDto,
  ModifierCertificateLineDto,
  SoumettreCertificatRequest,
  ControleCertificatRequest,
  ApprouverCertificatRequest,
  ValiderCertificatRequest,
  RejeterCertificatRequest,
  DemanderModificationRequest,
  CreerFormuleARequest,
  CreerCommentaireDto,
} from '../models/certificat-origine.models';

@Injectable({ providedIn: 'root' })
export class CertificatOrigineService {

  // URL relative → passe par le proxy Angular (proxy.conf.json)
  // qui redirige /api → http://192.168.2.89:8700/api
  private readonly base = '/api';

  constructor(private http: HttpClient) {}

  private handleError(err: HttpErrorResponse): Observable<never> {
    let msg: string;
    if (err.status === 0) {
      msg = `Impossible de contacter le microservice. Vérifiez que le proxy Angular est actif et que http://192.168.2.89:8700 est accessible.`;
    } else if (err.status === 400) {
      const body = err.error;
      if (body?.errors) {
        // Format ASP.NET validation errors: { "Field": ["message"] }
        const details = Object.entries(body.errors)
          .map(([k, v]) => `${k}: ${(v as string[]).join(', ')}`)
          .join(' | ');
        msg = `Validation (400) — ${details}`;
      } else {
        msg = `Données invalides (400) — ${body?.title ?? body?.message ?? JSON.stringify(body)}`;
      }
    } else {
      msg = err.error?.message ?? err.error?.title ?? err.message ?? `Erreur ${err.status}`;
    }
    return throwError(() => new Error(msg));
  }

  // ─── Certificats ──────────────────────────────────────────────────────────

  getAll(): Observable<CertificatOrigineDto[]> {
    return this.http.get(`${this.base}/certificats`, { responseType: 'text' }).pipe(
      map(text => {
        try {
          const parsed = JSON.parse(text);
          // L'API peut retourner soit un tableau direct, soit { data: [...] } ou { value: [...] }
          if (Array.isArray(parsed)) return parsed as CertificatOrigineDto[];
          if (Array.isArray(parsed?.data))  return parsed.data  as CertificatOrigineDto[];
          if (Array.isArray(parsed?.value)) return parsed.value as CertificatOrigineDto[];
          return [] as CertificatOrigineDto[];
        } catch {
          return [] as CertificatOrigineDto[];
        }
      }),
      catchError(e => this.handleError(e))
    );
  }

  getById(id: string): Observable<CertificatOrigineDto> {
    return this.http.get<CertificatOrigineDto>(`${this.base}/certificats/${id}`)
      .pipe(catchError(e => this.handleError(e)));
  }

  getByNumero(no: string): Observable<CertificatOrigineDto> {
    return this.http.get<CertificatOrigineDto>(`${this.base}/certificats/numero/${no}`)
      .pipe(catchError(e => this.handleError(e)));
  }

  getByExportateur(exportateurId: string): Observable<CertificatOrigineDto[]> {
    return this.http.get<CertificatOrigineDto[]>(`${this.base}/certificats/exportateur/${exportateurId}`)
      .pipe(catchError(e => this.handleError(e)));
  }

  getByStatut(statut: string): Observable<CertificatOrigineDto[]> {
    return this.http.get<CertificatOrigineDto[]>(`${this.base}/certificats/statut/${statut}`)
      .pipe(catchError(e => this.handleError(e)));
  }

  getByPays(paysDestination: string): Observable<CertificatOrigineDto[]> {
    return this.http.get<CertificatOrigineDto[]>(`${this.base}/certificats/pays/${paysDestination}`)
      .pipe(catchError(e => this.handleError(e)));
  }

  creer(dto: CreerCertificatOrigineDto): Observable<CertificatOrigineDto> {
  const clean = JSON.parse(JSON.stringify(dto));  
  // Sécurité : ne jamais envoyer certificateNo (même vide) — le backend génère lui-même
  delete clean['certificateNo'];
  return this.http.post<CertificatOrigineDto>(`${this.base}/certificats`, clean)
    .pipe(catchError(e => this.handleError(e)));
  }

  modifier(id: string, dto: ModifierCertificatOrigineDto): Observable<CertificatOrigineDto> {
    return this.http.put<CertificatOrigineDto>(`${this.base}/certificats/${id}`, dto)
      .pipe(catchError(e => this.handleError(e)));
  }

  supprimer(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/certificats/${id}`)
      .pipe(catchError(e => this.handleError(e)));
  }

  // ─── Lignes ───────────────────────────────────────────────────────────────

  getLignes(certificateId: string): Observable<CertificateLineDto[]> {
    return this.http.get<CertificateLineDto[]>(`${this.base}/certificats/${certificateId}/lignes`)
      .pipe(catchError(e => this.handleError(e)));
  }

  ajouterLigne(certificateId: string, dto: CreerCertificateLineDto): Observable<CertificateLineDto> {
    return this.http.post<CertificateLineDto>(`${this.base}/certificats/${certificateId}/lignes`, dto)
      .pipe(catchError(e => this.handleError(e)));
  }

  modifierLigne(certificateId: string, ligneId: string, dto: ModifierCertificateLineDto): Observable<CertificateLineDto> {
    return this.http.put<CertificateLineDto>(`${this.base}/certificats/${certificateId}/lignes/${ligneId}`, dto)
      .pipe(catchError(e => this.handleError(e)));
  }

  supprimerLigne(certificateId: string, ligneId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/certificats/${certificateId}/lignes/${ligneId}`)
      .pipe(catchError(e => this.handleError(e)));
  }

  // ─── Workflow ─────────────────────────────────────────────────────────────

  soumettre(id: string, req: SoumettreCertificatRequest): Observable<CertificatOrigineDto> {
    return this.http.post<CertificatOrigineDto>(`${this.base}/workflow/${id}/soumettre`, req)
      .pipe(catchError(e => this.handleError(e)));
  }

  controler(id: string, req: ControleCertificatRequest): Observable<CertificatOrigineDto> {
    return this.http.post<CertificatOrigineDto>(`${this.base}/workflow/${id}/controle`, req)
      .pipe(catchError(e => this.handleError(e)));
  }

  approuver(id: string, req: ApprouverCertificatRequest): Observable<CertificatOrigineDto> {
    return this.http.post<CertificatOrigineDto>(`${this.base}/workflow/${id}/approuver`, req)
      .pipe(catchError(e => this.handleError(e)));
  }

  valider(id: string, req: ValiderCertificatRequest): Observable<CertificatOrigineDto> {
    return this.http.post<CertificatOrigineDto>(`${this.base}/workflow/${id}/valider`, req)
      .pipe(catchError(e => this.handleError(e)));
  }

  rejeter(id: string, req: RejeterCertificatRequest): Observable<CertificatOrigineDto> {
    return this.http.post<CertificatOrigineDto>(`${this.base}/workflow/${id}/rejeter`, req)
      .pipe(catchError(e => this.handleError(e)));
  }

  demanderModification(id: string, req: DemanderModificationRequest): Observable<CertificatOrigineDto> {
    return this.http.post<CertificatOrigineDto>(`${this.base}/workflow/${id}/demander-modification`, req)
      .pipe(catchError(e => this.handleError(e)));
  }

  verifierTransition(id: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.base}/workflow/${id}/transition-valide`)
      .pipe(catchError(e => this.handleError(e)));
  }

  getTransitionsPossibles(id: string, userId: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.base}/workflow/${id}/transitions-possibles?userId=${userId}`)
      .pipe(catchError(e => this.handleError(e)));
  }

  // ─── PDF (ouvre dans un nouvel onglet) ────────────────────────────────────
  ouvrirPdf(id: string, type: 'co' | 'eur1' | 'alc' | 'formule-a' | 'ouesso' = 'co'): void {
    window.open(`${this.base}/pdf/${id}/${type}`, '_blank');
  }

  // ─── Formule A ────────────────────────────────────────────────────────────

  creerFormuleA(id: string, req: CreerFormuleARequest): Observable<CertificatOrigineDto> {
    return this.http.post<CertificatOrigineDto>(`${this.base}/formule-a/${id}`, req)
      .pipe(catchError(e => this.handleError(e)));
  }

  controlerFormuleA(id: string, req: ControleCertificatRequest): Observable<CertificatOrigineDto> {
    return this.http.post<CertificatOrigineDto>(`${this.base}/formule-a/${id}/controle`, req)
      .pipe(catchError(e => this.handleError(e)));
  }

  approuverFormuleA(id: string, req: ApprouverCertificatRequest): Observable<CertificatOrigineDto> {
    return this.http.post<CertificatOrigineDto>(`${this.base}/formule-a/${id}/approuver`, req)
      .pipe(catchError(e => this.handleError(e)));
  }

  validerFormuleA(id: string, req: ValiderCertificatRequest): Observable<CertificatOrigineDto> {
    return this.http.post<CertificatOrigineDto>(`${this.base}/formule-a/${id}/valider`, req)
      .pipe(catchError(e => this.handleError(e)));
  }

  rejeterFormuleA(id: string, req: RejeterCertificatRequest): Observable<CertificatOrigineDto> {
    return this.http.post<CertificatOrigineDto>(`${this.base}/formule-a/${id}/rejeter`, req)
      .pipe(catchError(e => this.handleError(e)));
  }

  // ─── Commentaires ─────────────────────────────────────────────────────────

  getCommentaires(certificateId: string): Observable<CommentaireDto[]> {
    return this.http.get<CommentaireDto[]>(`${this.base}/certificats/${certificateId}/commentaires`)
      .pipe(catchError(e => this.handleError(e)));
  }

  ajouterCommentaire(certificateId: string, dto: CreerCommentaireDto): Observable<CommentaireDto> {
    return this.http.post<CommentaireDto>(`${this.base}/certificats/${certificateId}/commentaires`, dto)
      .pipe(catchError(e => this.handleError(e)));
  }

  // ─── Statuts & Types ──────────────────────────────────────────────────────

  getStatuts(): Observable<StatutCertificatDto[]> {
    return this.http.get<StatutCertificatDto[]>(`${this.base}/statuts-certificats`)
      .pipe(catchError(e => this.handleError(e)));
  }

  getStatutByCode(code: string): Observable<StatutCertificatDto> {
    return this.http.get<StatutCertificatDto>(`${this.base}/statuts-certificats/code/${code}`)
      .pipe(catchError(e => this.handleError(e)));
  }

  getTypesCertificats(): Observable<CertificateTypeDto[]> {
    return this.http.get<CertificateTypeDto[]>(`${this.base}/types-certificats`)
      .pipe(catchError(e => this.handleError(e)));
  }

  // ─── Partenaires (Chambres de commerce) ───────────────────────────────────

  getPartenaires(): Observable<PartenaireDto[]> {
    return this.http.get<PartenaireDto[]>(`${this.base}/partenaires/actifs`)
      .pipe(catchError(e => this.handleError(e)));
  }

  getPartenaireById(id: string): Observable<PartenaireDto> {
    return this.http.get<PartenaireDto>(`${this.base}/partenaires/${id}`)
      .pipe(catchError(e => this.handleError(e)));
  }

  // ─── Exportateurs ─────────────────────────────────────────────────────────

  getExportateurs(): Observable<ExportateurDto[]> {
    return this.http.get<ExportateurDto[]>(`${this.base}/exportateurs/actifs`)
      .pipe(catchError(e => this.handleError(e)));
  }

  getExportateurById(id: string): Observable<ExportateurDto> {
    return this.http.get<ExportateurDto>(`${this.base}/exportateurs/${id}`)
      .pipe(catchError(e => this.handleError(e)));
  }

  getExportateursByPartenaire(partenaireId: string): Observable<ExportateurDto[]> {
    return this.http.get<ExportateurDto[]>(`${this.base}/exportateurs/partenaire/${partenaireId}`)
      .pipe(catchError(e => this.handleError(e)));
  }

  // ─── PDF ──────────────────────────────────────────────────────────────────

  getPdfUrl(id: string, type: 'co' | 'eur1' | 'alc' | 'formule-a' | 'ouesso' = 'co'): string {
    return `${this.base}/pdf/${id}/${type}`;
  }
}

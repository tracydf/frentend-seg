import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environment';
import {
  Assurance,
  PagedResult,
  CreateAssuranceCommand,
  UpdateAssuranceCommand,
  ChoisirAssureurRequest,
  SignerAssuranceRequest,
  SubmitAssuranceCommand,
  CreatePrimeCommand,
  CreateGarantieCommand,
  UpdateGarantieCommand
} from '../models/assurance.models';

@Injectable({ providedIn: 'root' })
export class AssuranceService {

  /** Base URL du microservice assurance */
  private assuranceBase = environment.assuranceApiUrl;

  constructor(private http: HttpClient) {}

  // ── Assurances ────────────────────────────────────────────

  /**
   * GET /assurance/assurances
   * Retourne { data: Assurance[], total, page, perPage }
   * On extrait uniquement le tableau `data` pour garder la compatibilité
   * avec le reste du composant.
   */
  getAll(page: number = 1, perPage: number = 100, search?: string): Observable<Assurance[]> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('perPage', perPage.toString());
    if (search) params = params.set('search', search);

    return this.http
      .get<PagedResult<Assurance>>(`${this.assuranceBase}/assurance/assurances`, { params })
      .pipe(map(response => response.data));
  }

  /**
   * Variante qui renvoie la page complète (pagination, total…)
   * utile si on veut afficher la pagination côté composant.
   */
  getAllPaged(page: number = 1, perPage: number = 10, search?: string): Observable<PagedResult<Assurance>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('perPage', perPage.toString());
    if (search) params = params.set('search', search);

    return this.http.get<PagedResult<Assurance>>(
      `${this.assuranceBase}/assurance/assurances`, { params }
    );
  }

  getById(id: string): Observable<Assurance> {
    return this.http.get<Assurance>(`${this.assuranceBase}/assurance/assurances/${id}`);
  }

  create(cmd: CreateAssuranceCommand): Observable<any> {
    return this.http.post(`${this.assuranceBase}/assurance/assurances`, cmd);
  }

  update(id: string, cmd: UpdateAssuranceCommand): Observable<any> {
    return this.http.put(`${this.assuranceBase}/assurance/assurances/${id}`, cmd);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.assuranceBase}/assurance/assurances/${id}`);
  }

  // ── Actions métier ────────────────────────────────────────

  choisirAssureur(id: string, req: ChoisirAssureurRequest): Observable<any> {
    return this.http.post(`${this.assuranceBase}/assurance/assurances/${id}/choisir-assureur`, req);
  }

  signer(id: string, req: SignerAssuranceRequest): Observable<any> {
    return this.http.post(`${this.assuranceBase}/assurance/assurances/${id}/signer`, req);
  }

  startProcess(id: string): Observable<any> {
    return this.http.post(`${this.assuranceBase}/assurance/assurances/${id}/start-process`, {});
  }

  submit(cmd: SubmitAssuranceCommand): Observable<any> {
    return this.http.post(`${this.assuranceBase}/assurance/assurances/submit`, cmd);
  }

  // ── Primes ────────────────────────────────────────────────

  createPrime(cmd: CreatePrimeCommand): Observable<any> {
    return this.http.post(`${this.assuranceBase}/assurance/primes`, cmd);
  }

  // ── Garanties ─────────────────────────────────────────────

  getGaranties(): Observable<any[]> {
    return this.http.get<any[]>(`${this.assuranceBase}/assurance/garanties`);
  }

  getGarantieById(id: string): Observable<any> {
    return this.http.get(`${this.assuranceBase}/assurance/garanties/${id}`);
  }

  createGarantie(cmd: CreateGarantieCommand): Observable<any> {
    return this.http.post(`${this.assuranceBase}/assurance/garanties`, cmd);
  }

  updateGarantie(id: string, cmd: UpdateGarantieCommand): Observable<any> {
    return this.http.put(`${this.assuranceBase}/assurance/garanties/${id}`, cmd);
  }

  deleteGarantie(id: string): Observable<any> {
    return this.http.delete(`${this.assuranceBase}/assurance/garanties/${id}`);
  }

  // ── Documents ─────────────────────────────────────────────

  getDocuments(assuranceId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.assuranceBase}/assurance/assurances/${assuranceId}/documents`);
  }

  uploadDocument(assuranceId: string, formData: FormData): Observable<any> {
    return this.http.post(`${this.assuranceBase}/assurance/assurances/${assuranceId}/documents`, formData);
  }

  downloadDocument(assuranceId: string, documentId: string): Observable<Blob> {
    return this.http.get(
      `${this.assuranceBase}/assurance/assurances/${assuranceId}/documents/${documentId}/download`,
      { responseType: 'blob' }
    );
  }

  deleteDocument(assuranceId: string, documentId: string): Observable<any> {
    return this.http.delete(
      `${this.assuranceBase}/assurance/assurances/${assuranceId}/documents/${documentId}`
    );
  }

  // ── Référentiel ───────────────────────────────────────────

  getPays(): Observable<any[]> {
    return this.http.get<any[]>(`${this.assuranceBase}/api/v1/referentiel/pays`);
  }

  getDevises(): Observable<any[]> {
    return this.http.get<any[]>(`${this.assuranceBase}/api/v1/referentiel/devises`);
  }

  getStatuts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.assuranceBase}/api/v1/referentiel/statuts`);
  }

  getSpecificites(): Observable<any[]> {
    return this.http.get<any[]>(`${this.assuranceBase}/api/v1/referentiel/specificites`);
  }

  getTypeTransports(): Observable<any[]> {
    return this.http.get<any[]>(`${this.assuranceBase}/api/v1/referentiel/type-transports`);
  }

  getModules(): Observable<any[]> {
    return this.http.get<any[]>(`${this.assuranceBase}/api/v1/referentiel/modules`);
  }

  getPorts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.assuranceBase}/api/v1/referentiel/ports`);
  }

  getPortsByPays(paysId?: string, paysProvenance?: string): Observable<any[]> {
    let params = new HttpParams();
    if (paysId) params = params.set('paysId', paysId);
    if (paysProvenance) params = params.set('paysProvenance', paysProvenance);
    return this.http.get<any[]>(`${this.assuranceBase}/api/v1/referentiel/ports/by-pays`, { params });
  }

  getAeroports(): Observable<any[]> {
    return this.http.get<any[]>(`${this.assuranceBase}/api/v1/referentiel/aeroports`);
  }

  getAeroportsByPays(paysId?: string, paysProvenance?: string): Observable<any[]> {
    let params = new HttpParams();
    if (paysId) params = params.set('paysId', paysId);
    if (paysProvenance) params = params.set('paysProvenance', paysProvenance);
    return this.http.get<any[]>(`${this.assuranceBase}/api/v1/referentiel/aeroports/by-pays`, { params });
  }

  getFleuvesByPays(paysId?: string, paysProvenance?: string): Observable<any[]> {
    let params = new HttpParams();
    if (paysId) params = params.set('paysId', paysId);
    if (paysProvenance) params = params.set('paysProvenance', paysProvenance);
    return this.http.get<any[]>(`${this.assuranceBase}/api/v1/referentiel/fleuves/by-pays`, { params });
  }

  getCorridors(): Observable<any[]> {
    return this.http.get<any[]>(`${this.assuranceBase}/api/v1/referentiel/corridors`);
  }

  getCorridorsByPays(paysId?: string, paysProvenance?: string): Observable<any[]> {
    let params = new HttpParams();
    if (paysId) params = params.set('paysId', paysId);
    if (paysProvenance) params = params.set('paysProvenance', paysProvenance);
    return this.http.get<any[]>(`${this.assuranceBase}/api/v1/referentiel/corridors/by-pays`, { params });
  }

  getTauxDeChange(): Observable<any[]> {
    return this.http.get<any[]>(`${this.assuranceBase}/api/v1/referentiel/taux-de-change`);
  }
}

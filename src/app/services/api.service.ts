import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environment';
import { provideRouter } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // 🔹 Exemple de test
  testApi() {
    return this.http.get(`${this.apiUrl}`);
  }

  // 🔹 Exemple endpoint (à adapter à ton backend)
  getData() {
    return this.http.get(`${this.apiUrl}/api`);
  }
}
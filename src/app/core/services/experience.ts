import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  Experience,
  ExperienceCreateRequest,
  ExperienceUpdateRequest,
} from '../models/experience.model';

@Injectable({
  providedIn: 'root',
})
export class ExperienceService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'https://vishalportfolioapi.onrender.com/api/Experience';

  // ==========================================
  // GET ALL
  // ==========================================

  getExperiences(): Observable<Experience[]> {
    return this.http.get<Experience[]>(this.apiUrl);
  }

  // ==========================================
  // GET BY ID
  // ==========================================

  getExperienceById(id: number): Observable<Experience> {
    return this.http.get<Experience>(`${this.apiUrl}/${id}`);
  }

  // ==========================================
  // CREATE
  // ==========================================

  createExperience(data: ExperienceCreateRequest): Observable<Experience> {
    return this.http.post<Experience>(this.apiUrl, data);
  }

  // ==========================================
  // UPDATE
  // ==========================================

  updateExperience(id: number, data: ExperienceUpdateRequest): Observable<Experience> {
    return this.http.put<Experience>(`${this.apiUrl}/${id}`, data);
  }

  // ==========================================
  // DELETE
  // ==========================================

  deleteExperience(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}

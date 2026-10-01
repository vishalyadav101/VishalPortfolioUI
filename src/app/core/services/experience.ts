import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay, catchError, throwError, tap } from 'rxjs';

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

  private readonly apiUrl = 'https://vishal-yadav-dotnet-developer.somee.com/api/Experience';

  // ==========================================
  // EXPERIENCE CACHE
  // ==========================================

  private experiencesCache$?: Observable<Experience[]>;

  // ==========================================
  // GET ALL
  // ==========================================

  getExperiences(): Observable<Experience[]> {
    // Return cached data if already loaded.
    if (this.experiencesCache$) {
      return this.experiencesCache$;
    }

    this.experiencesCache$ = this.http.get<Experience[]>(this.apiUrl).pipe(
      // Keep latest successful response in memory.
      shareReplay({
        bufferSize: 1,
        refCount: true,
      }),

      // If API fails, allow next request to try again.
      catchError((error) => {
        this.experiencesCache$ = undefined;
        return throwError(() => error);
      }),
    );

    return this.experiencesCache$;
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
    return this.http.post<Experience>(this.apiUrl, data).pipe(
      // Experience list has changed.
      tap(() => {
        this.clearExperiencesCache();
      }),
    );
  }

  // ==========================================
  // UPDATE
  // ==========================================

  updateExperience(id: number, data: ExperienceUpdateRequest): Observable<Experience> {
    return this.http.put<Experience>(`${this.apiUrl}/${id}`, data).pipe(
      // Experience list has changed.
      tap(() => {
        this.clearExperiencesCache();
      }),
    );
  }

  // ==========================================
  // DELETE
  // ==========================================

  deleteExperience(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      // Experience list has changed.
      tap(() => {
        this.clearExperiencesCache();
      }),
    );
  }

  // ==========================================
  // CLEAR EXPERIENCE CACHE
  // ==========================================

  clearExperiencesCache(): void {
    this.experiencesCache$ = undefined;
  }
}

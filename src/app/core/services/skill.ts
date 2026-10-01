import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay, catchError, throwError, tap } from 'rxjs';

import { Skill, SkillCreateRequest, SkillUpdateRequest } from '../models/skill.model';

@Injectable({
  providedIn: 'root',
})
export class SkillService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'https://vishal-yadav-dotnet-developer.somee.com/api/Skill';

  private readonly apiBaseUrl = 'https://vishal-yadav-dotnet-developer.somee.com';

  // ==========================================
  // SKILLS CACHE
  // ==========================================

  private skillsCache$?: Observable<Skill[]>;

  // ==========================================
  // GET ALL SKILLS
  // ==========================================

  getSkills(): Observable<Skill[]> {
    // Return cached skills if already loaded.
    if (this.skillsCache$) {
      return this.skillsCache$;
    }

    this.skillsCache$ = this.http.get<Skill[]>(this.apiUrl).pipe(
      map((skills) => skills.map((skill) => this.normalizeSkillUrl(skill))),

      // Keep latest successful result in memory.
      shareReplay({
        bufferSize: 1,
        refCount: true,
      }),

      // Don't permanently cache an API error.
      catchError((error) => {
        this.skillsCache$ = undefined;
        return throwError(() => error);
      }),
    );

    return this.skillsCache$;
  }

  // ==========================================
  // GET SKILL BY ID
  // ==========================================

  getSkillById(id: number): Observable<Skill> {
    return this.http
      .get<Skill>(`${this.apiUrl}/${id}`)
      .pipe(map((skill) => this.normalizeSkillUrl(skill)));
  }

  // ==========================================
  // CREATE SKILL
  // ==========================================

  createSkill(data: SkillCreateRequest): Observable<Skill> {
    return this.http.post<Skill>(this.apiUrl, data).pipe(
      map((skill) => this.normalizeSkillUrl(skill)),

      // New skill means public skills cache is outdated.
      tap(() => {
        this.clearSkillsCache();
      }),
    );
  }

  // ==========================================
  // UPDATE SKILL
  // ==========================================

  updateSkill(id: number, data: SkillUpdateRequest): Observable<Skill> {
    return this.http.put<Skill>(`${this.apiUrl}/${id}`, data).pipe(
      map((skill) => this.normalizeSkillUrl(skill)),

      // Updated skill means cache is outdated.
      tap(() => {
        this.clearSkillsCache();
      }),
    );
  }

  // ==========================================
  // DELETE SKILL
  // ==========================================

  deleteSkill(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      // Deleted skill means cache is outdated.
      tap(() => {
        this.clearSkillsCache();
      }),
    );
  }

  // ==========================================
  // UPLOAD SKILL ICON
  // ==========================================

  uploadIcon(id: number, file: File): Observable<Skill> {
    const formData = new FormData();

    formData.append('file', file);

    return this.http.post<Skill>(`${this.apiUrl}/${id}/upload-icon`, formData).pipe(
      map((skill) => this.normalizeSkillUrl(skill)),

      // Icon changed, so cached skill data is outdated.
      tap(() => {
        this.clearSkillsCache();
      }),
    );
  }

  // ==========================================
  // CLEAR SKILLS CACHE
  // ==========================================

  clearSkillsCache(): void {
    this.skillsCache$ = undefined;
  }

  // ==========================================
  // NORMALIZE ICON URL
  // ==========================================

  private normalizeSkillUrl(skill: Skill): Skill {
    return {
      ...skill,

      iconUrl: this.toAbsoluteUrl(skill.iconUrl),
    };
  }

  // ==========================================
  // CONVERT RELATIVE URL TO ABSOLUTE URL
  // ==========================================

  private toAbsoluteUrl(url: string | null | undefined): string | null {
    if (!url) {
      return null;
    }

    // Already absolute URL
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // Relative URL starting with /
    if (url.startsWith('/')) {
      return `${this.apiBaseUrl}${url}`;
    }

    // Relative URL without /
    return `${this.apiBaseUrl}/${url}`;
  }
}

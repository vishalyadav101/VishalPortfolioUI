import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { Skill, SkillCreateRequest, SkillUpdateRequest } from '../models/skill.model';

@Injectable({
  providedIn: 'root',
})
export class SkillService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'https://localhost:7295/api/Skill';

  private readonly apiBaseUrl = 'https://localhost:7295';

  // ==========================================
  // GET ALL SKILLS
  // ==========================================

  getSkills(): Observable<Skill[]> {
    return this.http
      .get<Skill[]>(this.apiUrl)
      .pipe(map((skills) => skills.map((skill) => this.normalizeSkillUrl(skill))));
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
    return this.http
      .post<Skill>(this.apiUrl, data)
      .pipe(map((skill) => this.normalizeSkillUrl(skill)));
  }

  // ==========================================
  // UPDATE SKILL
  // ==========================================

  updateSkill(id: number, data: SkillUpdateRequest): Observable<Skill> {
    return this.http
      .put<Skill>(`${this.apiUrl}/${id}`, data)
      .pipe(map((skill) => this.normalizeSkillUrl(skill)));
  }

  // ==========================================
  // DELETE SKILL
  // ==========================================

  deleteSkill(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  // ==========================================
  // UPLOAD SKILL ICON
  // ==========================================

  uploadIcon(id: number, file: File): Observable<Skill> {
    const formData = new FormData();

    formData.append('file', file);

    return this.http
      .post<Skill>(`${this.apiUrl}/${id}/upload-icon`, formData)
      .pipe(map((skill) => this.normalizeSkillUrl(skill)));
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

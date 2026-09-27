import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SkillCategory {
  skillCategoryId: number;
  categoryName: string;
  description: string;
  displayOrder: number;
  isActive: boolean;
  createdDate: string;
  updatedDate: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class SkillCategoryService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'https://vishalportfolioapi.onrender.com/api/SkillCategory';

  getCategories(): Observable<SkillCategory[]> {
    return this.http.get<SkillCategory[]>(this.apiUrl);
  }

  getCategoryById(id: number): Observable<SkillCategory> {
    return this.http.get<SkillCategory>(`${this.apiUrl}/${id}`);
  }
}

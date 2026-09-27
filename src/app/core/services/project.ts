import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Project, ProjectCreateRequest, ProjectUpdateRequest } from '../models/project.model';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'https://vishalportfolioapi.onrender.com/api/Project';

  // ==========================================
  // GET ALL PROJECTS
  // ==========================================

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.apiUrl);
  }

  // ==========================================
  // GET PROJECT BY ID
  // ==========================================

  getProjectById(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${id}`);
  }

  // ==========================================
  // CREATE PROJECT
  // ==========================================

  createProject(data: ProjectCreateRequest): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, data);
  }

  // ==========================================
  // UPDATE PROJECT
  // ==========================================

  updateProject(id: number, data: ProjectUpdateRequest): Observable<Project> {
    return this.http.put<Project>(`${this.apiUrl}/${id}`, data);
  }

  // ==========================================
  // UPLOAD PROJECT IMAGE
  // ==========================================

  uploadProjectImage(id: number, file: File): Observable<Project> {
    const formData = new FormData();

    formData.append('file', file);

    return this.http.post<Project>(`${this.apiUrl}/${id}/upload-image`, formData);
  }

  // ==========================================
  // DELETE PROJECT
  // ==========================================

  deleteProject(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}

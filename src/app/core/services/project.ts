import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay, catchError, throwError, tap } from 'rxjs';

import { Project, ProjectCreateRequest, ProjectUpdateRequest } from '../models/project.model';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'https://vishal-yadav-dotnet-developer.somee.com/api/Project';

  // ==========================================
  // PROJECTS CACHE
  // ==========================================

  private projectsCache$?: Observable<Project[]>;

  // ==========================================
  // GET ALL PROJECTS
  // ==========================================

  getProjects(): Observable<Project[]> {
    // Return cached projects if already loaded.
    if (this.projectsCache$) {
      return this.projectsCache$;
    }

    this.projectsCache$ = this.http.get<Project[]>(this.apiUrl).pipe(
      // Keep latest successful projects response.
      shareReplay({
        bufferSize: 1,
        refCount: true,
      }),

      // Don't permanently cache an API error.
      catchError((error) => {
        this.projectsCache$ = undefined;
        return throwError(() => error);
      }),
    );

    return this.projectsCache$;
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
    return this.http.post<Project>(this.apiUrl, data).pipe(
      // Project list has changed.
      tap(() => {
        this.clearProjectsCache();
      }),
    );
  }

  // ==========================================
  // UPDATE PROJECT
  // ==========================================

  updateProject(id: number, data: ProjectUpdateRequest): Observable<Project> {
    return this.http.put<Project>(`${this.apiUrl}/${id}`, data).pipe(
      // Project list has changed.
      tap(() => {
        this.clearProjectsCache();
      }),
    );
  }

  // ==========================================
  // UPLOAD PROJECT IMAGE
  // ==========================================

  uploadProjectImage(id: number, file: File): Observable<Project> {
    const formData = new FormData();

    formData.append('file', file);

    return this.http.post<Project>(`${this.apiUrl}/${id}/upload-image`, formData).pipe(
      // Project image has changed.
      tap(() => {
        this.clearProjectsCache();
      }),
    );
  }

  // ==========================================
  // DELETE PROJECT
  // ==========================================

  deleteProject(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      // Project list has changed.
      tap(() => {
        this.clearProjectsCache();
      }),
    );
  }

  // ==========================================
  // CLEAR PROJECTS CACHE
  // ==========================================

  clearProjectsCache(): void {
    this.projectsCache$ = undefined;
  }
}

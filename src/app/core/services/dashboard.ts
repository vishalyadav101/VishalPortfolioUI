import { Injectable, inject } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'https://localhost:7295/api';

  getProjects(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Project`);
  }

  getSkills(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Skill`);
  }

  getBlogs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/BlogPost`);
  }

  getContacts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Contact`);
  }
}

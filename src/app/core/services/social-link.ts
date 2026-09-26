import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SocialLink {
  socialLinkId: number;
  platformName: string;
  url: string;
  icon: string | null;
  displayOrder: number;
  isActive: boolean;
  createdDate: string;
  updatedDate: string | null;
}

export interface SocialLinkCreateRequest {
  platformName: string;
  url: string;
  icon: string | null;
  displayOrder: number;
  isActive: boolean;
}

export interface SocialLinkUpdateRequest {
  platformName: string;
  url: string;
  icon: string | null;
  displayOrder: number;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class SocialLinkService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'https://localhost:7295/api/SocialLink';

  // ================================
  // GET ALL
  // ================================

  getSocialLinks(): Observable<SocialLink[]> {
    return this.http.get<SocialLink[]>(this.apiUrl);
  }

  // ================================
  // GET BY ID
  // ================================

  getSocialLinkById(id: number): Observable<SocialLink> {
    return this.http.get<SocialLink>(`${this.apiUrl}/${id}`);
  }

  // ================================
  // CREATE
  // ================================

  createSocialLink(data: SocialLinkCreateRequest): Observable<SocialLink> {
    return this.http.post<SocialLink>(this.apiUrl, data);
  }

  // ================================
  // UPDATE
  // ================================

  updateSocialLink(id: number, data: SocialLinkUpdateRequest): Observable<SocialLink> {
    return this.http.put<SocialLink>(`${this.apiUrl}/${id}`, data);
  }

  // ================================
  // DELETE
  // ================================

  deleteSocialLink(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}

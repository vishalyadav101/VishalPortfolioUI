import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { Profile, ProfileUpdateRequest } from '../models/profile.model';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'https://localhost:7295/api/Profile';

  private readonly apiBaseUrl = 'https://localhost:7295';

  // ==========================================
  // GET PROFILE
  // ==========================================

  getProfile(): Observable<Profile> {
    return this.http
      .get<Profile>(this.apiUrl)
      .pipe(map((profile) => this.normalizeProfileUrls(profile)));
  }

  // ==========================================
  // UPDATE PROFILE
  // ==========================================

  updateProfile(id: number, data: ProfileUpdateRequest): Observable<Profile> {
    return this.http
      .put<Profile>(this.apiUrl, data)
      .pipe(map((profile) => this.normalizeProfileUrls(profile)));
  }

  // ==========================================
  // UPLOAD PROFILE IMAGE
  // ==========================================

  uploadProfileImage(file: File): Observable<Profile> {
    const formData = new FormData();

    formData.append('file', file);

    return this.http
      .post<Profile>(`${this.apiUrl}/upload-image`, formData)
      .pipe(map((profile) => this.normalizeProfileUrls(profile)));
  }

  // ==========================================
  // UPLOAD ABOUT IMAGE
  // ==========================================

  uploadAboutImage(file: File): Observable<Profile> {
    const formData = new FormData();

    formData.append('file', file);

    return this.http
      .post<Profile>(`${this.apiUrl}/upload-about-image`, formData)
      .pipe(map((profile) => this.normalizeProfileUrls(profile)));
  }

  // ==========================================
  // UPLOAD RESUME
  // ==========================================

  uploadResume(file: File): Observable<Profile> {
    const formData = new FormData();

    formData.append('file', file);

    return this.http
      .post<Profile>(`${this.apiUrl}/upload-resume`, formData)
      .pipe(map((profile) => this.normalizeProfileUrls(profile)));
  }

  // ==========================================
  // NORMALIZE PROFILE URLS
  // ==========================================

  private normalizeProfileUrls(profile: Profile): Profile {
    return {
      ...profile,

      profileImageUrl: this.toAbsoluteUrl(profile.profileImageUrl),

      resumeUrl: this.toAbsoluteUrl(profile.resumeUrl),

      aboutImageUrl: this.toAbsoluteUrl(profile.aboutImageUrl),
    };
  }

  // ==========================================
  // CONVERT RELATIVE URL TO ABSOLUTE URL
  // ==========================================

  private toAbsoluteUrl(url?: string | null): string | null {
    if (!url) {
      return null;
    }

    // Already absolute URL

    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // Relative API file URL

    if (url.startsWith('/')) {
      return `${this.apiBaseUrl}${url}`;
    }

    return `${this.apiBaseUrl}/${url}`;
  }
}

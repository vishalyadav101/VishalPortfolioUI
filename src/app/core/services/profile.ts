import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap, of } from 'rxjs';

import { Profile, ProfileUpdateRequest } from '../models/profile.model';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'https://vishal-yadav-dotnet-developer.somee.com/api/Profile';

  private readonly apiBaseUrl = 'https://vishal-yadav-dotnet-developer.somee.com';

  private readonly cacheKey = 'portfolio_profile_cache';

  // ==========================================
  // MEMORY CACHE
  // ==========================================

  private cachedProfile: Profile | null = null;

  // ==========================================
  // GET PROFILE
  // ==========================================

  getProfile(): Observable<Profile> {
    // ------------------------------------------
    // 1. MEMORY CACHE
    // ------------------------------------------

    if (this.cachedProfile) {
      return of(this.cachedProfile);
    }

    // ------------------------------------------
    // 2. SESSION STORAGE CACHE
    // ------------------------------------------

    const storedProfile = this.getStoredProfile();

    if (storedProfile) {
      this.cachedProfile = storedProfile;

      return of(storedProfile);
    }

    // ------------------------------------------
    // 3. API CALL
    // ------------------------------------------

    return this.http.get<Profile>(this.apiUrl).pipe(
      map((profile) => this.normalizeProfileUrls(profile)),

      tap((profile) => {
        this.setProfileCache(profile);
      }),
    );
  }

  // ==========================================
  // UPDATE PROFILE
  // ==========================================

  updateProfile(id: number, data: ProfileUpdateRequest): Observable<Profile> {
    return this.http.put<Profile>(this.apiUrl, data).pipe(
      map((profile) => this.normalizeProfileUrls(profile)),

      tap((profile) => {
        this.setProfileCache(profile);
      }),
    );
  }

  // ==========================================
  // UPLOAD PROFILE IMAGE
  // ==========================================

  uploadProfileImage(file: File): Observable<Profile> {
    const formData = new FormData();

    formData.append('file', file);

    return this.http.post<Profile>(`${this.apiUrl}/upload-image`, formData).pipe(
      map((profile) => this.normalizeProfileUrls(profile)),

      tap((profile) => {
        this.setProfileCache(profile);
      }),
    );
  }

  // ==========================================
  // UPLOAD ABOUT IMAGE
  // ==========================================

  uploadAboutImage(file: File): Observable<Profile> {
    const formData = new FormData();

    formData.append('file', file);

    return this.http.post<Profile>(`${this.apiUrl}/upload-about-image`, formData).pipe(
      map((profile) => this.normalizeProfileUrls(profile)),

      tap((profile) => {
        this.setProfileCache(profile);
      }),
    );
  }

  // ==========================================
  // UPLOAD RESUME
  // ==========================================

  uploadResume(file: File): Observable<Profile> {
    const formData = new FormData();

    formData.append('file', file);

    return this.http.post<Profile>(`${this.apiUrl}/upload-resume`, formData).pipe(
      map((profile) => this.normalizeProfileUrls(profile)),

      tap((profile) => {
        this.setProfileCache(profile);
      }),
    );
  }

  // ==========================================
  // SET PROFILE CACHE
  // ==========================================

  private setProfileCache(profile: Profile): void {
    // Memory cache
    this.cachedProfile = profile;

    // Session storage cache
    try {
      sessionStorage.setItem(this.cacheKey, JSON.stringify(profile));
    } catch (error) {
      console.warn('Unable to save profile to session storage.', error);
    }
  }

  // ==========================================
  // GET STORED PROFILE
  // ==========================================

  private getStoredProfile(): Profile | null {
    try {
      const storedData = sessionStorage.getItem(this.cacheKey);

      if (!storedData) {
        return null;
      }

      const profile = JSON.parse(storedData) as Profile;

      return this.normalizeProfileUrls(profile);
    } catch (error) {
      console.warn('Unable to read profile from session storage.', error);

      sessionStorage.removeItem(this.cacheKey);

      return null;
    }
  }

  // ==========================================
  // CLEAR PROFILE CACHE
  // ==========================================

  clearProfileCache(): void {
    this.cachedProfile = null;

    try {
      sessionStorage.removeItem(this.cacheKey);
    } catch (error) {
      console.warn('Unable to clear profile session cache.', error);
    }
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
  // CONVERT URL TO ABSOLUTE URL
  // ==========================================

  private toAbsoluteUrl(url?: string | null): string | null {
    if (!url) {
      return null;
    }

    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      return null;
    }

    // Already absolute URL
    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
      return trimmedUrl;
    }

    // Relative URL starting with /
    if (trimmedUrl.startsWith('/')) {
      return `${this.apiBaseUrl}${trimmedUrl}`;
    }

    // Relative URL without /
    return `${this.apiBaseUrl}/${trimmedUrl}`;
  }
}

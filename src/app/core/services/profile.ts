import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay, tap, catchError, throwError } from 'rxjs';

import { Profile, ProfileUpdateRequest } from '../models/profile.model';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'https://vishal-yadav-dotnet-developer.somee.com/api/Profile';

  private readonly apiBaseUrl = 'https://vishal-yadav-dotnet-developer.somee.com';

  // ==========================================
  // PROFILE CACHE
  // ==========================================

  private profileCache$?: Observable<Profile>;

  // ==========================================
  // GET PROFILE
  // ==========================================

  getProfile(): Observable<Profile> {
    // If profile is already cached,
    // return cached data instead of calling API again.
    if (this.profileCache$) {
      return this.profileCache$;
    }

    this.profileCache$ = this.http.get<Profile>(this.apiUrl).pipe(
      map((profile) => this.normalizeProfileUrls(profile)),

      // Keep latest successful profile in memory.
      shareReplay({
        bufferSize: 1,
        refCount: true,
      }),

      // If API fails, don't keep the failed request
      // permanently inside the cache.
      catchError((error) => {
        this.profileCache$ = undefined;
        return throwError(() => error);
      }),
    );

    return this.profileCache$;
  }

  // ==========================================
  // UPDATE PROFILE
  // ==========================================

  updateProfile(id: number, data: ProfileUpdateRequest): Observable<Profile> {
    return this.http.put<Profile>(this.apiUrl, data).pipe(
      map((profile) => this.normalizeProfileUrls(profile)),

      // Update cache immediately with fresh data.
      tap((profile) => {
        this.profileCache$ = new Observable<Profile>((subscriber) => {
          subscriber.next(profile);
          subscriber.complete();
        }).pipe(
          shareReplay({
            bufferSize: 1,
            refCount: true,
          }),
        );
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

      // Update cache with latest profile.
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

      // Update cache with latest profile.
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

      // Update cache with latest profile.
      tap((profile) => {
        this.setProfileCache(profile);
      }),
    );
  }

  // ==========================================
  // SET PROFILE CACHE
  // ==========================================

  private setProfileCache(profile: Profile): void {
    this.profileCache$ = new Observable<Profile>((subscriber) => {
      subscriber.next(profile);
      subscriber.complete();
    }).pipe(
      shareReplay({
        bufferSize: 1,
        refCount: true,
      }),
    );
  }

  // ==========================================
  // CLEAR PROFILE CACHE
  // ==========================================

  clearProfileCache(): void {
    this.profileCache$ = undefined;
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

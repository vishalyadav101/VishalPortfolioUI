import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Certificate {
  certificateId: number;
  certificateName: string;
  issuingOrganization: string;
  credentialId: string | null;
  credentialUrl: string | null;
  certificateImageUrl: string | null;
  issueDate: string;
  expiryDate: string | null;
  doesNotExpire: boolean;
  displayOrder: number;
  isActive: boolean;
  createdDate: string;
  updatedDate: string | null;
}

export interface CertificateCreateRequest {
  certificateName: string;
  issuingOrganization: string;
  credentialId: string | null;
  credentialUrl: string | null;
  certificateImageUrl: string | null;
  issueDate: string;
  expiryDate: string | null;
  doesNotExpire: boolean;
  displayOrder: number;
  isActive: boolean;
}

export interface CertificateUpdateRequest {
  certificateName: string;
  issuingOrganization: string;
  credentialId: string | null;
  credentialUrl: string | null;
  certificateImageUrl: string | null;
  issueDate: string;
  expiryDate: string | null;
  doesNotExpire: boolean;
  displayOrder: number;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class CertificateService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'https://vishalportfolioapi.onrender.com/api/Certificate';

  // ==========================================
  // GET ALL
  // ==========================================

  getCertificates(): Observable<Certificate[]> {
    return this.http.get<Certificate[]>(this.apiUrl);
  }

  // ==========================================
  // GET BY ID
  // ==========================================

  getCertificateById(id: number): Observable<Certificate> {
    return this.http.get<Certificate>(`${this.apiUrl}/${id}`);
  }

  // ==========================================
  // CREATE
  // ==========================================

  createCertificate(data: CertificateCreateRequest): Observable<Certificate> {
    return this.http.post<Certificate>(this.apiUrl, data);
  }

  // ==========================================
  // UPDATE
  // ==========================================

  updateCertificate(id: number, data: CertificateUpdateRequest): Observable<Certificate> {
    return this.http.put<Certificate>(`${this.apiUrl}/${id}`, data);
  }

  // ==========================================
  // DELETE
  // ==========================================

  deleteCertificate(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Contact {
  contactId: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdDate: string;
  readDate: string | null;
}

export interface ContactCreateRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactUpdateRequest {
  isRead: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    'https://localhost:7295/api/Contact';

  getContacts(): Observable<Contact[]> {
    return this.http.get<Contact[]>(this.apiUrl);
  }

  getContactById(id: number): Observable<Contact> {
    return this.http.get<Contact>(`${this.apiUrl}/${id}`);
  }

  createContact(
    data: ContactCreateRequest
  ): Observable<Contact> {
    return this.http.post<Contact>(
      this.apiUrl,
      data
    );
  }

  updateContact(
    id: number,
    data: ContactUpdateRequest
  ): Observable<Contact> {
    return this.http.put<Contact>(
      `${this.apiUrl}/${id}`,
      data
    );
  }

  deleteContact(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}
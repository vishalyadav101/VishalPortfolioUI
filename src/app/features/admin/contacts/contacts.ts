import { Component, OnInit, inject, signal } from '@angular/core';

import { CommonModule } from '@angular/common';

import { ContactService, Contact } from '../../../core/services/contact';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contacts.html',
  styleUrl: './contacts.css',
})
export class Contacts implements OnInit {
  private readonly contactService = inject(ContactService);

  readonly isLoading = signal(true);
  readonly isDeleting = signal(false);

  readonly successMessage = signal('');
  readonly errorMessage = signal('');

  readonly searchText = signal('');

  contacts: Contact[] = [];

  selectedContact: Contact | null = null;

  ngOnInit(): void {
    this.loadContacts();
  }

  // ==========================================
  // LOAD CONTACTS
  // ==========================================

  loadContacts(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.contactService.getContacts().subscribe({
      next: (data) => {
        this.contacts = data;

        this.isLoading.set(false);
      },

      error: (error) => {
        console.error('Contacts Load Error:', error);

        this.errorMessage.set(error?.error?.message || 'Unable to load contacts.');

        this.isLoading.set(false);
      },
    });
  }

  // ==========================================
  // SEARCH
  // ==========================================

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.searchText.set(input.value.trim().toLowerCase());
  }

  get filteredContacts(): Contact[] {
    const search = this.searchText();

    if (!search) {
      return this.contacts;
    }

    return this.contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(search) ||
        contact.email.toLowerCase().includes(search) ||
        contact.subject.toLowerCase().includes(search) ||
        contact.message.toLowerCase().includes(search),
    );
  }

  // ==========================================
  // VIEW CONTACT
  // ==========================================

  viewContact(contact: Contact): void {
    this.selectedContact = contact;

    // Automatically mark unread contact as read
    if (!contact.isRead) {
      this.updateReadStatus(contact, true);
    }
  }

  closeContact(): void {
    this.selectedContact = null;
  }

  // ==========================================
  // MARK READ / UNREAD
  // ==========================================

  toggleReadStatus(contact: Contact): void {
    this.updateReadStatus(contact, !contact.isRead);
  }

  private updateReadStatus(contact: Contact, isRead: boolean): void {
    this.errorMessage.set('');

    this.contactService
      .updateContact(contact.contactId, {
        isRead,
      })
      .subscribe({
        next: (updatedContact) => {
          const index = this.contacts.findIndex((x) => x.contactId === contact.contactId);

          if (index !== -1) {
            this.contacts[index] = updatedContact;

            this.contacts = [...this.contacts];
          }

          if (this.selectedContact && this.selectedContact.contactId === contact.contactId) {
            this.selectedContact = updatedContact;
          }

          this.successMessage.set(isRead ? 'Message marked as read.' : 'Message marked as unread.');

          setTimeout(() => {
            this.successMessage.set('');
          }, 2500);
        },

        error: (error) => {
          console.error('Contact Update Error:', error);

          this.errorMessage.set(error?.error?.message || 'Unable to update contact status.');
        },
      });
  }

  // ==========================================
  // DELETE CONTACT
  // ==========================================

  deleteContact(contact: Contact): void {
    const confirmed = confirm(
      `Are you sure you want to delete the message from "${contact.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    this.isDeleting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.contactService.deleteContact(contact.contactId).subscribe({
      next: () => {
        this.contacts = this.contacts.filter((x) => x.contactId !== contact.contactId);

        if (this.selectedContact && this.selectedContact.contactId === contact.contactId) {
          this.selectedContact = null;
        }

        this.isDeleting.set(false);

        this.successMessage.set('Contact deleted successfully.');

        setTimeout(() => {
          this.successMessage.set('');
        }, 3000);
      },

      error: (error) => {
        console.error('Contact Delete Error:', error);

        this.isDeleting.set(false);

        this.errorMessage.set(error?.error?.message || 'Unable to delete contact.');
      },
    });
  }

  // ==========================================
  // HELPERS
  // ==========================================

  getUnreadCount(): number {
    return this.contacts.filter((contact) => !contact.isRead).length;
  }

  getReadCount(): number {
    return this.contacts.filter((contact) => contact.isRead).length;
  }

  formatDate(date: string): string {
    if (!date) {
      return '-';
    }

    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  formatDateTime(date: string): string {
    if (!date) {
      return '-';
    }

    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}

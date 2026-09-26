import { Component, OnInit, inject, signal } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import {
  CertificateService,
  Certificate as CertificateModel,
} from '../../../core/services/certificate';

@Component({
  selector: 'app-certificates',
  standalone: true,

  imports: [CommonModule, ReactiveFormsModule],

  templateUrl: './certificates.html',
  styleUrl: './certificates.css',
})
export class Certificates implements OnInit {
  private readonly fb = inject(FormBuilder);

  private readonly certificateService = inject(CertificateService);

  // ==========================================
  // UI STATE
  // ==========================================

  readonly isLoading = signal(true);

  readonly isSaving = signal(false);

  readonly isDeleting = signal(false);

  readonly showForm = signal(false);

  readonly isEditMode = signal(false);

  readonly successMessage = signal('');

  readonly errorMessage = signal('');

  readonly searchText = signal('');

  // ==========================================
  // DATA
  // ==========================================

  certificates: CertificateModel[] = [];

  editingCertificateId = 0;

  // ==========================================
  // FORM
  // ==========================================

  certificateForm = this.fb.nonNullable.group({
    certificateName: ['', [Validators.required, Validators.maxLength(200)]],

    issuingOrganization: ['', [Validators.required, Validators.maxLength(150)]],

    credentialId: ['', [Validators.maxLength(100)]],

    credentialUrl: ['', [Validators.maxLength(500)]],

    certificateImageUrl: ['', [Validators.maxLength(500)]],

    issueDate: ['', [Validators.required]],

    expiryDate: [''],

    doesNotExpire: [true],

    displayOrder: [1, [Validators.required, Validators.min(1)]],

    isActive: [true],
  });

  // ==========================================
  // LIFECYCLE
  // ==========================================

  ngOnInit(): void {
    this.loadCertificates();
  }

  // ==========================================
  // LOAD CERTIFICATES
  // ==========================================

  loadCertificates(): void {
    this.isLoading.set(true);

    this.errorMessage.set('');

    this.certificateService.getCertificates().subscribe({
      next: (data) => {
        this.certificates = data;

        this.isLoading.set(false);
      },

      error: (error) => {
        console.error('Certificate API Error:', error);

        this.errorMessage.set('Unable to load certificates.');

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

  get filteredCertificates(): CertificateModel[] {
    const search = this.searchText();

    if (!search) {
      return this.certificates;
    }

    return this.certificates.filter(
      (certificate) =>
        certificate.certificateName.toLowerCase().includes(search) ||
        certificate.issuingOrganization.toLowerCase().includes(search) ||
        (certificate.credentialId ?? '').toLowerCase().includes(search),
    );
  }

  // ==========================================
  // OPEN ADD FORM
  // ==========================================

  openAddForm(): void {
    this.isEditMode.set(false);

    this.editingCertificateId = 0;

    this.successMessage.set('');

    this.errorMessage.set('');

    this.certificateForm.reset({
      certificateName: '',

      issuingOrganization: '',

      credentialId: '',

      credentialUrl: '',

      certificateImageUrl: '',

      issueDate: '',

      expiryDate: '',

      doesNotExpire: true,

      displayOrder: this.certificates.length + 1,

      isActive: true,
    });

    this.showForm.set(true);
  }

  // ==========================================
  // OPEN EDIT FORM
  // ==========================================

  openEditForm(certificate: CertificateModel): void {
    this.isEditMode.set(true);

    this.editingCertificateId = certificate.certificateId;

    this.successMessage.set('');

    this.errorMessage.set('');

    this.certificateForm.patchValue({
      certificateName: certificate.certificateName,

      issuingOrganization: certificate.issuingOrganization,

      credentialId: certificate.credentialId ?? '',

      credentialUrl: certificate.credentialUrl ?? '',

      certificateImageUrl: certificate.certificateImageUrl ?? '',

      issueDate: this.formatDateForInput(certificate.issueDate),

      expiryDate: certificate.expiryDate ? this.formatDateForInput(certificate.expiryDate) : '',

      doesNotExpire: certificate.doesNotExpire,

      displayOrder: certificate.displayOrder,

      isActive: certificate.isActive,
    });

    this.showForm.set(true);
  }

  // ==========================================
  // DATE FORMAT
  // ==========================================

  private formatDateForInput(date: string): string {
    if (!date) {
      return '';
    }

    return date.substring(0, 10);
  }

  // ==========================================
  // DOES NOT EXPIRE CHANGE
  // ==========================================

  onDoesNotExpireChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    const doesNotExpire = input.checked;

    if (doesNotExpire) {
      this.certificateForm.patchValue({
        expiryDate: '',
      });
    }
  }

  // ==========================================
  // CLOSE FORM
  // ==========================================

  closeForm(): void {
    this.showForm.set(false);

    this.certificateForm.reset({
      certificateName: '',

      issuingOrganization: '',

      credentialId: '',

      credentialUrl: '',

      certificateImageUrl: '',

      issueDate: '',

      expiryDate: '',

      doesNotExpire: true,

      displayOrder: 1,

      isActive: true,
    });
  }

  // ==========================================
  // SUBMIT
  // ==========================================

  onSubmit(): void {
    if (this.certificateForm.invalid) {
      this.certificateForm.markAllAsTouched();

      return;
    }

    this.isSaving.set(true);

    this.successMessage.set('');

    this.errorMessage.set('');

    const formValue = this.certificateForm.getRawValue();

    const data = {
      certificateName: formValue.certificateName,

      issuingOrganization: formValue.issuingOrganization,

      credentialId: formValue.credentialId || null,

      credentialUrl: formValue.credentialUrl || null,

      certificateImageUrl: formValue.certificateImageUrl || null,

      issueDate: formValue.issueDate,

      expiryDate: formValue.doesNotExpire ? null : formValue.expiryDate || null,

      doesNotExpire: formValue.doesNotExpire,

      displayOrder: formValue.displayOrder,

      isActive: formValue.isActive,
    };

    // ========================================
    // UPDATE
    // ========================================

    if (this.isEditMode()) {
      this.certificateService.updateCertificate(this.editingCertificateId, data).subscribe({
        next: () => {
          this.isSaving.set(false);

          this.successMessage.set('Certificate updated successfully.');

          this.closeForm();

          this.loadCertificates();
        },

        error: (error) => {
          console.error('Update Certificate Error:', error);

          this.isSaving.set(false);

          this.errorMessage.set(error?.error?.message || 'Unable to update certificate.');
        },
      });

      return;
    }

    // ========================================
    // CREATE
    // ========================================

    this.certificateService.createCertificate(data).subscribe({
      next: () => {
        this.isSaving.set(false);

        this.successMessage.set('Certificate added successfully.');

        this.closeForm();

        this.loadCertificates();
      },

      error: (error) => {
        console.error('Create Certificate Error:', error);

        this.isSaving.set(false);

        this.errorMessage.set(error?.error?.message || 'Unable to add certificate.');
      },
    });
  }

  // ==========================================
  // DELETE
  // ==========================================

  deleteCertificate(certificate: CertificateModel): void {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${certificate.certificateName}"?`,
    );

    if (!confirmed) {
      return;
    }

    this.isDeleting.set(true);

    this.successMessage.set('');

    this.errorMessage.set('');

    this.certificateService.deleteCertificate(certificate.certificateId).subscribe({
      next: (response) => {
        console.log('Delete Certificate Response:', response);

        this.isDeleting.set(false);

        this.successMessage.set('Certificate deleted successfully.');

        this.loadCertificates();
      },

      error: (error) => {
        console.error('Delete Certificate Error:', error);

        this.isDeleting.set(false);

        this.errorMessage.set(error?.error?.message || 'Unable to delete certificate.');
      },
    });
  }
}

import { Component, OnInit, inject, signal } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import {
  SocialLinkService,
  SocialLink as SocialLinkModel,
} from '../../../core/services/social-link';

@Component({
  selector: 'app-social-links',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './social-links.html',
  styleUrl: './social-links.css',
})
export class SocialLinks implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly socialLinkService = inject(SocialLinkService);

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

  socialLinks: SocialLinkModel[] = [];

  editingSocialLinkId = 0;

  // ==========================================
  // FORM
  // ==========================================

  socialLinkForm = this.fb.nonNullable.group({
    platformName: ['', [Validators.required, Validators.maxLength(100)]],

    url: ['', [Validators.required, Validators.maxLength(500)]],

    icon: ['', [Validators.maxLength(100)]],

    displayOrder: [1, [Validators.required, Validators.min(1)]],

    isActive: [true],
  });

  // ==========================================
  // INIT
  // ==========================================

  ngOnInit(): void {
    this.loadSocialLinks();
  }

  // ==========================================
  // LOAD
  // ==========================================

  loadSocialLinks(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.socialLinkService.getSocialLinks().subscribe({
      next: (data) => {
        this.socialLinks = data;

        this.isLoading.set(false);
      },

      error: (error) => {
        console.error('Social Link API Error:', error);

        this.errorMessage.set('Unable to load social links.');

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

  get filteredSocialLinks(): SocialLinkModel[] {
    const search = this.searchText();

    if (!search) {
      return this.socialLinks;
    }

    return this.socialLinks.filter(
      (socialLink) =>
        socialLink.platformName.toLowerCase().includes(search) ||
        socialLink.url.toLowerCase().includes(search) ||
        (socialLink.icon ?? '').toLowerCase().includes(search),
    );
  }

  // ==========================================
  // ADD FORM
  // ==========================================

  openAddForm(): void {
    this.isEditMode.set(false);

    this.editingSocialLinkId = 0;

    this.successMessage.set('');
    this.errorMessage.set('');

    this.socialLinkForm.reset({
      platformName: '',

      url: '',

      icon: '',

      displayOrder: this.socialLinks.length + 1,

      isActive: true,
    });

    this.showForm.set(true);
  }

  // ==========================================
  // EDIT FORM
  // ==========================================

  openEditForm(socialLink: SocialLinkModel): void {
    this.isEditMode.set(true);

    this.editingSocialLinkId = socialLink.socialLinkId;

    this.successMessage.set('');
    this.errorMessage.set('');

    this.socialLinkForm.patchValue({
      platformName: socialLink.platformName,

      url: socialLink.url,

      icon: socialLink.icon ?? '',

      displayOrder: socialLink.displayOrder,

      isActive: socialLink.isActive,
    });

    this.showForm.set(true);
  }

  // ==========================================
  // CLOSE FORM
  // ==========================================

  closeForm(): void {
    this.showForm.set(false);

    this.socialLinkForm.reset({
      platformName: '',

      url: '',

      icon: '',

      displayOrder: 1,

      isActive: true,
    });
  }

  // ==========================================
  // SUBMIT
  // ==========================================

  onSubmit(): void {
    if (this.socialLinkForm.invalid) {
      this.socialLinkForm.markAllAsTouched();

      return;
    }

    this.isSaving.set(true);

    this.successMessage.set('');
    this.errorMessage.set('');

    const formValue = this.socialLinkForm.getRawValue();

    const data = {
      platformName: formValue.platformName,

      url: formValue.url,

      icon: formValue.icon || null,

      displayOrder: formValue.displayOrder,

      isActive: formValue.isActive,
    };

    // ========================================
    // UPDATE
    // ========================================

    if (this.isEditMode()) {
      this.socialLinkService.updateSocialLink(this.editingSocialLinkId, data).subscribe({
        next: () => {
          this.isSaving.set(false);

          this.successMessage.set('Social link updated successfully.');

          this.closeForm();

          this.loadSocialLinks();
        },

        error: (error) => {
          console.error('Update Social Link Error:', error);

          this.isSaving.set(false);

          this.errorMessage.set(error?.error?.message || 'Unable to update social link.');
        },
      });

      return;
    }

    // ========================================
    // CREATE
    // ========================================

    this.socialLinkService.createSocialLink(data).subscribe({
      next: () => {
        this.isSaving.set(false);

        this.successMessage.set('Social link added successfully.');

        this.closeForm();

        this.loadSocialLinks();
      },

      error: (error) => {
        console.error('Create Social Link Error:', error);

        this.isSaving.set(false);

        this.errorMessage.set(error?.error?.message || 'Unable to add social link.');
      },
    });
  }

  // ==========================================
  // DELETE
  // ==========================================

  deleteSocialLink(socialLink: SocialLinkModel): void {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${socialLink.platformName}"?`,
    );

    if (!confirmed) {
      return;
    }

    this.isDeleting.set(true);

    this.successMessage.set('');
    this.errorMessage.set('');

    this.socialLinkService.deleteSocialLink(socialLink.socialLinkId).subscribe({
      next: (response) => {
        console.log('Delete Social Link Response:', response);

        this.isDeleting.set(false);

        this.successMessage.set('Social link deleted successfully.');

        this.loadSocialLinks();
      },

      error: (error) => {
        console.error('Delete Social Link Error:', error);

        this.isDeleting.set(false);

        this.errorMessage.set(error?.error?.message || 'Unable to delete social link.');
      },
    });
  }
}

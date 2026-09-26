import { Component, OnInit, ChangeDetectorRef, inject, signal } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ProfileService } from '../../../core/services/profile';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private readonly fb = inject(FormBuilder);

  private readonly profileService = inject(ProfileService);

  private readonly cdr = inject(ChangeDetectorRef);

  // ==========================================
  // STATES
  // ==========================================

  readonly isLoading = signal(true);

  readonly isSaving = signal(false);

  readonly isUploadingImage = signal(false);

  readonly isUploadingAboutImage = signal(false);

  readonly isUploadingResume = signal(false);

  readonly successMessage = signal('');

  readonly errorMessage = signal('');

  // ==========================================
  // PROFILE ID
  // ==========================================

  profileId = 0;

  // ==========================================
  // SELECTED FILES
  // ==========================================

  selectedProfileImage: File | null = null;

  selectedAboutImage: File | null = null;

  selectedResume: File | null = null;

  // ==========================================
  // SELECTED FILE NAMES
  // ==========================================

  selectedProfileImageName = signal('');

  selectedAboutImageName = signal('');

  selectedResumeName = signal('');

  // ==========================================
  // ABOUT IMAGE PREVIEW
  // ==========================================

  aboutImagePreview: string | null = null;

  // ==========================================
  // PROFILE FORM
  // ==========================================

  profileForm = this.fb.nonNullable.group({
    // ==========================================
    // HERO
    // ==========================================

    greeting: ['', [Validators.maxLength(100)]],

    fullName: ['', [Validators.required, Validators.maxLength(100)]],

    headline: ['', [Validators.required, Validators.maxLength(150)]],

    shortDescription: ['', [Validators.maxLength(500)]],

    codeNote: ['', [Validators.maxLength(200)]],

    availabilityStatus: ['', [Validators.maxLength(100)]],

    availabilityMessage: ['', [Validators.maxLength(300)]],

    // ==========================================
    // ABOUT SECTION
    // ==========================================

    about: ['', [Validators.maxLength(3000)]],

    aboutLabel: ['', [Validators.maxLength(100)]],

    aboutHeading: ['', [Validators.maxLength(200)]],

    aboutHighlight: ['', [Validators.maxLength(200)]],

    education: ['', [Validators.maxLength(150)]],

    aboutImageUrl: ['', [Validators.maxLength(500)]],

    quote: ['', [Validators.maxLength(500)]],

    quoteAuthor: ['', [Validators.maxLength(150)]],

    // ==========================================
    // CONTACT
    // ==========================================

    email: ['', [Validators.email, Validators.maxLength(150)]],

    phone: ['', [Validators.maxLength(30)]],

    location: ['', [Validators.maxLength(150)]],

    // ==========================================
    // LINKS / FILE URLS
    // ==========================================

    profileImageUrl: ['', [Validators.maxLength(500)]],

    resumeUrl: ['', [Validators.maxLength(500)]],

    gitHubUrl: ['', [Validators.maxLength(500)]],

    linkedInUrl: ['', [Validators.maxLength(500)]],
  });

  // ==========================================
  // INIT
  // ==========================================

  ngOnInit(): void {
    this.loadProfile();
  }

  // ==========================================
  // LOAD PROFILE
  // ==========================================

  private loadProfile(): void {
    this.isLoading.set(true);

    this.errorMessage.set('');

    this.profileService.getProfile().subscribe({
      next: (data) => {
        console.log('Profile API Response:', data);

        this.profileId = data.profileId;

        this.profileForm.patchValue({
          // ==========================================
          // HERO
          // ==========================================

          greeting: data.greeting ?? '',

          fullName: data.fullName ?? '',

          headline: data.headline ?? '',

          shortDescription: data.shortDescription ?? '',

          codeNote: data.codeNote ?? '',

          availabilityStatus: data.availabilityStatus ?? '',

          availabilityMessage: data.availabilityMessage ?? '',

          // ==========================================
          // ABOUT
          // ==========================================

          about: data.about ?? '',

          aboutLabel: data.aboutLabel ?? '',

          aboutHeading: data.aboutHeading ?? '',

          aboutHighlight: data.aboutHighlight ?? '',

          education: data.education ?? '',

          aboutImageUrl: data.aboutImageUrl ?? '',

          quote: data.quote ?? '',

          quoteAuthor: data.quoteAuthor ?? '',

          // ==========================================
          // CONTACT
          // ==========================================

          email: data.email ?? '',

          phone: data.phone ?? '',

          location: data.location ?? '',

          // ==========================================
          // LINKS
          // ==========================================

          profileImageUrl: data.profileImageUrl ?? '',

          resumeUrl: data.resumeUrl ?? '',

          gitHubUrl: data.gitHubUrl ?? '',

          linkedInUrl: data.linkedInUrl ?? '',
        });

        // ==========================================
        // ABOUT IMAGE PREVIEW
        // ==========================================

        this.aboutImagePreview = data.aboutImageUrl ?? null;

        this.isLoading.set(false);

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Profile API Error:', error);

        this.errorMessage.set('Unable to load profile data.');

        this.isLoading.set(false);

        this.cdr.detectChanges();
      },
    });
  }

  // ==========================================
  // PROFILE IMAGE SELECT
  // ==========================================

  onProfileImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      this.errorMessage.set('Only JPG, JPEG, PNG and WEBP images are allowed.');

      input.value = '';

      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      this.errorMessage.set('Profile image size must be less than 5 MB.');

      input.value = '';

      return;
    }

    this.selectedProfileImage = file;

    this.selectedProfileImageName.set(file.name);

    this.errorMessage.set('');

    this.successMessage.set('');
  }

  // ==========================================
  // ABOUT IMAGE SELECT
  // ==========================================

  onAboutImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    // ==========================================
    // ALLOWED IMAGE TYPES
    // ==========================================

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      this.errorMessage.set('Only JPG, JPEG, PNG and WEBP images are allowed.');

      input.value = '';

      return;
    }

    // ==========================================
    // MAX 5 MB
    // ==========================================

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      this.errorMessage.set('About image size must be less than 5 MB.');

      input.value = '';

      return;
    }

    // ==========================================
    // SAVE SELECTED FILE
    // ==========================================

    this.selectedAboutImage = file;

    this.selectedAboutImageName.set(file.name);

    // ==========================================
    // LOCAL PREVIEW
    // ==========================================

    this.aboutImagePreview = URL.createObjectURL(file);

    this.errorMessage.set('');

    this.successMessage.set('');

    console.log('About image selected:', file.name);
  }

  // ==========================================
  // RESUME SELECT
  // ==========================================

  onResumeSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    if (file.type !== 'application/pdf') {
      this.errorMessage.set('Only PDF files are allowed for resume.');

      input.value = '';

      return;
    }

    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      this.errorMessage.set('Resume size must be less than 10 MB.');

      input.value = '';

      return;
    }

    this.selectedResume = file;

    this.selectedResumeName.set(file.name);

    this.errorMessage.set('');

    this.successMessage.set('');
  }

  // ==========================================
  // UPLOAD PROFILE IMAGE
  // ==========================================

  uploadProfileImage(): void {
    if (!this.selectedProfileImage) {
      this.errorMessage.set('Please select a profile image first.');

      return;
    }

    this.isUploadingImage.set(true);

    this.successMessage.set('');

    this.errorMessage.set('');

    this.profileService.uploadProfileImage(this.selectedProfileImage).subscribe({
      next: (data) => {
        this.profileForm.patchValue({
          profileImageUrl: data.profileImageUrl ?? '',
        });

        this.selectedProfileImage = null;

        this.selectedProfileImageName.set('');

        this.isUploadingImage.set(false);

        this.successMessage.set('Profile image uploaded successfully.');

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Profile Image Upload Error:', error);

        this.isUploadingImage.set(false);

        this.errorMessage.set(error?.error?.message || 'Unable to upload profile image.');

        this.cdr.detectChanges();
      },
    });
  }

  // ==========================================
  // UPLOAD ABOUT IMAGE
  // ==========================================

  // ==========================================
  // UPLOAD ABOUT IMAGE
  // ==========================================

  uploadAboutImage(): void {
    if (!this.selectedAboutImage) {
      this.errorMessage.set('Please select an About image first.');
      return;
    }

    this.isUploadingAboutImage.set(true);

    this.successMessage.set('');
    this.errorMessage.set('');

    this.profileService.uploadAboutImage(this.selectedAboutImage).subscribe({
      next: (data) => {
        // Same as Profile Image
        this.profileForm.patchValue({
          aboutImageUrl: data.aboutImageUrl ?? '',
        });

        // Update preview
        this.aboutImagePreview = data.aboutImageUrl ?? null;

        // Clear selected file
        this.selectedAboutImage = null;
        this.selectedAboutImageName.set('');

        // Upload completed
        this.isUploadingAboutImage.set(false);

        this.successMessage.set('About image uploaded successfully.');

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('About Image Upload Error:', error);

        this.isUploadingAboutImage.set(false);

        this.errorMessage.set(error?.error?.message || 'Unable to upload About image.');

        this.cdr.detectChanges();
      },
    });
  }

  // ==========================================
  // UPLOAD RESUME
  // ==========================================

  uploadResume(): void {
    if (!this.selectedResume) {
      this.errorMessage.set('Please select a resume PDF first.');

      return;
    }

    this.isUploadingResume.set(true);

    this.successMessage.set('');

    this.errorMessage.set('');

    this.profileService.uploadResume(this.selectedResume).subscribe({
      next: (data) => {
        this.profileForm.patchValue({
          resumeUrl: data.resumeUrl ?? '',
        });

        this.selectedResume = null;

        this.selectedResumeName.set('');

        this.isUploadingResume.set(false);

        this.successMessage.set('Resume uploaded successfully.');

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Resume Upload Error:', error);

        this.isUploadingResume.set(false);

        this.errorMessage.set(error?.error?.message || 'Unable to upload resume.');

        this.cdr.detectChanges();
      },
    });
  }

  // ==========================================
  // UPDATE PROFILE
  // ==========================================

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();

      return;
    }

    this.isSaving.set(true);

    this.successMessage.set('');

    this.errorMessage.set('');

    const data = this.profileForm.getRawValue();

    this.profileService.updateProfile(this.profileId, data).subscribe({
      next: (updatedProfile) => {
        // Keep About Image URL
        // synchronized after save

        this.profileForm.patchValue({
          aboutImageUrl:
            updatedProfile.aboutImageUrl ?? this.profileForm.controls.aboutImageUrl.value,
        });

        this.isSaving.set(false);

        this.successMessage.set('Profile updated successfully.');

        setTimeout(() => {
          this.successMessage.set('');
        }, 3000);
      },

      error: (error) => {
        console.error('Profile Update Error:', error);

        this.isSaving.set(false);

        this.errorMessage.set(error?.error?.message || 'Unable to update profile.');
      },
    });
  }
}

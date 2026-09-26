import { Component, OnInit, inject, signal } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ExperienceService } from '../../../core/services/experience';

import { Experience as ExperienceModel } from '../../../core/models/experience.model';
@Component({
  selector: 'app-experience',
  standalone: true,

  imports: [CommonModule, ReactiveFormsModule],

  templateUrl: './experience.html',
  styleUrl: './experience.css',
})
export class Experience implements OnInit {
  private readonly fb = inject(FormBuilder);

  private readonly experienceService = inject(ExperienceService);

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

  experiences: ExperienceModel[] = [];

  editingExperienceId = 0;

  // ==========================================
  // FORM
  // ==========================================

  experienceForm = this.fb.nonNullable.group({
    companyName: ['', [Validators.required, Validators.maxLength(150)]],

    jobTitle: ['', [Validators.required, Validators.maxLength(150)]],

    employmentType: ['', [Validators.maxLength(100)]],

    location: ['', [Validators.maxLength(100)]],

    startDate: ['', [Validators.required]],

    endDate: [''],

    isCurrent: [false],

    description: ['', [Validators.maxLength(5000)]],

    technologies: ['', [Validators.maxLength(500)]],

    companyUrl: ['', [Validators.maxLength(500)]],

    displayOrder: [1, [Validators.required, Validators.min(1)]],

    isActive: [true],
  });

  // ==========================================
  // LIFECYCLE
  // ==========================================

  ngOnInit(): void {
    this.loadExperiences();
  }

  // ==========================================
  // LOAD EXPERIENCES
  // ==========================================

  loadExperiences(): void {
    this.isLoading.set(true);

    this.errorMessage.set('');

    this.experienceService.getExperiences().subscribe({
      next: (data) => {
        this.experiences = data;

        this.isLoading.set(false);
      },

      error: (error) => {
        console.error('Experience API Error:', error);

        this.errorMessage.set('Unable to load experiences.');

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

  get filteredExperiences(): ExperienceModel[] {
    const search = this.searchText();

    if (!search) {
      return this.experiences;
    }

    return this.experiences.filter(
      (experience) =>
        experience.companyName.toLowerCase().includes(search) ||
        experience.jobTitle.toLowerCase().includes(search) ||
        (experience.employmentType ?? '').toLowerCase().includes(search) ||
        (experience.location ?? '').toLowerCase().includes(search) ||
        (experience.technologies ?? '').toLowerCase().includes(search),
    );
  }

  // ==========================================
  // OPEN ADD FORM
  // ==========================================

  openAddForm(): void {
    this.isEditMode.set(false);

    this.editingExperienceId = 0;

    this.successMessage.set('');

    this.errorMessage.set('');

    this.experienceForm.reset({
      companyName: '',

      jobTitle: '',

      employmentType: '',

      location: '',

      startDate: '',

      endDate: '',

      isCurrent: false,

      description: '',

      technologies: '',

      companyUrl: '',

      displayOrder: this.experiences.length + 1,

      isActive: true,
    });

    this.showForm.set(true);
  }

  // ==========================================
  // OPEN EDIT FORM
  // ==========================================

  openEditForm(experience: ExperienceModel): void {
    this.isEditMode.set(true);

    this.editingExperienceId = experience.experienceId;

    this.successMessage.set('');

    this.errorMessage.set('');

    this.experienceForm.patchValue({
      companyName: experience.companyName,

      jobTitle: experience.jobTitle,

      employmentType: experience.employmentType ?? '',

      location: experience.location ?? '',

      startDate: this.formatDateForInput(experience.startDate),

      endDate: experience.endDate ? this.formatDateForInput(experience.endDate) : '',

      isCurrent: experience.isCurrent,

      description: experience.description ?? '',

      technologies: experience.technologies ?? '',

      companyUrl: experience.companyUrl ?? '',

      displayOrder: experience.displayOrder,

      isActive: experience.isActive,
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
  // CURRENT JOB CHANGE
  // ==========================================

  onCurrentChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    const isCurrent = input.checked;

    if (isCurrent) {
      this.experienceForm.patchValue({
        endDate: '',
      });
    }
  }

  // ==========================================
  // CLOSE FORM
  // ==========================================

  closeForm(): void {
    this.showForm.set(false);

    this.experienceForm.reset({
      companyName: '',

      jobTitle: '',

      employmentType: '',

      location: '',

      startDate: '',

      endDate: '',

      isCurrent: false,

      description: '',

      technologies: '',

      companyUrl: '',

      displayOrder: 1,

      isActive: true,
    });
  }

  // ==========================================
  // SUBMIT
  // ==========================================

  onSubmit(): void {
    if (this.experienceForm.invalid) {
      this.experienceForm.markAllAsTouched();

      return;
    }

    this.isSaving.set(true);

    this.successMessage.set('');

    this.errorMessage.set('');

    const formValue = this.experienceForm.getRawValue();

    const data = {
      companyName: formValue.companyName,

      jobTitle: formValue.jobTitle,

      employmentType: formValue.employmentType || null,

      location: formValue.location || null,

      startDate: formValue.startDate,

      endDate: formValue.isCurrent ? null : formValue.endDate || null,

      isCurrent: formValue.isCurrent,

      description: formValue.description,

      technologies: formValue.technologies || null,

      companyUrl: formValue.companyUrl || null,

      displayOrder: formValue.displayOrder,

      isActive: formValue.isActive,
    };

    // ========================================
    // UPDATE
    // ========================================

    if (this.isEditMode()) {
      this.experienceService.updateExperience(this.editingExperienceId, data).subscribe({
        next: () => {
          this.isSaving.set(false);

          this.successMessage.set('Experience updated successfully.');

          this.closeForm();

          this.loadExperiences();
        },

        error: (error) => {
          console.error('Update Experience Error:', error);

          this.isSaving.set(false);

          this.errorMessage.set(error?.error?.message || 'Unable to update experience.');
        },
      });

      return;
    }

    // ========================================
    // CREATE
    // ========================================

    this.experienceService.createExperience(data).subscribe({
      next: () => {
        this.isSaving.set(false);

        this.successMessage.set('Experience added successfully.');

        this.closeForm();

        this.loadExperiences();
      },

      error: (error) => {
        console.error('Create Experience Error:', error);

        this.isSaving.set(false);

        this.errorMessage.set(error?.error?.message || 'Unable to add experience.');
      },
    });
  }

  // ==========================================
  // DELETE
  // ==========================================

  deleteExperience(experience: ExperienceModel): void {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${experience.jobTitle} at ${experience.companyName}"?`,
    );

    if (!confirmed) {
      return;
    }

    this.isDeleting.set(true);

    this.successMessage.set('');

    this.errorMessage.set('');

    this.experienceService.deleteExperience(experience.experienceId).subscribe({
      next: (response) => {
        console.log('Delete Experience Response:', response);

        this.isDeleting.set(false);

        this.successMessage.set('Experience deleted successfully.');

        this.loadExperiences();
      },

      error: (error) => {
        console.error('Delete Experience Error:', error);

        this.isDeleting.set(false);

        this.errorMessage.set(error?.error?.message || 'Unable to delete experience.');
      },
    });
  }
}

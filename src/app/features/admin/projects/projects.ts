import { Component, OnInit, inject, signal } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { ProjectService } from '../../../core/services/project';

import {
  Project,
  ProjectCreateRequest,
  ProjectUpdateRequest,
} from '../../../core/models/project.model';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './projects.html',
  styleUrl: './projects.css',
})
export class Projects implements OnInit {
  private readonly fb = inject(FormBuilder);

  private readonly projectService = inject(ProjectService);

  // ==========================================
  // UI STATE
  // ==========================================

  readonly isLoading = signal(true);

  readonly isSaving = signal(false);

  readonly isDeleting = signal(false);

  readonly isUploadingImage = signal(false);

  readonly showForm = signal(false);

  readonly isEditMode = signal(false);

  readonly successMessage = signal('');

  readonly errorMessage = signal('');

  readonly searchText = signal('');

  // ==========================================
  // IMAGE STATE
  // ==========================================

  selectedImage: File | null = null;

  imagePreviewUrl: string | null = null;

  // ==========================================
  // DATA
  // ==========================================

  projects: Project[] = [];

  editingProjectId = 0;

  // ==========================================
  // FORM
  // ==========================================

  projectForm = this.fb.nonNullable.group({
    projectName: ['', [Validators.required, Validators.maxLength(150)]],

    shortDescription: ['', [Validators.required, Validators.maxLength(500)]],

    description: ['', [Validators.maxLength(5000)]],

    githubUrl: ['', [Validators.maxLength(500)]],

    liveDemoUrl: ['', [Validators.maxLength(500)]],

    displayOrder: [1, [Validators.required, Validators.min(1)]],

    isFeatured: [false],

    isActive: [true],

    technologies: this.fb.array<FormGroup>([]),
  });

  // ==========================================
  // LIFECYCLE
  // ==========================================

  ngOnInit(): void {
    this.loadProjects();
  }

  // ==========================================
  // TECHNOLOGIES FORM ARRAY
  // ==========================================

  get technologies(): FormArray<FormGroup> {
    return this.projectForm.get('technologies') as FormArray<FormGroup>;
  }

  // ==========================================
  // CREATE TECHNOLOGY FORM
  // ==========================================

  private createTechnologyGroup(technologyName = '', displayOrder = 1, isActive = true): FormGroup {
    return this.fb.group({
      technologyName: [technologyName, [Validators.required, Validators.maxLength(100)]],

      displayOrder: [displayOrder, [Validators.required, Validators.min(1)]],

      isActive: [isActive],
    });
  }

  // ==========================================
  // ADD TECHNOLOGY
  // ==========================================

  addTechnology(): void {
    this.technologies.push(this.createTechnologyGroup('', this.technologies.length + 1, true));
  }

  // ==========================================
  // REMOVE TECHNOLOGY
  // ==========================================

  removeTechnology(index: number): void {
    this.technologies.removeAt(index);
  }

  // ==========================================
  // LOAD PROJECTS
  // ==========================================

  loadProjects(): void {
    this.isLoading.set(true);

    this.errorMessage.set('');

    this.projectService.getProjects().subscribe({
      next: (data) => {
        this.projects = data;

        this.isLoading.set(false);
      },

      error: (error) => {
        console.error('Projects API Error:', error);

        this.errorMessage.set('Unable to load projects.');

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

  // ==========================================
  // FILTERED PROJECTS
  // ==========================================

  get filteredProjects(): Project[] {
    const search = this.searchText();

    if (!search) {
      return this.projects;
    }

    return this.projects.filter(
      (project) =>
        project.projectName.toLowerCase().includes(search) ||
        project.shortDescription.toLowerCase().includes(search) ||
        project.technologies.some((technology) =>
          technology.technologyName.toLowerCase().includes(search),
        ),
    );
  }

  // ==========================================
  // OPEN ADD FORM
  // ==========================================

  openAddForm(): void {
    this.isEditMode.set(false);

    this.editingProjectId = 0;

    this.successMessage.set('');

    this.errorMessage.set('');

    this.clearSelectedImage();

    this.projectForm.reset({
      projectName: '',

      shortDescription: '',

      description: '',

      githubUrl: '',

      liveDemoUrl: '',

      displayOrder: this.projects.length + 1,

      isFeatured: false,

      isActive: true,
    });

    this.technologies.clear();

    this.addTechnology();

    this.showForm.set(true);
  }

  // ==========================================
  // OPEN EDIT FORM
  // ==========================================

  openEditForm(project: Project): void {
    this.isEditMode.set(true);

    this.editingProjectId = project.projectId;

    this.successMessage.set('');

    this.errorMessage.set('');

    // Reset selected new image
    this.clearSelectedImage();

    // Existing project image preview
    this.imagePreviewUrl = this.getImageUrl(project.imageUrl);

    this.projectForm.patchValue({
      projectName: project.projectName,

      shortDescription: project.shortDescription,

      description: project.description ?? '',

      githubUrl: project.gitHubUrl ?? '',

      liveDemoUrl: project.liveDemoUrl ?? '',

      displayOrder: project.displayOrder,

      isFeatured: project.isFeatured,

      isActive: project.isActive,
    });

    // Clear existing technologies
    this.technologies.clear();

    // Add project technologies
    if (project.technologies && project.technologies.length > 0) {
      project.technologies
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .forEach((technology) => {
          this.technologies.push(
            this.createTechnologyGroup(
              technology.technologyName,
              technology.displayOrder,
              technology.isActive,
            ),
          );
        });
    } else {
      this.addTechnology();
    }

    this.showForm.set(true);
  }

  // ==========================================
  // CLOSE FORM
  // ==========================================

  closeForm(): void {
    this.showForm.set(false);

    this.editingProjectId = 0;

    this.clearSelectedImage();

    this.projectForm.reset({
      projectName: '',

      shortDescription: '',

      description: '',

      githubUrl: '',

      liveDemoUrl: '',

      displayOrder: 1,

      isFeatured: false,

      isActive: true,
    });

    this.technologies.clear();
  }

  // ==========================================
  // SELECT PROJECT IMAGE
  // ==========================================

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    const file = input.files?.[0];

    if (!file) {
      return;
    }

    // ==========================================
    // ALLOWED FILE TYPES
    // ==========================================

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      this.errorMessage.set('Only JPG, JPEG and WEBP images are allowed.');

      input.value = '';

      return;
    }

    // ==========================================
    // MAX SIZE - 5 MB
    // ==========================================

    const maxFileSize = 5 * 1024 * 1024;

    if (file.size > maxFileSize) {
      this.errorMessage.set('Project image size must not exceed 5 MB.');

      input.value = '';

      return;
    }

    // ==========================================
    // SAVE SELECTED FILE
    // ==========================================

    this.selectedImage = file;

    this.errorMessage.set('');

    // ==========================================
    // CREATE PREVIEW
    // ==========================================

    if (this.imagePreviewUrl) {
      URL.revokeObjectURL(this.imagePreviewUrl);
    }

    this.imagePreviewUrl = URL.createObjectURL(file);
  }

  // ==========================================
  // CLEAR SELECTED IMAGE
  // ==========================================

  private clearSelectedImage(): void {
    if (this.imagePreviewUrl && this.imagePreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.imagePreviewUrl);
    }

    this.selectedImage = null;

    this.imagePreviewUrl = null;
  }

  // ==========================================
  // IMAGE URL
  // ==========================================

  getImageUrl(imageUrl: string | null): string | null {
    if (!imageUrl) {
      return null;
    }

    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    return `https://vishalportfolioapi.onrender.com${imageUrl}`;
  }

  // ==========================================
  // SUBMIT
  // ==========================================

  onSubmit(): void {
    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();

      return;
    }

    this.isSaving.set(true);

    this.successMessage.set('');

    this.errorMessage.set('');

    const formValue = this.projectForm.getRawValue();

    const technologies = formValue.technologies.map((technology: any) => ({
      technologyName: technology.technologyName,

      displayOrder: technology.displayOrder,

      isActive: technology.isActive,
    }));

    // ==========================================
    // CREATE REQUEST
    // ==========================================

    const data: ProjectCreateRequest | ProjectUpdateRequest = {
      projectName: formValue.projectName,

      shortDescription: formValue.shortDescription,

      description: formValue.description,

      technologies,

      gitHubUrl: formValue.githubUrl || null,

      liveDemoUrl: formValue.liveDemoUrl || null,

      displayOrder: formValue.displayOrder,

      isFeatured: formValue.isFeatured,

      isActive: formValue.isActive,
    };

    // ==========================================
    // UPDATE
    // ==========================================

    if (this.isEditMode()) {
      this.projectService
        .updateProject(this.editingProjectId, data as ProjectUpdateRequest)
        .subscribe({
          next: (project) => {
            // Project update successful
            this.uploadImageAfterSave(project.projectId, 'updated');
          },

          error: (error) => {
            console.error('Update Project Error:', error);

            this.isSaving.set(false);

            this.errorMessage.set(error?.error?.message || 'Unable to update project.');
          },
        });

      return;
    }

    // ==========================================
    // CREATE
    // ==========================================

    this.projectService.createProject(data as ProjectCreateRequest).subscribe({
      next: (project) => {
        // Project created successfully
        this.uploadImageAfterSave(project.projectId, 'created');
      },

      error: (error) => {
        console.error('Create Project Error:', error);

        this.isSaving.set(false);

        this.errorMessage.set(error?.error?.message || 'Unable to add project.');
      },
    });
  }

  // ==========================================
  // UPLOAD IMAGE AFTER CREATE / UPDATE
  // ==========================================

  private uploadImageAfterSave(projectId: number, action: 'created' | 'updated'): void {
    // No image selected
    if (!this.selectedImage) {
      this.isSaving.set(false);

      this.successMessage.set(
        action === 'created' ? 'Project added successfully.' : 'Project updated successfully.',
      );

      this.closeForm();

      this.loadProjects();

      return;
    }

    // ==========================================
    // UPLOAD IMAGE
    // ==========================================

    this.isUploadingImage.set(true);

    this.projectService.uploadProjectImage(projectId, this.selectedImage).subscribe({
      next: () => {
        this.isUploadingImage.set(false);

        this.isSaving.set(false);

        this.successMessage.set(
          action === 'created'
            ? 'Project added successfully with image.'
            : 'Project updated successfully with image.',
        );

        this.closeForm();

        this.loadProjects();
      },

      error: (error) => {
        console.error('Project Image Upload Error:', error);

        this.isUploadingImage.set(false);

        this.isSaving.set(false);

        this.errorMessage.set(error?.error?.message || 'Project saved, but image upload failed.');

        this.loadProjects();
      },
    });
  }

  // ==========================================
  // DELETE PROJECT
  // ==========================================

  deleteProject(project: Project): void {
    const confirmed = window.confirm(`Are you sure you want to delete "${project.projectName}"?`);

    if (!confirmed) {
      return;
    }

    this.isDeleting.set(true);

    this.successMessage.set('');

    this.errorMessage.set('');

    this.projectService.deleteProject(project.projectId).subscribe({
      next: (response) => {
        console.log('Delete Project Response:', response);

        this.isDeleting.set(false);

        this.successMessage.set('Project deleted successfully.');

        this.loadProjects();
      },

      error: (error) => {
        console.error('Delete Project Error:', error);

        this.isDeleting.set(false);

        this.errorMessage.set(error?.error?.message || 'Unable to delete project.');
      },
    });
  }
}

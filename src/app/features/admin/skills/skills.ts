import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { SkillService } from '../../../core/services/skill';
import { Skill } from '../../../core/models/skill.model';
import { SkillCategoryService, SkillCategory } from '../../../core/services/skill-category';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './skills.html',
  styleUrl: './skills.css',
})
export class Skills implements OnInit {
  private readonly fb = inject(FormBuilder);

  private readonly skillService = inject(SkillService);

  private readonly categoryService = inject(SkillCategoryService);

  // =====================================================
  // STATE
  // =====================================================

  readonly isLoading = signal(true);

  readonly isSaving = signal(false);

  readonly isDeleting = signal(false);

  readonly isUploading = signal(false);

  readonly showForm = signal(false);

  readonly isEditMode = signal(false);

  readonly successMessage = signal('');

  readonly errorMessage = signal('');

  readonly searchText = signal('');

  // =====================================================
  // DATA
  // =====================================================

  skills: Skill[] = [];

  categories: SkillCategory[] = [];

  editingSkillId = 0;

  // =====================================================
  // ICON
  // =====================================================

  selectedIconFile: File | null = null;

  selectedIconPreview: string | null = null;

  // =====================================================
  // FORM
  // =====================================================

  skillForm = this.fb.group({
    skillName: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(100)]),

    // Optional Category
    skillCategoryId: this.fb.control<number | null>(null),

    icon: this.fb.nonNullable.control('', [Validators.maxLength(200)]),

    displayOrder: this.fb.nonNullable.control(1, [Validators.required, Validators.min(1)]),

    isActive: this.fb.nonNullable.control(true),
  });

  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {
    this.loadSkills();

    this.loadCategories();
  }

  // =====================================================
  // LOAD SKILLS
  // =====================================================

  loadSkills(): void {
    this.isLoading.set(true);

    this.errorMessage.set('');

    this.skillService.getSkills().subscribe({
      next: (data) => {
        this.skills = data;

        this.isLoading.set(false);
      },

      error: (error) => {
        console.error('Skills API Error:', error);

        this.errorMessage.set('Unable to load skills.');

        this.isLoading.set(false);
      },
    });
  }

  // =====================================================
  // LOAD CATEGORIES
  // =====================================================

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },

      error: (error) => {
        console.error('Skill Category API Error:', error);
      },
    });
  }

  // =====================================================
  // SEARCH
  // =====================================================

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.searchText.set(input.value.trim().toLowerCase());
  }

  // =====================================================
  // FILTERED SKILLS
  // =====================================================

  get filteredSkills(): Skill[] {
    const search = this.searchText();

    if (!search) {
      return this.skills;
    }

    return this.skills.filter((skill) => {
      const skillName = skill.skillName?.toLowerCase() ?? '';

      const categoryName = skill.categoryName?.toLowerCase() ?? '';

      return skillName.includes(search) || categoryName.includes(search);
    });
  }

  // =====================================================
  // OPEN ADD FORM
  // =====================================================

  openAddForm(): void {
    this.isEditMode.set(false);

    this.editingSkillId = 0;

    this.successMessage.set('');

    this.errorMessage.set('');

    this.clearSelectedIcon();

    this.skillForm.reset({
      skillName: '',

      // No category by default
      skillCategoryId: null,

      icon: '',

      displayOrder: this.skills.length + 1,

      isActive: true,
    });

    this.showForm.set(true);
  }

  // =====================================================
  // OPEN EDIT FORM
  // =====================================================

  openEditForm(skill: Skill): void {
    this.isEditMode.set(true);

    this.editingSkillId = skill.skillId;

    this.successMessage.set('');

    this.errorMessage.set('');

    this.clearSelectedIcon();

    this.skillForm.patchValue({
      skillName: skill.skillName,

      // Can be number OR null
      skillCategoryId: skill.skillCategoryId,

      icon: skill.icon ?? '',

      displayOrder: skill.displayOrder,

      isActive: skill.isActive,
    });

    this.showForm.set(true);
  }

  // =====================================================
  // CLOSE FORM
  // =====================================================

  closeForm(): void {
    this.showForm.set(false);

    this.clearSelectedIcon();

    this.skillForm.reset({
      skillName: '',

      // No category
      skillCategoryId: null,

      icon: '',

      displayOrder: 1,

      isActive: true,
    });
  }

  // =====================================================
  // SAVE SKILL
  // =====================================================

  onSubmit(): void {
    if (this.skillForm.invalid) {
      this.skillForm.markAllAsTouched();

      return;
    }

    this.isSaving.set(true);

    this.successMessage.set('');

    this.errorMessage.set('');

    const data = this.skillForm.getRawValue();

    // =================================================
    // UPDATE
    // =================================================

    if (this.isEditMode()) {
      const iconFile = this.selectedIconFile;

      this.skillService.updateSkill(this.editingSkillId, data).subscribe({
        next: (updatedSkill) => {
          this.isSaving.set(false);

          this.closeForm();

          this.loadSkills();

          if (iconFile) {
            this.uploadIcon(updatedSkill.skillId, iconFile);
          } else {
            this.successMessage.set('Skill updated successfully.');
          }
        },

        error: (error) => {
          console.error('Update Skill Error:', error);

          this.isSaving.set(false);

          this.errorMessage.set(error?.error?.message || 'Unable to update skill.');
        },
      });

      return;
    }

    // =================================================
    // CREATE
    // =================================================

    const iconFile = this.selectedIconFile;

    this.skillService.createSkill(data).subscribe({
      next: (createdSkill) => {
        this.isSaving.set(false);

        this.closeForm();

        this.loadSkills();

        if (iconFile) {
          this.uploadIcon(createdSkill.skillId, iconFile);
        } else {
          this.successMessage.set('Skill added successfully.');
        }
      },

      error: (error) => {
        console.error('Create Skill Error:', error);

        this.isSaving.set(false);

        this.errorMessage.set(error?.error?.message || 'Unable to add skill.');
      },
    });
  }

  // =====================================================
  // SELECT ICON
  // =====================================================

  onIconSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    // =================================================
    // VALIDATE FILE TYPE
    // =================================================

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];

    const extension = file.name.split('.').pop()?.toLowerCase();

    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'svg'];

    if (
      !allowedTypes.includes(file.type) &&
      !(extension && allowedExtensions.includes(extension))
    ) {
      this.errorMessage.set('Only JPG, JPEG, PNG, WEBP and SVG files are allowed.');

      input.value = '';

      return;
    }

    // =================================================
    // VALIDATE FILE SIZE
    // =================================================

    const maxSize = 2 * 1024 * 1024;

    if (file.size > maxSize) {
      this.errorMessage.set('Icon size must not exceed 2 MB.');

      input.value = '';

      return;
    }

    // =================================================
    // SAVE FILE
    // =================================================

    this.selectedIconFile = file;

    this.errorMessage.set('');

    // =================================================
    // CREATE PREVIEW
    // =================================================

    if (this.selectedIconPreview) {
      URL.revokeObjectURL(this.selectedIconPreview);
    }

    this.selectedIconPreview = URL.createObjectURL(file);
  }

  // =====================================================
  // UPLOAD ICON
  // =====================================================

  uploadIcon(skillId: number, file: File): void {
    this.isUploading.set(true);

    this.errorMessage.set('');

    this.skillService.uploadIcon(skillId, file).subscribe({
      next: () => {
        this.isUploading.set(false);

        this.successMessage.set('Skill icon uploaded successfully.');

        this.clearSelectedIcon();

        this.loadSkills();
      },

      error: (error) => {
        console.error('Upload Skill Icon Error:', error);

        this.isUploading.set(false);

        this.errorMessage.set(error?.error?.message || 'Unable to upload skill icon.');
      },
    });
  }

  // =====================================================
  // CLEAR SELECTED ICON
  // =====================================================

  clearSelectedIcon(): void {
    this.selectedIconFile = null;

    if (this.selectedIconPreview) {
      URL.revokeObjectURL(this.selectedIconPreview);
    }

    this.selectedIconPreview = null;
  }

  // =====================================================
  // DELETE SKILL
  // =====================================================

  deleteSkill(skill: Skill): void {
    const confirmed = window.confirm(`Are you sure you want to delete "${skill.skillName}"?`);

    if (!confirmed) {
      return;
    }

    this.isDeleting.set(true);

    this.successMessage.set('');

    this.errorMessage.set('');

    this.skillService.deleteSkill(skill.skillId).subscribe({
      next: (response) => {
        console.log('Delete Skill Response:', response);

        this.isDeleting.set(false);

        this.successMessage.set('Skill deleted successfully.');

        this.loadSkills();
      },

      error: (error) => {
        console.error('Delete Skill Error:', error);

        this.isDeleting.set(false);

        this.errorMessage.set(error?.error?.message || 'Unable to delete skill.');
      },
    });
  }
}

import { Component, OnInit, inject, signal } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { BlogService, BlogPost as BlogPostModel } from '../../../core/services/blog';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './blog.html',
  styleUrl: './blog.css',
})
export class Blog implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly blogService = inject(BlogService);

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

  blogs: BlogPostModel[] = [];

  editingBlogId = 0;

  // ==========================================
  // FORM
  // ==========================================

  blogForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],

    slug: ['', [Validators.required, Validators.maxLength(250)]],

    shortDescription: ['', [Validators.maxLength(500)]],

    content: ['', [Validators.required]],

    featuredImageUrl: ['', [Validators.maxLength(500)]],

    category: ['', [Validators.maxLength(100)]],

    tags: ['', [Validators.maxLength(500)]],

    publishedDate: ['', [Validators.required]],

    isPublished: [false],

    displayOrder: [1, [Validators.required, Validators.min(1)]],
  });

  // ==========================================
  // INIT
  // ==========================================

  ngOnInit(): void {
    this.loadBlogs();
  }

  // ==========================================
  // LOAD BLOGS
  // ==========================================

  loadBlogs(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.blogService.getBlogs().subscribe({
      next: (data) => {
        this.blogs = data;

        this.isLoading.set(false);
      },

      error: (error) => {
        console.error('Blog API Error:', error);

        this.errorMessage.set('Unable to load blog posts.');

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

  get filteredBlogs(): BlogPostModel[] {
    const search = this.searchText();

    if (!search) {
      return this.blogs;
    }

    return this.blogs.filter(
      (blog) =>
        blog.title.toLowerCase().includes(search) ||
        blog.slug.toLowerCase().includes(search) ||
        (blog.category ?? '').toLowerCase().includes(search) ||
        (blog.tags ?? '').toLowerCase().includes(search) ||
        (blog.shortDescription ?? '').toLowerCase().includes(search),
    );
  }

  // ==========================================
  // ADD FORM
  // ==========================================

  openAddForm(): void {
    this.isEditMode.set(false);

    this.editingBlogId = 0;

    this.successMessage.set('');
    this.errorMessage.set('');

    this.blogForm.reset({
      title: '',

      slug: '',

      shortDescription: '',

      content: '',

      featuredImageUrl: '',

      category: '',

      tags: '',

      publishedDate: this.getTodayDate(),

      isPublished: false,

      displayOrder: this.blogs.length + 1,
    });

    this.showForm.set(true);
  }

  // ==========================================
  // EDIT FORM
  // ==========================================

  openEditForm(blog: BlogPostModel): void {
    this.isEditMode.set(true);

    this.editingBlogId = blog.blogPostId;

    this.successMessage.set('');
    this.errorMessage.set('');

    this.blogForm.patchValue({
      title: blog.title,

      slug: blog.slug,

      shortDescription: blog.shortDescription ?? '',

      content: blog.content,

      featuredImageUrl: blog.featuredImageUrl ?? '',

      category: blog.category ?? '',

      tags: blog.tags ?? '',

      publishedDate: this.formatDateForInput(blog.publishedDate),

      isPublished: blog.isPublished,

      displayOrder: blog.displayOrder,
    });

    this.showForm.set(true);
  }

  // ==========================================
  // DATE HELPERS
  // ==========================================

  private getTodayDate(): string {
    const today = new Date();

    const year = today.getFullYear();

    const month = String(today.getMonth() + 1).padStart(2, '0');

    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private formatDateForInput(date: string): string {
    if (!date) {
      return '';
    }

    return date.substring(0, 10);
  }

  // ==========================================
  // AUTO SLUG
  // ==========================================

  generateSlug(): void {
    const title = this.blogForm.controls.title.value;

    if (!title) {
      return;
    }

    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    this.blogForm.patchValue({
      slug,
    });
  }

  // ==========================================
  // CLOSE FORM
  // ==========================================

  closeForm(): void {
    this.showForm.set(false);

    this.blogForm.reset({
      title: '',

      slug: '',

      shortDescription: '',

      content: '',

      featuredImageUrl: '',

      category: '',

      tags: '',

      publishedDate: this.getTodayDate(),

      isPublished: false,

      displayOrder: 1,
    });
  }

  // ==========================================
  // SUBMIT
  // ==========================================

  onSubmit(): void {
    if (this.blogForm.invalid) {
      this.blogForm.markAllAsTouched();

      return;
    }

    this.isSaving.set(true);

    this.successMessage.set('');
    this.errorMessage.set('');

    const formValue = this.blogForm.getRawValue();

    const data = {
      title: formValue.title,

      slug: formValue.slug,

      shortDescription: formValue.shortDescription || null,

      content: formValue.content,

      featuredImageUrl: formValue.featuredImageUrl || null,

      category: formValue.category || null,

      tags: formValue.tags || null,

      publishedDate: formValue.publishedDate,

      isPublished: formValue.isPublished,

      displayOrder: formValue.displayOrder,
    };

    // ========================================
    // UPDATE
    // ========================================

    if (this.isEditMode()) {
      this.blogService.updateBlog(this.editingBlogId, data).subscribe({
        next: () => {
          this.isSaving.set(false);

          this.successMessage.set('Blog post updated successfully.');

          this.closeForm();

          this.loadBlogs();
        },

        error: (error) => {
          console.error('Update Blog Error:', error);

          this.isSaving.set(false);

          this.errorMessage.set(error?.error?.message || 'Unable to update blog post.');
        },
      });

      return;
    }

    // ========================================
    // CREATE
    // ========================================

    this.blogService.createBlog(data).subscribe({
      next: () => {
        this.isSaving.set(false);

        this.successMessage.set('Blog post added successfully.');

        this.closeForm();

        this.loadBlogs();
      },

      error: (error) => {
        console.error('Create Blog Error:', error);

        this.isSaving.set(false);

        this.errorMessage.set(error?.error?.message || 'Unable to add blog post.');
      },
    });
  }

  // ==========================================
  // DELETE
  // ==========================================

  deleteBlog(blog: BlogPostModel): void {
    const confirmed = window.confirm(`Are you sure you want to delete "${blog.title}"?`);

    if (!confirmed) {
      return;
    }

    this.isDeleting.set(true);

    this.successMessage.set('');
    this.errorMessage.set('');

    this.blogService.deleteBlog(blog.blogPostId).subscribe({
      next: () => {
        this.isDeleting.set(false);

        this.successMessage.set('Blog post deleted successfully.');

        this.loadBlogs();
      },

      error: (error) => {
        console.error('Delete Blog Error:', error);

        this.isDeleting.set(false);

        this.errorMessage.set(error?.error?.message || 'Unable to delete blog post.');
      },
    });
  }
}

import { Component, OnInit, inject, signal } from '@angular/core';

import { CommonModule } from '@angular/common';

import { RouterLink } from '@angular/router';

import { ProjectService } from '../../../core/services/project';

import { Project } from '../../../core/models/project.model';

@Component({
  selector: 'app-public-projects',
  standalone: true,

  imports: [CommonModule, RouterLink],

  templateUrl: './projects.html',
  styleUrl: './projects.css',
})
export class Projects implements OnInit {
  private readonly projectService = inject(ProjectService);

  // =====================================================
  // STATE
  // =====================================================

  readonly isLoading = signal(true);

  readonly errorMessage = signal('');

  readonly searchText = signal('');

  readonly selectedFilter = signal<'all' | 'featured'>('all');

  // =====================================================
  // DATA
  // =====================================================

  projects: Project[] = [];

  filteredProjects: Project[] = [];

  // =====================================================
  // LIFECYCLE
  // =====================================================

  ngOnInit(): void {
    this.loadProjects();
  }

  // =====================================================
  // LOAD PROJECTS
  // =====================================================

  loadProjects(): void {
    this.isLoading.set(true);

    this.errorMessage.set('');

    this.projectService.getProjects().subscribe({
      next: (data) => {
        this.projects = data
          .filter((project) => project.isActive)
          .sort((a, b) => a.displayOrder - b.displayOrder);

        this.applyFilters();

        this.isLoading.set(false);
      },

      error: (error) => {
        console.error('Public Projects API Error:', error);

        this.errorMessage.set('Unable to load projects right now.');

        this.isLoading.set(false);
      },
    });
  }

  // =====================================================
  // SEARCH
  // =====================================================

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.searchText.set(input.value.trim().toLowerCase());

    this.applyFilters();
  }

  // =====================================================
  // FILTER
  // =====================================================

  setFilter(filter: 'all' | 'featured'): void {
    this.selectedFilter.set(filter);

    this.applyFilters();
  }

  // =====================================================
  // APPLY FILTERS
  // =====================================================

  applyFilters(): void {
    const search = this.searchText();

    const filter = this.selectedFilter();

    let result = [...this.projects];

    // Featured filter

    if (filter === 'featured') {
      result = result.filter((project) => project.isFeatured);
    }

    // Search

    if (search) {
      result = result.filter((project) => {
        const projectName = project.projectName.toLowerCase();

        const description = project.shortDescription.toLowerCase();

        const technologies = this.getProjectTechnologies(project).join(' ').toLowerCase();

        return (
          projectName.includes(search) ||
          description.includes(search) ||
          technologies.includes(search)
        );
      });
    }

    this.filteredProjects = result;
  }

  // =====================================================
  // TECHNOLOGIES
  // =====================================================

  getProjectTechnologies(project: Project): string[] {
    return (
      project.technologies
        ?.filter((technology) => technology.isActive)
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((technology) => technology.technologyName) ?? []
    );
  }

  // =====================================================
  // IMAGE URL
  // =====================================================

  getProjectImageUrl(imageUrl: string | null): string | null {
    if (!imageUrl) {
      return null;
    }

    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    return `https://vishalportfolioapi.onrender.com${imageUrl}`;
  }

  // =====================================================
  // COUNTS
  // =====================================================

  get totalProjects(): number {
    return this.projects.length;
  }

  get featuredProjects(): number {
    return this.projects.filter((project) => project.isFeatured).length;
  }
}

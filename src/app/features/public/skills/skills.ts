import { Component, OnInit, inject, signal } from '@angular/core';

import { CommonModule } from '@angular/common';

import { RouterLink } from '@angular/router';

import { SkillService } from '../../../core/services/skill';

import { Skill } from '../../../core/models/skill.model';

@Component({
  selector: 'app-public-skills',
  standalone: true,

  imports: [CommonModule, RouterLink],

  templateUrl: './skills.html',
  styleUrl: './skills.css',
})
export class Skills implements OnInit {
  private readonly skillService = inject(SkillService);

  // =====================================================
  // STATE
  // =====================================================

  readonly isLoading = signal(true);

  readonly errorMessage = signal('');

  readonly searchText = signal('');

  readonly selectedCategory = signal('all');

  // =====================================================
  // DATA
  // =====================================================

  skills: Skill[] = [];

  filteredSkills: Skill[] = [];

  categories: string[] = [];

  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {
    this.loadSkills();
  }

  // =====================================================
  // LOAD SKILLS
  // =====================================================

  loadSkills(): void {
    this.isLoading.set(true);

    this.errorMessage.set('');

    this.skillService.getSkills().subscribe({
      next: (data) => {
        this.skills = (data || [])
          .filter((skill) => skill.isActive !== false)
          .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

        this.buildCategories();

        this.applyFilters();

        this.isLoading.set(false);
      },

      error: (error) => {
        console.error('Public Skills API Error:', error);

        this.errorMessage.set('Unable to load skills right now.');

        this.isLoading.set(false);
      },
    });
  }

  // =====================================================
  // BUILD CATEGORIES
  // =====================================================

  buildCategories(): void {
    const categorySet = new Set<string>();

    this.skills.forEach((skill) => {
      const category = skill.categoryName?.trim();

      if (category) {
        categorySet.add(category);
      }
    });

    this.categories = Array.from(categorySet).sort();
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
  // CATEGORY FILTER
  // =====================================================

  setCategory(category: string): void {
    this.selectedCategory.set(category);

    this.applyFilters();
  }

  // =====================================================
  // APPLY FILTERS
  // =====================================================

  applyFilters(): void {
    const search = this.searchText();

    const category = this.selectedCategory();

    let result = [...this.skills];

    // CATEGORY FILTER

    if (category !== 'all') {
      result = result.filter((skill) => skill.categoryName === category);
    }

    // SEARCH FILTER

    if (search) {
      result = result.filter((skill) => {
        const skillName = skill.skillName?.toLowerCase() ?? '';

        const categoryName = skill.categoryName?.toLowerCase() ?? '';

        const icon = skill.icon?.toLowerCase() ?? '';

        return skillName.includes(search) || categoryName.includes(search) || icon.includes(search);
      });
    }

    this.filteredSkills = result;
  }

  // =====================================================
  // ICON URL
  // =====================================================

  getSkillIconUrl(skill: Skill): string | null {
    // Custom uploaded icon
    if (skill.iconUrl?.trim()) {
      const iconUrl = skill.iconUrl.trim();

      if (iconUrl.startsWith('http://') || iconUrl.startsWith('https://')) {
        return iconUrl;
      }

      return `https://localhost:7295${iconUrl}`;
    }

    // Simple Icons
    if (skill.icon?.trim()) {
      return `https://cdn.simpleicons.org/${skill.icon.trim()}`;
    }

    return null;
  }

  // =====================================================
  // STATS
  // =====================================================

  get totalSkills(): number {
    return this.skills.length;
  }

  get totalCategories(): number {
    return this.categories.length;
  }

  get customIconCount(): number {
    return this.skills.filter((skill) => !!skill.iconUrl?.trim()).length;
  }
}

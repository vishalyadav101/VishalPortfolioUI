import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ProfileService } from '../../../core/services/profile';
import { Profile } from '../../../core/models/profile.model';

import { ProjectService } from '../../../core/services/project';
import { Project } from '../../../core/models/project.model';

import { SkillService } from '../../../core/services/skill';
import { Skill } from '../../../core/models/skill.model';

import { ExperienceService } from '../../../core/services/experience';
import { Experience } from '../../../core/models/experience.model';

@Component({
  selector: 'app-home',
  standalone: true,

  imports: [CommonModule, RouterLink],

  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  // =====================================================
  // SERVICES
  // =====================================================

  private readonly profileService = inject(ProfileService);

  private readonly projectService = inject(ProjectService);

  private readonly skillService = inject(SkillService);

  private readonly experienceService = inject(ExperienceService);

  // =====================================================
  // STATE
  // =====================================================

  isLoading = signal(true);

  errorMessage = signal('');

  // =====================================================
  // DATA
  // =====================================================

  profile: Profile | null = null;

  projects: Project[] = [];

  skills: Skill[] = [];

  experiences: Experience[] = [];

  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {
    this.loadHomeData();
  }

  // =====================================================
  // LOAD HOME DATA
  // =====================================================

  loadHomeData(): void {
    this.isLoading.set(true);

    this.errorMessage.set('');

    let profileLoaded = false;
    let projectsLoaded = false;
    let skillsLoaded = false;
    let experiencesLoaded = false;

    const checkComplete = (): void => {
      if (profileLoaded && projectsLoaded && skillsLoaded && experiencesLoaded) {
        this.isLoading.set(false);
      }
    };

    // ===================================================
    // PROFILE
    // ===================================================

    this.profileService.getProfile().subscribe({
      next: (response: Profile) => {
        this.profile = response;

        profileLoaded = true;

        checkComplete();
      },

      error: (error) => {
        console.error('Profile API Error:', error);

        this.profile = null;

        profileLoaded = true;

        checkComplete();
      },
    });

    // ===================================================
    // PROJECTS
    // ===================================================

    this.projectService.getProjects().subscribe({
      next: (response: Project[]) => {
        this.projects = (response || [])

          // Only active projects
          .filter((project: Project) => project.isActive !== false)

          // Display order
          .sort((a: Project, b: Project) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

        projectsLoaded = true;

        checkComplete();
      },

      error: (error) => {
        console.error('Projects API Error:', error);

        this.projects = [];

        projectsLoaded = true;

        checkComplete();
      },
    });

    // ===================================================
    // SKILLS
    // ===================================================

    this.skillService.getSkills().subscribe({
      next: (response: Skill[]) => {
        this.skills = (response || [])

          .filter((skill: Skill) => skill.isActive !== false)

          .sort((a: Skill, b: Skill) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

        skillsLoaded = true;

        checkComplete();
      },

      error: (error) => {
        console.error('Skills API Error:', error);

        this.skills = [];

        skillsLoaded = true;

        checkComplete();
      },
    });

    // ===================================================
    // EXPERIENCE
    // ===================================================

    this.experienceService.getExperiences().subscribe({
      next: (response: Experience[]) => {
        this.experiences = (response || [])

          .filter((experience: Experience) => experience.isActive !== false)

          .sort((a: Experience, b: Experience) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

        experiencesLoaded = true;

        checkComplete();
      },

      error: (error) => {
        console.error('Experience API Error:', error);

        this.experiences = [];

        experiencesLoaded = true;

        checkComplete();
      },
    });
  }

  // =====================================================
  // HERO - FIRST NAME
  // =====================================================

  get heroFirstName(): string {
    const fullName = this.profile?.fullName?.trim() || 'Vishal Yadav';

    const parts = fullName.split(/\s+/);

    if (parts.length <= 1) {
      return parts[0] ?? '';
    }

    return parts.slice(0, -1).join(' ');
  }

  // =====================================================
  // HERO - LAST NAME
  // =====================================================

  get heroLastName(): string {
    const fullName = this.profile?.fullName?.trim() || 'Vishal Yadav';

    const parts = fullName.split(/\s+/);

    if (parts.length <= 1) {
      return '';
    }

    return parts[parts.length - 1];
  }

  // =====================================================
  // HERO - CODE NOTE
  // =====================================================

  get codeNoteLines(): string[] {
    const codeNote = this.profile?.codeNote?.trim() || 'Code / Build / Grow / Repeat';

    return codeNote

      .split('/')

      .map((item: string) => item.trim())

      .filter((item: string) => !!item);
  }

  // =====================================================
  // FEATURED PROJECTS
  // =====================================================

  get featuredProjects(): Project[] {
    return this.projects.filter((project: Project) => project.isFeatured === true);
  }

  // =====================================================
  // PROJECTS TO SHOW ON HOME
  // =====================================================

  get displayProjects(): Project[] {
    const featured = this.featuredProjects;

    if (featured.length > 0) {
      return featured.slice(0, 3);
    }

    return this.projects.slice(0, 3);
  }

  // =====================================================
  // TOTAL ACTIVE PROJECTS
  // =====================================================

  get activeProjectsCount(): number {
    return this.projects.length;
  }

  // =====================================================
  // SKILLS TO SHOW ON HOME
  // =====================================================

  get displaySkills(): Skill[] {
    return this.skills.slice(0, 16);
  }

  // =====================================================
  // TOTAL ACTIVE SKILLS
  // =====================================================

  get activeSkillsCount(): number {
    return this.skills.length;
  }

  // =====================================================
  // CURRENT EXPERIENCE
  // =====================================================

  get currentExperience(): Experience | null {
    const current = this.experiences.find(
      (experience: Experience) => experience.isCurrent === true,
    );

    if (current) {
      return current;
    }

    return this.experiences[0] ?? null;
  }

  // =====================================================
  // EXPERIENCE VALUE
  // =====================================================

  get experienceValue(): string {
    const experience = this.currentExperience;

    if (!experience?.startDate) {
      return '0+';
    }

    const startDate = new Date(experience.startDate);

    const today = new Date();

    let years = today.getFullYear() - startDate.getFullYear();

    const monthDifference = today.getMonth() - startDate.getMonth();

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < startDate.getDate())) {
      years--;
    }

    // Less than one year
    if (years < 1) {
      const months =
        (today.getFullYear() - startDate.getFullYear()) * 12 +
        (today.getMonth() - startDate.getMonth());

      const adjustedMonths = today.getDate() < startDate.getDate() ? months - 1 : months;

      return `${Math.max(adjustedMonths, 1)}+`;
    }

    return `${years}+`;
  }

  // =====================================================
  // EXPERIENCE LABEL
  // =====================================================

  get experienceLabel(): string {
    const experience = this.currentExperience;

    if (!experience?.startDate) {
      return 'Experience';
    }

    const startDate = new Date(experience.startDate);

    const today = new Date();

    let years = today.getFullYear() - startDate.getFullYear();

    const monthDifference = today.getMonth() - startDate.getMonth();

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < startDate.getDate())) {
      years--;
    }

    if (years < 1) {
      return 'Months Experience';
    }

    return years === 1 ? 'Year Experience' : 'Years Experience';
  }

  // =====================================================
  // COLLABORATION STATUS
  // =====================================================

  get collaborationStatus(): string {
    const status = this.profile?.availabilityStatus?.trim();

    if (!status) {
      return 'Open';
    }

    if (status.toLowerCase().includes('open')) {
      return 'Open';
    }

    return status;
  }

  // =====================================================
  // PROJECT TECHNOLOGIES
  // =====================================================

  getProjectTechnologies(project: Project): string[] {
    if (!Array.isArray(project.technologies)) {
      return [];
    }

    return [...project.technologies]

      .filter(
        (technology) => technology && technology.isActive !== false && !!technology.technologyName,
      )

      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))

      .map((technology) => technology.technologyName);
  }

  // =====================================================
  // PROJECT IMAGE URL
  // =====================================================

  getProjectImageUrl(imageUrl: string | null): string | null {
    if (!imageUrl) {
      return null;
    }

    // Already full URL
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    // Backend relative upload path
    return `https://vishal-yadav-dotnet-developer.somee.com${imageUrl}`;
  }

  // =====================================================
  // SCROLL TO PROJECTS
  // =====================================================

  scrollToProjects(): void {
    const element = document.getElementById('projects');

    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }

  // =====================================================
  // SCROLL TO SKILLS
  // =====================================================

  scrollToSkills(): void {
    const element = document.getElementById('skills');

    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }
}

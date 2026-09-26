export interface Experience {
  experienceId: number;

  companyName: string;
  jobTitle: string;

  employmentType: string | null;
  location: string | null;

  startDate: string;
  endDate: string | null;

  isCurrent: boolean;

  description: string;

  technologies: string | null;
  companyUrl: string | null;

  displayOrder: number;
  isActive: boolean;

  createdDate: string;
  updatedDate: string | null;
}

export interface ExperienceCreateRequest {
  companyName: string;
  jobTitle: string;

  employmentType: string | null;
  location: string | null;

  startDate: string;
  endDate: string | null;

  isCurrent: boolean;

  description: string;

  technologies: string | null;
  companyUrl: string | null;

  displayOrder: number;
  isActive: boolean;
}

export interface ExperienceUpdateRequest {
  companyName: string;
  jobTitle: string;

  employmentType: string | null;
  location: string | null;

  startDate: string;
  endDate: string | null;

  isCurrent: boolean;

  description: string;

  technologies: string | null;
  companyUrl: string | null;

  displayOrder: number;
  isActive: boolean;
}

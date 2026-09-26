export interface ProjectTechnology {
  projectTechnologyId: number;
  projectId: number;
  technologyName: string;
  displayOrder: number;
  isActive: boolean;
  createdDate: string;
  updatedDate: string | null;
}

export interface ProjectTechnologyRequest {
  technologyName: string;
  displayOrder: number;
  isActive: boolean;
}

export interface Project {
  projectId: number;
  projectName: string;
  shortDescription: string;
  description: string;

  // IMPORTANT:
  // Backend property is GitHubUrl
  // ASP.NET Core JSON response becomes gitHubUrl
  gitHubUrl: string | null;

  liveDemoUrl: string | null;
  imageUrl: string | null;

  displayOrder: number;
  isFeatured: boolean;
  isActive: boolean;

  createdDate: string;
  updatedDate: string | null;

  technologies: ProjectTechnology[];
}

export interface ProjectCreateRequest {
  projectName: string;
  shortDescription: string;
  description: string;

  technologies: ProjectTechnologyRequest[];

  gitHubUrl: string | null;
  liveDemoUrl: string | null;

  displayOrder: number;
  isFeatured: boolean;
  isActive: boolean;
}

export interface ProjectUpdateRequest {
  projectName: string;
  shortDescription: string;
  description: string;

  technologies: ProjectTechnologyRequest[];

  gitHubUrl: string | null;
  liveDemoUrl: string | null;

  displayOrder: number;
  isFeatured: boolean;
  isActive: boolean;
}

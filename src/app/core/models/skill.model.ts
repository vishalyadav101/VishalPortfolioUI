export interface Skill {
  skillId: number;

  skillName: string;

  // Optional Skill Category
  skillCategoryId: number | null;

  categoryName: string | null;

  icon: string;

  iconUrl: string | null;

  displayOrder: number;

  isActive: boolean;

  createdDate: string;

  updatedDate: string | null;
}

export interface SkillCreateRequest {
  skillName: string;

  // Optional Skill Category
  skillCategoryId: number | null;

  icon: string;

  iconUrl?: string | null;

  displayOrder: number;

  isActive: boolean;
}

export interface SkillUpdateRequest {
  skillName: string;

  // Optional Skill Category
  skillCategoryId: number | null;

  icon: string;

  iconUrl?: string | null;

  displayOrder: number;

  isActive: boolean;
}
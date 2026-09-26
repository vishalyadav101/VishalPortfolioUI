export interface Profile {
  profileId: number;

  // PERSONAL INFORMATION
  fullName: string;
  greeting: string;
  headline: string;
  shortDescription: string;

  // ABOUT SECTION
  about: string;
  aboutLabel: string;
  aboutHeading: string;
  aboutHighlight: string;
  education: string;
  aboutImageUrl: string | null;
  quote: string;
  quoteAuthor: string;

  // CONTACT INFORMATION
  email: string;
  phone: string | null;
  location: string | null;

  // PROFILE / RESUME
  profileImageUrl: string | null;
  resumeUrl: string | null;

  // SOCIAL LINKS
  gitHubUrl: string | null;
  linkedInUrl: string | null;

  // HERO / AVAILABILITY
  codeNote: string;
  availabilityStatus: string;
  availabilityMessage: string;
}

export interface ProfileUpdateRequest {
  // PERSONAL INFORMATION
  fullName: string;
  greeting: string;
  headline: string;
  shortDescription: string;

  // ABOUT SECTION
  about: string;
  aboutLabel: string;
  aboutHeading: string;
  aboutHighlight: string;
  education: string;
  aboutImageUrl: string;
  quote: string;
  quoteAuthor: string;

  // CONTACT INFORMATION
  email: string;
  phone: string;
  location: string;

  // PROFILE / RESUME
  profileImageUrl: string;
  resumeUrl: string;

  // SOCIAL LINKS
  gitHubUrl: string;
  linkedInUrl: string;

  // HERO / AVAILABILITY
  codeNote: string;
  availabilityStatus: string;
  availabilityMessage: string;
}

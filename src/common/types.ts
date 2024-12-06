export interface JobDetails {
  title: string;
  company: string;
  location?: string;
  description?: string;
  salary?: string;
  url: string;
}

export interface JobSiteHandler {
  name: string;
  isValidJobPage(): boolean;
  getJobDetails(): JobDetails | null;
  applyToJob(): Promise<boolean>;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  resume?: string;
  linkedinProfile?: string;
  experience?: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
    description?: string;
  }>;
}

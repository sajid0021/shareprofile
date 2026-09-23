export interface Profile {
  id?: string;
  username: string;

  firstName: string;
  lastName: string;

  headline: string;
  about: string;

  location: {
    city: string;
    state: string;
    country: string;
  };

  contact: {
    email: string;
    phone?: string;
    website?: string;
  };

  profileImage?: string;
  coverImage?: string;

  experience: Experience[];
  education: Education[];
  skills: string[];
  projects: Project[];
  certifications: Certification[];
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  url?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

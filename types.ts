export enum AppView {
  LANDING = 'LANDING',
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  HISTORY = 'HISTORY',
}

export enum CVType {
  BEST_FIT = 'Best Fit',
  RANDOM_FIT = 'Random Fit',
  BAD_FIT_CHARMING = 'Bad Fit (Charismatic)',
}

export enum CVTone {
  PROFESSIONAL = 'Professional',
  CREATIVE = 'Creative',
  ACADEMIC = 'Academic',
  BOLD = 'Bold/Direct',
}

export interface Experience {
  role: string;
  company: string;
  duration: string;
  description: string;
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
}

export interface CVProfile {
  id: string;
  userId?: string; // Added for Firestore security
  type: CVType;
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  hobbies: string[];
  generatedAt: number;
  tone: string;
}

export interface JobCriteria {
  jobTitle: string;
  context: string;
  yearsExperience: number;
  tone: CVTone;
  includeHobbies: boolean;
  includeSummary: boolean;
}
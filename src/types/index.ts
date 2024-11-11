export interface CVData {
  personalInfo: {
    name: string;
    title: string;
    summary: string;
  };
  skills: string[];
  experience: {
    company: string;
    role: string;
    period: string;
    highlights: string[];
  }[];
  insights: {
    strengths: string[];
    improvements: string[];
    recommendations: string[];
  };
}
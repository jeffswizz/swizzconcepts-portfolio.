export type SkillProficiency = 'Practical Experience' | 'Learning';

export type ProjectStatus = 'Production Ready' | 'Completed' | 'Active System' | 'Prototype';

export type BlueprintFeatureIcon = 'auth' | 'schema' | 'retry' | 'sync' | 'latency' | 'audit';

export interface BlueprintFeature {
  label: string;
  value: string;
  statusTag: string;
  icon: BlueprintFeatureIcon;
}

export interface BlueprintScenario {
  id: string;
  label: string;
  stackSummary: string;
  triggerSource: string;
  triggerMethod: string;
  inboundText: string;
  triggerMeta: string;
  classification: string;
  aiModel: string;
  aiActionMeta: string;
  crmTarget: string;
  crmAction: string;
  crmMeta: string;
  latencyLabel: string;
  outputJson: Record<string, string>;
  features: BlueprintFeature[];
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface ProfileData {
  brandName: string;
  fullName: string;
  title: string;
  roleLabels: string[];
  location: string;
  availabilityText: string;
  isAvailable: boolean;
  portraitUrl: string;
  email: string;
  whatsappUrl: string;
  whatsappDisplay: string;
  linkedinUrl: string;
  linkedinHandle: string;
  bookingUrl: string;
  bookingButtonLabel: string;
}

export interface SiteContentData {
  heroHeadline: string;
  heroSupportingText: string;
  aboutHeadline: string;
  aboutBioParagraphs: string[];
  aboutPillarsTitle: string;
  aboutPillarsSubtitle: string;
  aboutPillars: string[];
  timelineHeadline: string;
  servicesHeadline: string;
  servicesSubtext: string;
  projectsHeadline: string;
  projectsSubtext: string;
  skillsHeadline: string;
  skillsSubtext: string;
  credentialsHeadline: string;
  credentialsSubtext: string;
  faqHeadline: string;
  faqSubtext: string;
  contactHeadline: string;
  contactSubtext: string;
  contactFormTitle: string;
  contactFormSubtext: string;
  footerTagline: string;
}

export interface CareerMilestone {
  id: string;
  stepNumber: string;
  title: string;
  subtitle: string;
  description: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  icon: string;
  shortDescription: string;
  capabilities: string[];
  howItWorks: {
    trigger: string;
    processing: string;
    output: string;
    summary: string;
  };
}

export interface ProjectItem {
  id: string;
  title: string;
  category: string;
  status: ProjectStatus;
  overview: string;
  businessProblem: string;
  solutionImplemented: string;
  tools: string[];
  workflowSteps: string[];
  workflowExplanation: string;
  businessValue: string;
  coverImageUrl?: string;
  galleryImages?: string[];
  videoUrl?: string;
  featured?: boolean;
}

export interface SkillItem {
  id: string;
  name: string;
  proficiency: SkillProficiency;
}

export interface SkillCategory {
  id: string;
  name: string;
  items: SkillItem[];
}

export interface CredentialItem {
  id: string;
  organization: string;
  roleTitle: string;
  period: string;
  summary: string;
  highlights: string[];
  certificateTitle: string;
  certificateId: string;
  issuedDate: string;
  certificateImageUrl: string;
  linkedProjectIds: string[];
}

export interface ContactSubmission {
  id: string;
  fullName: string;
  email: string;
  company: string;
  serviceOfInterest: string;
  projectDescription: string;
  status: 'new' | 'reviewed' | 'archived';
  createdAt: string;
}

export interface PortfolioData {
  profile: ProfileData;
  siteContent: SiteContentData;
  blueprints: BlueprintScenario[];
  timeline: CareerMilestone[];
  services: ServiceItem[];
  projects: ProjectItem[];
  skillCategories: SkillCategory[];
  credentials: CredentialItem[];
  faqs: FaqItem[];
}

export interface AdminState extends PortfolioData {
  submissions: ContactSubmission[];
}

export interface AuthStatusResponse {
  configured: boolean;
  usingEnvPasscode: boolean;
  authenticated: boolean;
  role: 'admin' | null;
  email: string | null;
}

export type WorkMode = 'Presencial' | 'Híbrido' | 'Remoto';

export type ContractType =
  | 'CLT'
  | 'PJ'
  | 'Temporário'
  | 'Estágio'
  | 'Jovem Aprendiz'
  | 'Freelancer'
  | 'Autônomo';

export type JobArea =
  | 'Administrativo'
  | 'Comercial'
  | 'Financeiro'
  | 'Logística'
  | 'RH'
  | 'Tecnologia'
  | 'Produção'
  | 'Operacional'
  | 'Marketing'
  | 'Engenharia'
  | 'Saúde'
  | 'Outros';

export type DocumentRequirementLevel = 'obrigatorio' | 'opcional' | 'nao_solicitado';

export interface DocumentRequirementConfig {
  id: string;
  category: 'pessoais' | 'profissionais' | 'habilitacoes' | 'outros';
  docType: string;
  title: string;
  level: DocumentRequirementLevel;
}

export type QuestionType =
  | 'text'
  | 'long_text'
  | 'number'
  | 'date'
  | 'yes_no'
  | 'single_select'
  | 'multi_select';

export interface CustomQuestion {
  id: string;
  question: string;
  type: QuestionType;
  options?: string[];
  isEliminatory: boolean;
  expectedAnswer?: string; // e.g., 'Sim' or specific value
}

export interface Company {
  id: string;
  name: string;
  tradeName?: string;
  cnpj?: string;
  logoUrl?: string;
  city: string;
  state: string;
  description?: string;
  active: boolean;
  createdAt: string;
}

export interface Job {
  id: string;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  title: string;
  area: JobArea;
  city: string;
  state: string;
  workMode: WorkMode;
  contractType: ContractType;
  salaryMin?: number;
  salaryMax?: number;
  salaryDisclosed: boolean;
  openingsCount: number;
  description: string;
  responsibilities: string[];
  requirements: string[];
  differentials?: string[];
  benefits: string[];
  schedule?: string;
  locationDetails?: string;
  experienceLevel?: string;
  educationLevel?: string;
  status: 'aberta' | 'encerrada' | 'pausada';
  published: boolean;
  publishedAt: string;
  documentRequirements: DocumentRequirementConfig[];
  customQuestions: CustomQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface Experience {
  company: string;
  role: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
}

export interface Education {
  institution: string;
  course: string;
  level?: string;
  yearCompleted?: string;
}

export interface AIResumeExtraction {
  extractedName?: string;
  extractedCpf?: string;
  extractedPhone?: string;
  extractedEmail?: string;
  extractedCity?: string;
  experiences: Experience[];
  education: Education[];
  skills: string[];
  certifications: string[];
  languages: string[];
  summary?: string;
}

export interface Candidate {
  id: string; // candidateId (e.g., CAN-1001)
  name: string;
  cpf: string;
  birthDate: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  linkedin?: string;
  secondaryPhone?: string;
  availability?: string;
  salaryExpectation?: string;
  currentRole?: string;
  resumeUrl?: string;
  resumeFileName?: string;
  resumeFileType?: string;
  resumeFileSize?: number;
  resumeUploadedAt?: string;
  resumeExtractedData?: AIResumeExtraction;
  skills?: string[];
  bancoTalentos: boolean;
  bancoTalentosConsentAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CandidateDocument {
  id: string; // DOC-UUID
  candidateId: string;
  applicationId?: string; // Optional if tied to specific application
  category: string;
  docType: string;
  title: string;
  description?: string;
  fileUrl: string; // Base64 data or server file URL
  fileName: string;
  mimeType: string;
  fileSize: number;
  isProfileDoc: boolean;
  uploadedAt: string;
}

export type ApplicationStage =
  | 'novo_candidato'
  | 'em_analise'
  | 'triagem_rh'
  | 'entrevista'
  | 'avaliacao'
  | 'aprovado'
  | 'contratado'
  | 'reprovado'
  | 'banco_de_talentos';

export interface Application {
  id: string; // applicationId (e.g., APP-2001)
  candidateId: string;
  jobId: string;
  companyId: string;
  status: 'ativa' | 'cancelada' | 'finalizada';
  stage: ApplicationStage;
  origin: 'portal_rl_connect' | 'banco_de_talentos' | 'indicação';
  answers: Record<string, any>; // questionId -> answer
  eliminatoryFailed: boolean;
  failedQuestions?: string[];
  bancoTalentos: boolean;
  lgpdAceito: boolean;
  lgpdAceitoEm: string;
  lgpdPolicyVersion: string;
  rhRating?: number; // 1-5
  rhNotes?: string;
  aiScore?: number; // 0-100 AI fit score
  aiSummary?: string;
  assignedResponsible?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Interview {
  id: string;
  applicationId: string;
  candidateId: string;
  jobId: string;
  companyId: string;
  date: string;
  time: string;
  responsible: string;
  type: 'Presencial' | 'Google Meet' | 'Microsoft Teams' | 'Telefone' | 'Outro';
  link?: string;
  notes?: string;
  status: 'agendada' | 'concluida' | 'cancelada';
  createdAt: string;
}

export interface Note {
  id: string;
  applicationId: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface TimelineEvent {
  id: string;
  applicationId: string;
  title: string;
  description: string;
  author: string;
  timestamp: string;
}

export interface PortalSettings {
  logoUrl?: string;
  portalName: string;
  bannerTitle: string;
  bannerSubtitle: string;
  primaryColor: string;
  secondaryColor: string;
  bgImageUrl?: string;
  featuredJobIds: string[];
  footerText: string;
  whatsappContact: string;
  emailContact: string;
  linkedinUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  privacyPolicyText: string;
  termsOfUseText: string;
  seoTitle: string;
  seoDescription: string;
}

export interface CompanyUser {
  id: string;
  email: string;
  name: string;
  companyId: string;
  role: 'admin' | 'recruiter' | 'master';
}

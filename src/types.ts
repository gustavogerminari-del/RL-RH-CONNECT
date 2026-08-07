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

export interface SaaSPlan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceAnnual: number;
  maxJobs: number; // -1 for unlimited
  maxUsers: number;
  maxCandidates: number;
  features: string[];
  popular?: boolean;
  active: boolean;
  createdAt: string;
}

export type SubscriptionStatus = 'ativa' | 'pendente' | 'atrasada' | 'cancelada' | 'bloqueada';

export interface Subscription {
  id: string;
  companyId: string;
  companyName?: string;
  planId: string;
  planName: string;
  status: SubscriptionStatus;
  billingCycle: 'mensal' | 'anual';
  price: number;
  autoRenew: boolean;
  startDate: string;
  nextBillingDate: string;
  lastPaymentDate?: string;
  mercadopagoSubscriptionId?: string;
  createdAt: string;
  updatedAt: string;
}

export type InvoiceStatus = 'paga' | 'pendente' | 'cancelada' | 'falhou';
export type PaymentMethod = 'pix' | 'cartao_credito' | 'boleto';
export type NfeStatus = 'nao_emitida' | 'emitindo' | 'emitida' | 'erro';

export interface Invoice {
  id: string; // FAT-YYYYMM-XXXX
  idempotencyKey: string;
  companyId: string;
  companyName: string;
  subscriptionId: string;
  planName: string;
  amount: number;
  status: InvoiceStatus;
  paymentMethod: PaymentMethod;
  pixQrCode?: string;
  pixQrCodeBase64?: string;
  ticketUrl?: string; // Boleto
  mercadopagoPaymentId?: string;
  paidAt?: string;
  createdAt: string;
  dueDate: string;
  // NFS-e fiscal fields
  nfeStatus: NfeStatus;
  nfeNumber?: string;
  nfeKey?: string;
  nfePdfUrl?: string;
  nfeIssuedAt?: string;
  nfeErrorMessage?: string;
}

export interface MasterBuilderConfig {
  menuModules: {
    vagasPublicas: boolean;
    bancoTalentos: boolean;
    candidaturaFacil: boolean;
    triagemIa: boolean;
    agendamentoEntrevistas: boolean;
    faturamentoAuto: boolean;
    painelEmpresa: boolean;
  };
  customFields: Array<{
    id: string;
    target: 'vaga' | 'candidato' | 'empresa';
    label: string;
    type: 'text' | 'number' | 'select' | 'boolean';
    required: boolean;
    options?: string[];
  }>;
  customColors: {
    primary: string;
    secondary: string;
    accent: string;
    darkCanvas: boolean;
  };
  mercadopagoConfig: {
    enabled: boolean;
    accessToken: string;
    publicKey: string;
    sandboxMode: boolean;
    webhookSecret?: string;
    autoNfeOnPayment: boolean;
  };
  nfeProviderConfig: {
    enabled: boolean;
    providerName: 'e-Notas' | 'Focus NFe' | 'NFe.io' | 'Prefeitura Direta';
    apiKey: string;
    companyCnpj: string;
    companyMunicipalTaxId: string;
    serviceCode: string;
    environment: 'homologacao' | 'producao';
  };
}

export interface CompanyUser {
  id: string;
  email: string;
  name: string;
  companyId: string;
  role: 'master' | 'admin' | 'rh' | 'recruiter' | 'headhunter' | 'dp' | 'gestor' | 'visualizacao';
}

export interface Employee {
  id: string; // employeeId e.g. EMP-1001
  candidateId?: string; // Links back to candidate record if hired
  companyId: string;
  name: string;
  cpf: string;
  rg?: string;
  birthDate: string;
  gender?: string;
  maritalStatus?: string;
  email: string;
  phone: string;
  address?: {
    street?: string;
    number?: string;
    neighborhood?: string;
    city: string;
    state: string;
    zipCode?: string;
  };
  role: string; // Cargo e.g. Analista de Logística
  department: string; // e.g. Operações
  salary: number;
  workSchedule: string; // e.g. 44h semanais (08:00 - 17:48)
  admissionDate: string;
  contractType: ContractType;
  bankAccount?: {
    bank: string;
    agency: string;
    account: string;
    pixKey?: string;
  };
  status: 'ativo' | 'afastado' | 'ferias' | 'desligado';
  dependents?: Array<{
    name: string;
    cpf?: string;
    birthDate: string;
    relationship: string;
  }>;
  benefits?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface VacationRecord {
  id: string;
  employeeId: string;
  employeeName?: string;
  companyId: string;
  acquisitionPeriod: string; // e.g. 2025/2026
  days: number;
  startDate: string;
  endDate: string;
  status: 'programada' | 'em_andamento' | 'concluida' | 'cancelada';
  createdAt: string;
}

export interface TerminationRecord {
  id: string;
  employeeId: string;
  employeeName?: string;
  companyId: string;
  reason: string;
  resignationDate: string;
  noticePeriod: boolean;
  severancePayEstimate: number;
  status: 'pendente' | 'processado';
  createdAt: string;
}

export interface DPOccurrence {
  id: string;
  employeeId: string;
  employeeName?: string;
  companyId: string;
  type: 'advertencia' | 'suspensao' | 'afastamento_medico' | 'elogio' | 'outros';
  description: string;
  date: string;
  author: string;
  createdAt: string;
}

export interface TimeClockEntry {
  id: string;
  employeeId: string;
  employeeName?: string;
  companyId: string;
  date: string; // YYYY-MM-DD
  clockIn: string; // HH:MM
  breakOut?: string;
  breakIn?: string;
  clockOut?: string;
  totalHours: number;
  overtimeHours: number;
  overtimeRate: 50 | 100 | 140; // 50%, 100%, 140%
  status: 'normal' | 'ajuste_solicitado' | 'aprovado' | 'rejeitado';
  adjustmentReason?: string;
  createdAt: string;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  companyId: string;
  monthYear: string; // YYYY-MM
  baseSalary: number;
  additions: number;
  discounts: number;
  overtimeAmount: number;
  inssAmount: number;
  irrfAmount: number;
  netSalary: number;
  status: 'rascunho' | 'fechada' | 'paga';
  paidAt?: string;
  createdAt: string;
}

export interface BenefitItem {
  id: string;
  companyId: string;
  name: string;
  type: 'VT' | 'VR' | 'VA' | 'Saúde' | 'Odonto' | 'Combustível' | 'Assiduidade' | 'Comissão' | 'Bônus' | 'Personalizado';
  value: number;
  description?: string;
  active: boolean;
  createdAt: string;
}

export interface DocumentItem {
  id: string;
  entityType: 'candidato' | 'funcionario' | 'empresa' | 'processo';
  entityId: string;
  entityName?: string;
  companyId: string;
  category: string;
  title: string;
  fileName: string;
  fileUrl: string;
  expirationDate?: string;
  status: 'valido' | 'proximo_vencimento' | 'vencido';
  uploadedAt: string;
}

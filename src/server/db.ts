import fs from 'fs';
import path from 'path';
import {
  Company,
  Job,
  Candidate,
  Application,
  CandidateDocument,
  Interview,
  Note,
  TimelineEvent,
  PortalSettings,
  CompanyUser,
  SaaSPlan,
  Subscription,
  Invoice,
  MasterBuilderConfig,
  Employee,
  VacationRecord,
  TerminationRecord,
  DPOccurrence,
  TimeClockEntry,
  PayrollRecord,
  BenefitItem,
  DocumentItem,
  HeadhunterClient,
  HeadhunterFinancial
} from '../types.js';

interface DBData {
  companies: Company[];
  jobs: Job[];
  candidates: Candidate[];
  applications: Application[];
  documents: CandidateDocument[];
  interviews: Interview[];
  notes: Note[];
  timeline: TimelineEvent[];
  portalSettings: PortalSettings;
  companyUsers: CompanyUser[];
  saasPlans: SaaSPlan[];
  subscriptions: Subscription[];
  invoices: Invoice[];
  masterBuilderConfig: MasterBuilderConfig;
  employees: Employee[];
  vacations: VacationRecord[];
  terminations: TerminationRecord[];
  dpOccurrences: DPOccurrence[];
  timeClockEntries: TimeClockEntry[];
  payrolls: PayrollRecord[];
  benefits: BenefitItem[];
  centralDocuments: DocumentItem[];
  headhunterClients: HeadhunterClient[];
  headhunterFinancials: HeadhunterFinancial[];
}

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

const INITIAL_BUILDER_CONFIG: MasterBuilderConfig = {
  menuModules: {
    vagasPublicas: true,
    bancoTalentos: true,
    candidaturaFacil: true,
    triagemIa: true,
    agendamentoEntrevistas: true,
    faturamentoAuto: true,
    painelEmpresa: true
  },
  customFields: [
    {
      id: 'field-1',
      target: 'vaga',
      label: 'Código de Centro de Custo',
      type: 'text',
      required: false
    },
    {
      id: 'field-2',
      target: 'candidato',
      label: 'Pretensão Salarial Mínima',
      type: 'number',
      required: false
    }
  ],
  customColors: {
    primary: '#1e40af',
    secondary: '#0d9488',
    accent: '#f59e0b',
    darkCanvas: false
  },
  mercadopagoConfig: {
    enabled: true,
    accessToken: 'APP_USR-TEST-MERCADOPAGO-ACCESS-TOKEN-2026-RL-CONNECT',
    publicKey: 'APP_USR-TEST-MERCADOPAGO-PUBLIC-KEY-2026',
    sandboxMode: true,
    autoNfeOnPayment: true
  },
  nfeProviderConfig: {
    enabled: true,
    providerName: 'e-Notas',
    apiKey: 'TEST_API_KEY_ENOTAS_RLRHCONNECT_2026',
    companyCnpj: '12.345.678/0001-90',
    companyMunicipalTaxId: '99887766',
    serviceCode: '0107',
    environment: 'homologacao'
  }
};

const INITIAL_PLANS: SaaSPlan[] = [
  {
    id: 'plan-starter',
    name: 'Plano Starter',
    description: 'Ideal para pequenas empresas e escritórios que precisam divulgar poucas vagas.',
    priceMonthly: 290,
    priceAnnual: 2900,
    maxJobs: 5,
    maxUsers: 2,
    maxCandidates: 500,
    features: [
      'Até 5 Vagas Abertas Simultâneas',
      'Candidatura Fácil e Banco de Talentos',
      'Até 2 Usuários Recrutadores',
      'Atendimento via E-mail e Suporte Standard'
    ],
    popular: false,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'plan-pro',
    name: 'Plano Growth Pro',
    description: 'Para empresas em crescimento que necessitam de Inteligência Artificial e automação.',
    priceMonthly: 690,
    priceAnnual: 6900,
    maxJobs: 20,
    maxUsers: 10,
    maxCandidates: 5000,
    features: [
      'Até 20 Vagas Abertas Simultâneas',
      'IA Fit Match & Extração Automática de CVs',
      'Perguntas Eliminatórias Customizáveis',
      'Até 10 Usuários Recrutadores',
      'Suporte Prioritário WhatsApp'
    ],
    popular: true,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'plan-enterprise',
    name: 'Plano Enterprise Master',
    description: 'A solução completa para grandes corporações e consultorias de R&S.',
    priceMonthly: 1490,
    priceAnnual: 14900,
    maxJobs: -1, // Unlimited
    maxUsers: 50,
    maxCandidates: -1,
    features: [
      'Vagas e Candidatos Ilimitados',
      'IA Fit Match Avançado + Scoring Customizado',
      'Emissão Automática de NFS-e e Gestão Financeira',
      'Multiempresa e Usuários Ilimitados',
      'Gerente de Conta Dedicado e SLA Garantido'
    ],
    popular: false,
    active: true,
    createdAt: new Date().toISOString()
  }
];

const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub-comp-01',
    companyId: 'comp-01',
    companyName: 'Logística Brasil Express',
    planId: 'plan-pro',
    planName: 'Plano Growth Pro',
    status: 'ativa',
    billingCycle: 'mensal',
    price: 690,
    autoRenew: true,
    startDate: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    nextBillingDate: new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString(),
    lastPaymentDate: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sub-comp-02',
    companyId: 'comp-02',
    companyName: 'InovaTech Software & AI',
    planId: 'plan-enterprise',
    planName: 'Plano Enterprise Master',
    status: 'ativa',
    billingCycle: 'anual',
    price: 14900,
    autoRenew: true,
    startDate: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(),
    nextBillingDate: new Date(Date.now() + 300 * 24 * 3600 * 1000).toISOString(),
    lastPaymentDate: new Date(Date.now() - 65 * 24 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sub-comp-03',
    companyId: 'comp-03',
    companyName: 'Rede Saúde & Vida Hospitalar',
    planId: 'plan-starter',
    planName: 'Plano Starter',
    status: 'atrasada',
    billingCycle: 'mensal',
    price: 290,
    autoRenew: false,
    startDate: new Date(Date.now() - 40 * 24 * 3600 * 1000).toISOString(),
    nextBillingDate: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    lastPaymentDate: new Date(Date.now() - 35 * 24 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 40 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'FAT-202603-001',
    idempotencyKey: 'IDEM-FAT-202603-001-COMP01',
    companyId: 'comp-01',
    companyName: 'Logística Brasil Express',
    subscriptionId: 'sub-comp-01',
    planName: 'Plano Growth Pro',
    amount: 690,
    status: 'paga',
    paymentMethod: 'pix',
    pixQrCode: '00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-4266141740005204000053039865406690.005802BR5925RL RH CONNECT LTDA6009SAO PAULO62070503***6304D1B9',
    mercadopagoPaymentId: 'MP-PAY-998811',
    paidAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 16 * 24 * 3600 * 1000).toISOString(),
    dueDate: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
    nfeStatus: 'emitida',
    nfeNumber: 'NFS-2026-0881',
    nfeKey: '35260312345678000190560000000008811002345678',
    nfePdfUrl: 'https://exemplo.com/nfe/NFS-2026-0881.pdf',
    nfeIssuedAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'FAT-202603-002',
    idempotencyKey: 'IDEM-FAT-202603-002-COMP02',
    companyId: 'comp-02',
    companyName: 'InovaTech Software & AI',
    subscriptionId: 'sub-comp-02',
    planName: 'Plano Enterprise Master',
    amount: 14900,
    status: 'paga',
    paymentMethod: 'cartao_credito',
    mercadopagoPaymentId: 'MP-PAY-998822',
    paidAt: new Date(Date.now() - 65 * 24 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 66 * 24 * 3600 * 1000).toISOString(),
    dueDate: new Date(Date.now() - 65 * 24 * 3600 * 1000).toISOString(),
    nfeStatus: 'emitida',
    nfeNumber: 'NFS-2026-0882',
    nfeKey: '35260398765432000110560000000008821008765432',
    nfePdfUrl: 'https://exemplo.com/nfe/NFS-2026-0882.pdf',
    nfeIssuedAt: new Date(Date.now() - 65 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'FAT-202603-003',
    idempotencyKey: 'IDEM-FAT-202603-003-COMP03',
    companyId: 'comp-03',
    companyName: 'Rede Saúde & Vida Hospitalar',
    subscriptionId: 'sub-comp-03',
    planName: 'Plano Starter',
    amount: 290,
    status: 'pendente',
    paymentMethod: 'boleto',
    ticketUrl: 'https://www.mercadopago.com.br/payments/ticket/12345678/render',
    pixQrCode: '00020126580014br.gov.bcb.pix0136999e8888-e89b-12d3-a456-4266141740005204000053039865406290.005802BR5925RL RH CONNECT LTDA6009CURITIBA62070503***6304C9F2',
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    dueDate: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    nfeStatus: 'nao_emitida'
  }
];

// Initial seed data for RL RH Connect
const INITIAL_DATA: DBData = {
  saasPlans: INITIAL_PLANS,
  subscriptions: INITIAL_SUBSCRIPTIONS,
  invoices: INITIAL_INVOICES,
  masterBuilderConfig: INITIAL_BUILDER_CONFIG,
  portalSettings: {
    portalName: 'RL RH Connect',
    bannerTitle: 'Conectando talentos às melhores oportunidades',
    bannerSubtitle: 'Encontre a oportunidade ideal para alavancar sua carreira.',
    primaryColor: '#1e40af', // Deep blue
    secondaryColor: '#0d9488', // Teal accent
    logoUrl: '',
    bgImageUrl: '',
    featuredJobIds: ['job-101', 'job-103'],
    footerText: '© 2026 RL RH Connect. Todos os direitos reservados. Portal de Recrutamento & Seleção.',
    whatsappContact: '(11) 98765-4321',
    emailContact: 'contato@rlrhconnect.com.br',
    linkedinUrl: 'https://linkedin.com/company/rlrhconnect',
    facebookUrl: 'https://facebook.com/rlrhconnect',
    instagramUrl: 'https://instagram.com/rlrhconnect',
    privacyPolicyText: 'Esta política descreve como o RL RH Connect e as empresas contratantes tratam seus dados pessoais em conformidade com a LGPD (Lei 13.709/2018). Seus dados serão utilizados exclusivamente para participação em processos seletivos e, se autorizado, inclusão no Banco de Talentos.',
    termsOfUseText: 'Ao utilizar o Portal do RL RH Connect, você concorda com a veracidade das informações prestadas e o tratamento adequado para fins exclusivamente recrutatórios.',
    seoTitle: 'RL RH Connect - Portal de Vagas & Oportunidades de Emprego',
    seoDescription: 'Encontre vagas de emprego em diversas áreas no Portal do RL RH Connect. Candidatura rápida e direta.'
  },

  companyUsers: [
    {
      id: 'usr-master',
      email: 'master@rlrhconnect.com',
      name: 'Administrador Master',
      companyId: 'master',
      role: 'master'
    },
    {
      id: 'usr-comp1',
      email: 'rh@logisticabrasil.com.br',
      name: 'Mariana Silva (Logística Brasil)',
      companyId: 'comp-01',
      role: 'admin'
    },
    {
      id: 'usr-comp2',
      email: 'recrutamento@inovatech.com.br',
      name: 'Carlos Eduardo (InovaTech)',
      companyId: 'comp-02',
      role: 'recruiter'
    },
    {
      id: 'usr-comp3',
      email: 'gestao@redesaude.com.br',
      name: 'Dra. Patricia Lima (Rede Saúde)',
      companyId: 'comp-03',
      role: 'admin'
    }
  ],

  companies: [
    {
      id: 'comp-01',
      name: 'Logística Brasil Express',
      tradeName: 'Logística Brasil',
      cnpj: '12.345.678/0001-90',
      logoUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=150&auto=format&fit=crop&q=80',
      city: 'São Paulo',
      state: 'SP',
      description: 'Líder em transporte rodoviário de cargas e soluções logísticas em todo o território nacional.',
      active: true,
      modules: ['vagas', 'candidatos', 'headhunter', 'banco-de-talentos', 'agenda-entrevistas', 'contratacoes', 'relatorios', 'ia-rh'],
      createdAt: new Date().toISOString()
    },
    {
      id: 'comp-02',
      name: 'InovaTech Software & AI',
      tradeName: 'InovaTech',
      cnpj: '98.765.432/0001-10',
      logoUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=150&auto=format&fit=crop&q=80',
      city: 'Florianópolis',
      state: 'SC',
      description: 'Empresa de tecnologia especializada em desenvolvimento de software em nuvem e inteligência artificial.',
      active: true,
      modules: ['vagas', 'candidatos', 'banco-de-talentos', 'agenda-entrevistas', 'contratacoes', 'funcionarios', 'admissoes', 'ponto-digital', 'folha-de-pagamento', 'beneficios', 'ferias', 'central-documentos', 'relatorios', 'ia-rh'],
      createdAt: new Date().toISOString()
    },
    {
      id: 'comp-03',
      name: 'Rede Saúde & Vida Hospitalar',
      tradeName: 'Rede Saúde',
      cnpj: '45.678.901/0001-22',
      logoUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=150&auto=format&fit=crop&q=80',
      city: 'Curitiba',
      state: 'PR',
      description: 'Complexo hospitalar de referência focado em saúde humanizada e atendimento de alta complexidade.',
      active: true,
      modules: ['funcionarios', 'admissoes', 'ponto-digital', 'folha-de-pagamento', 'beneficios', 'ferias', 'sst', 'central-documentos', 'relatorios'],
      createdAt: new Date().toISOString()
    }
  ],

  jobs: [
    {
      id: 'job-101',
      companyId: 'comp-01',
      companyName: 'Logística Brasil Express',
      companyLogo: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=150&auto=format&fit=crop&q=80',
      title: 'Motorista Carreteiro - Rodoviário',
      area: 'Logística',
      city: 'São Paulo',
      state: 'SP',
      workMode: 'Presencial',
      contractType: 'CLT',
      salaryMin: 4500,
      salaryMax: 5800,
      salaryDisclosed: true,
      openingsCount: 5,
      description: 'Buscamos Motoristas Carreteiros experientes para atuar em rotas interestaduais com carretas baú e sider.',
      responsibilities: [
        'Condução segura de veículos pesados (carretas articuladas)',
        'Verificação diária dos itens de segurança e checklist do veículo',
        'Acompanhamento do carregamento e descarregamento de mercadorias',
        'Cumprimento da Lei do Motorista e controle de jornada de trabalho'
      ],
      requirements: [
        'Ensino Fundamental Completo',
        'CNH Categoria E com EAR (Exerce Atividade Remunerada) válido',
        'Curso MOPP (Movimentação Operacional de Produtos Perigosos) atualizado',
        'Experiência comprovada de no mínimo 2 anos em viagens rodoviárias'
      ],
      differentials: [
        'Experiência em transporte de cargas fracionadas ou perigosas',
        'Curso NR-20 e NR-35'
      ],
      benefits: [
        'Salário fixo + Diária de viagem R$ 110,00/dia',
        'Plano de Saúde e Odontológico',
        'Seguro de Vida em Grupo',
        'Vale Alimentação R$ 650/mês'
      ],
      schedule: 'Escala de viagem rodoviária (12x36 ou conforme jornada regulamentada)',
      locationDetails: 'Base de Operações: CD Anhanguera - São Paulo / SP',
      experienceLevel: 'Pleno / Sênior',
      educationLevel: 'Ensino Fundamental',
      status: 'aberta',
      published: true,
      publishedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      documentRequirements: [
        {
          id: 'doc-req-1',
          category: 'profissionais',
          docType: 'Currículo',
          title: 'Currículo Atualizado',
          level: 'obrigatorio'
        },
        {
          id: 'doc-req-2',
          category: 'habilitacoes',
          docType: 'CNH',
          title: 'Carteira Nacional de Habilitação (Cat. E)',
          level: 'obrigatorio'
        },
        {
          id: 'doc-req-3',
          category: 'habilitacoes',
          docType: 'MOPP',
          title: 'Certificado Curso MOPP',
          level: 'obrigatorio'
        },
        {
          id: 'doc-req-4',
          category: 'habilitacoes',
          docType: 'NR-20',
          title: 'Certificado NR-20 (Líquidos Inflamáveis)',
          level: 'opcional'
        }
      ],
      customQuestions: [
        {
          id: 'q-1',
          question: 'Possui CNH Categoria E com EAR ativo?',
          type: 'yes_no',
          isEliminatory: true,
          expectedAnswer: 'Sim'
        },
        {
          id: 'q-2',
          question: 'Possui curso MOPP atualizado e averbado na CNH?',
          type: 'yes_no',
          isEliminatory: true,
          expectedAnswer: 'Sim'
        },
        {
          id: 'q-3',
          question: 'Quantos anos de experiência comprovada possui em transporte rodoviário?',
          type: 'number',
          isEliminatory: false
        },
        {
          id: 'q-4',
          question: 'Possui disponibilidade para viagens de até 15 dias corridos?',
          type: 'yes_no',
          isEliminatory: false
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'job-102',
      companyId: 'comp-01',
      companyName: 'Logística Brasil Express',
      companyLogo: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=150&auto=format&fit=crop&q=80',
      title: 'Assistente Administrativo de Faturamento',
      area: 'Administrativo',
      city: 'Campinas',
      state: 'SP',
      workMode: 'Híbrido',
      contractType: 'CLT',
      salaryMin: 2800,
      salaryMax: 3400,
      salaryDisclosed: true,
      openingsCount: 2,
      description: 'Atuação na rotina de emissão de CTE, notas fiscais, controle de canhoto e liberação de manifestos de transporte.',
      responsibilities: [
        'Emissão e conferência de CTe e MDFe',
        'Atendimento a motoristas e agregados na filial',
        'Lançamento de fretes no sistema ERP da empresa',
        'Controle de canhotos de entrega e relatórios operacionais'
      ],
      requirements: [
        'Ensino Médio Completo ou Técnico em Administração/Logística',
        'Domínio do pacote Office (Excel intermediário)',
        'Experiência prévia em faturamento de transporte será um diferencial'
      ],
      differentials: ['Conhecimento no sistema SSW ou Totvs Datasul'],
      benefits: ['Vale Refeição R$ 35/dia', 'Vale Transporte / Combustível', 'Plano de Saúde Bradesco'],
      schedule: 'Segunda a Sexta das 08h às 17h48',
      locationDetails: 'Filial Campinas - Bairro Macenco',
      experienceLevel: 'Júnior / Pleno',
      educationLevel: 'Ensino Médio',
      status: 'aberta',
      published: true,
      publishedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
      documentRequirements: [
        {
          id: 'doc-req-5',
          category: 'profissionais',
          docType: 'Currículo',
          title: 'Currículo Vitae',
          level: 'obrigatorio'
        },
        {
          id: 'doc-req-6',
          category: 'profissionais',
          docType: 'Comprovante de experiência',
          title: 'Comprovante de Escolaridade ou Certificados',
          level: 'opcional'
        }
      ],
      customQuestions: [
        {
          id: 'q-5',
          question: 'Possui experiência com emissão de CTe ou notas fiscais?',
          type: 'yes_no',
          isEliminatory: false
        },
        {
          id: 'q-6',
          question: 'Qual o seu nível de domínio em Microsoft Excel?',
          type: 'single_select',
          options: ['Básico', 'Intermediário', 'Avançado'],
          isEliminatory: false
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'job-103',
      companyId: 'comp-02',
      companyName: 'InovaTech Software & AI',
      companyLogo: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=150&auto=format&fit=crop&q=80',
      title: 'Desenvolvedor Full Stack Sênior (React & Node)',
      area: 'Tecnologia',
      city: 'Florianópolis',
      state: 'SC',
      workMode: 'Remoto',
      contractType: 'PJ',
      salaryMin: 12000,
      salaryMax: 16000,
      salaryDisclosed: true,
      openingsCount: 3,
      description: 'Oportunidade 100% remota para atuar no desenvolvimento da nossa plataforma SaaS de automação com Inteligência Artificial.',
      responsibilities: [
        'Arquitetura e desenvolvimento de APIs em Node.js / TypeScript',
        'Criação de interfaces responsivas e de alta performance em React + Tailwind CSS',
        'Integração de modelos LLM e APIs de GenAI no fluxo da aplicação',
        'Code review e mentoria de desenvolvedores pleno'
      ],
      requirements: [
        'Superior em Ciência da Computação, Engenharia ou área correlata',
        'Mínimo de 5 anos de experiência com ecossistema JavaScript/TypeScript',
        'Domínio de React, Node.js, Express/Fastify e bancos relacionais/NoSQL'
      ],
      differentials: ['Experiência com Docker, Kubernetes e GCP/AWS', 'Conhecimento em Python / GenAI SDKs'],
      benefits: ['100% Trabalho Remoto', 'Flexibilidade de horário', 'Budget anual para certificações e eventos (R$ 5.000)'],
      schedule: 'Horário flexível com core hours das 10h às 16h',
      locationDetails: 'Trabalhe de qualquer lugar do Brasil',
      experienceLevel: 'Sênior',
      educationLevel: 'Ensino Superior',
      status: 'aberta',
      published: true,
      publishedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
      documentRequirements: [
        {
          id: 'doc-req-7',
          category: 'profissionais',
          docType: 'Currículo',
          title: 'Currículo em PDF',
          level: 'obrigatorio'
        },
        {
          id: 'doc-req-8',
          category: 'profissionais',
          docType: 'Portfólio',
          title: 'Portfólio ou Link do GitHub',
          level: 'opcional'
        }
      ],
      customQuestions: [
        {
          id: 'q-7',
          question: 'Possui mais de 5 anos de experiência prática com TypeScript e React?',
          type: 'yes_no',
          isEliminatory: true,
          expectedAnswer: 'Sim'
        },
        {
          id: 'q-8',
          question: 'Informe o link para o seu perfil no GitHub ou Portfólio de projetos:',
          type: 'text',
          isEliminatory: false
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'job-104',
      companyId: 'comp-03',
      companyName: 'Rede Saúde & Vida Hospitalar',
      companyLogo: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=150&auto=format&fit=crop&q=80',
      title: 'Enfermeiro(a) de UTI Adulto',
      area: 'Saúde',
      city: 'Curitiba',
      state: 'PR',
      workMode: 'Presencial',
      contractType: 'CLT',
      salaryMin: 4200,
      salaryMax: 4800,
      salaryDisclosed: true,
      openingsCount: 4,
      description: 'Atuação na Unidade de Terapia Intensiva Adulta, prestando assistência direta a pacientes críticos.',
      responsibilities: [
        'Planejamento e execução de cuidados de enfermagem intensiva',
        'Monitoramento de parâmetros hemodinâmicos e manejo de equipamentos de UTI',
        'Passagem de plantão rigorosa e registros em prontuário eletrônico'
      ],
      requirements: [
        'Graduação completa em Enfermagem',
        'Registro ativo no COREN/PR sem pendências',
        'Especialização ou Pós-Graduação em UTI / Paciente Crítico',
        'Experiência mínima de 1 ano em Unidade de Terapia Intensiva'
      ],
      differentials: ['Curso de Suporte Avançado de Vida (ACLS) válido'],
      benefits: ['Insalubridade 40%', 'Refeitório no local', 'Plano de Saúde Unimed corporativo', 'Auxílio Creche'],
      schedule: 'Escala 12x36 (Diurno ou Noturno)',
      locationDetails: 'Hospital Central - Bairro Batel - Curitiba / PR',
      experienceLevel: 'Pleno',
      educationLevel: 'Pós-Graduação',
      status: 'aberta',
      published: true,
      publishedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      documentRequirements: [
        {
          id: 'doc-req-9',
          category: 'profissionais',
          docType: 'Currículo',
          title: 'Currículo de Enfermagem',
          level: 'obrigatorio'
        },
        {
          id: 'doc-req-10',
          category: 'profissionais',
          docType: 'Registro profissional',
          title: 'Carteira do COREN/PR Ativa',
          level: 'obrigatorio'
        },
        {
          id: 'doc-req-11',
          category: 'profissionais',
          docType: 'Diploma',
          title: 'Diploma de Pós-Graduação em UTI',
          level: 'opcional'
        }
      ],
      customQuestions: [
        {
          id: 'q-9',
          question: 'Possui registro ativo no COREN/PR sem pendências?',
          type: 'yes_no',
          isEliminatory: true,
          expectedAnswer: 'Sim'
        },
        {
          id: 'q-10',
          question: 'Possui especialização em UTI ou Terapia Intensiva?',
          type: 'yes_no',
          isEliminatory: false
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],

  candidates: [
    {
      id: 'CAN-1001',
      name: 'João Antonio da Silva',
      cpf: '38291048502',
      birthDate: '1988-05-14',
      email: 'joao.silva@email.com',
      phone: '(11) 99887-6655',
      city: 'São Paulo',
      state: 'SP',
      linkedin: 'https://linkedin.com/in/joaosilva-motorista',
      availability: 'Imediata',
      salaryExpectation: 'R$ 5.200',
      currentRole: 'Motorista de Carreta',
      resumeUrl: '',
      resumeFileName: 'Curriculo_Joao_Silva_Motorista.pdf',
      resumeFileType: 'application/pdf',
      resumeFileSize: 145000,
      resumeUploadedAt: new Date().toISOString(),
      resumeExtractedData: {
        extractedName: 'João Antonio da Silva',
        extractedCpf: '382.910.485-02',
        extractedPhone: '(11) 99887-6655',
        extractedEmail: 'joao.silva@email.com',
        extractedCity: 'São Paulo / SP',
        summary: 'Motorista rodoviário profissional com 8 anos de experiência em rotas sul/sudeste. CNH E, EAR e MOPP ativos.',
        experiences: [
          {
            company: 'TransRodoviário Paulistana',
            role: 'Motorista Carreteiro',
            startDate: '2020',
            endDate: '2025',
            description: 'Transporte de cargas secas e fracionadas entre SP, RJ e PR.'
          }
        ],
        education: [
          {
            institution: 'Escola Estadual Tancredo Neves',
            course: 'Ensino Fundamental Completo',
            yearCompleted: '2004'
          }
        ],
        skills: ['CNH E', 'MOPP', 'Direção Defensiva', 'Checklist de Veículos', 'Leitura de Tacógrafo'],
        certifications: ['Curso MOPP - SEST SENAT', 'Curso Direção Econômica'],
        languages: ['Português (Nativo)']
      },
      skills: ['CNH E', 'MOPP', 'Carreta Baú', 'Sider'],
      bancoTalentos: true,
      bancoTalentosConsentAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],

  applications: [
    {
      id: 'APP-2001',
      candidateId: 'CAN-1001',
      jobId: 'job-101',
      companyId: 'comp-01',
      status: 'ativa',
      stage: 'novo_candidato',
      origin: 'portal_rl_connect',
      answers: {
        'q-1': 'Sim',
        'q-2': 'Sim',
        'q-3': '8',
        'q-4': 'Sim'
      },
      eliminatoryFailed: false,
      bancoTalentos: true,
      lgpdAceito: true,
      lgpdAceitoEm: new Date().toISOString(),
      lgpdPolicyVersion: 'v1.0-2026',
      rhRating: 5,
      rhNotes: 'Candidato com excelente perfil rodoviário e CNH E / MOPP em dia.',
      aiScore: 92,
      aiSummary: 'Candidato possui mais de 8 anos de experiência em viagens rodoviárias atende a 100% dos requisitos obrigatórios.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],

  documents: [
    {
      id: 'DOC-501',
      candidateId: 'CAN-1001',
      applicationId: 'APP-2001',
      category: 'habilitacoes',
      docType: 'CNH',
      title: 'Carteira de Habilitação Cat. E - João Silva',
      description: 'CNH com observação EAR e MOPP',
      fileUrl: 'data:application/pdf;base64,JVBERi0xLjQKJ...',
      fileName: 'cnh_e_joao_silva.pdf',
      mimeType: 'application/pdf',
      fileSize: 220000,
      isProfileDoc: true,
      uploadedAt: new Date().toISOString()
    }
  ],

  interviews: [],
  notes: [
    {
      id: 'note-1',
      applicationId: 'APP-2001',
      author: 'Mariana Silva (RH)',
      text: 'Currículo recebido via Portal de Vagas. Documentação conferida e aprovada para triagem.',
      createdAt: new Date().toISOString()
    }
  ],
  timeline: [
    {
      id: 'tl-1',
      applicationId: 'APP-2001',
      title: 'Candidatura Realizada',
      description: 'Candidato enviou a candidatura pelo Portal de Vagas RL RH Connect.',
      author: 'João Antonio da Silva',
      timestamp: new Date().toISOString()
    }
  ],
  employees: [
    {
      id: 'EMP-1001',
      candidateId: 'CAN-1001',
      companyId: 'comp-01',
      name: 'João Antonio da Silva',
      cpf: '38291048502',
      rg: '29.839.102-3',
      birthDate: '1988-05-14',
      gender: 'Masculino',
      maritalStatus: 'Casado',
      email: 'joao.silva@logisticabrasil.com.br',
      phone: '(11) 99887-6655',
      address: {
        street: 'Rua das Palmeiras',
        number: '450',
        neighborhood: 'Ipiranga',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '04200-000'
      },
      role: 'Motorista de Carreta Refris',
      department: 'Operações e Transporte',
      salary: 5200,
      workSchedule: 'Escala 44h semanais - 08:00 às 17:48',
      admissionDate: '2025-06-01',
      contractType: 'CLT',
      bankAccount: {
        bank: 'Itaú Unibanco (341)',
        agency: '0340',
        account: '12904-8',
        pixKey: '38291048502'
      },
      status: 'ativo',
      dependents: [
        { name: 'Lucas Silva', birthDate: '2016-08-20', relationship: 'Filho' }
      ],
      benefits: ['ben-1', 'ben-2', 'ben-3'],
      createdAt: '2025-06-01T08:00:00Z',
      updatedAt: '2026-08-01T08:00:00Z'
    },
    {
      id: 'EMP-1002',
      candidateId: 'CAN-1002',
      companyId: 'comp-01',
      name: 'Mariana Oliveira Costa',
      cpf: '49201938491',
      rg: '34.918.201-9',
      birthDate: '1995-11-03',
      gender: 'Feminino',
      maritalStatus: 'Solteira',
      email: 'mariana.costa@logisticabrasil.com.br',
      phone: '(11) 97766-5544',
      address: {
        street: 'Av. Paulista',
        number: '1000',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01310-100'
      },
      role: 'Analista de Operações Pleno',
      department: 'Planejamento Logístico',
      salary: 4200,
      workSchedule: '44h semanais - 08:00 às 17:48',
      admissionDate: '2025-08-15',
      contractType: 'CLT',
      bankAccount: {
        bank: 'Banco do Brasil (001)',
        agency: '1890',
        account: '88720-1',
        pixKey: 'mariana.costa@logisticabrasil.com.br'
      },
      status: 'ativo',
      benefits: ['ben-1', 'ben-2', 'ben-4'],
      createdAt: '2025-08-15T08:00:00Z',
      updatedAt: '2026-08-01T08:00:00Z'
    },
    {
      id: 'EMP-2001',
      candidateId: 'CAN-1003',
      companyId: 'comp-02',
      name: 'Carlos Eduardo Santos',
      cpf: '58291039481',
      rg: '19.283.491-0',
      birthDate: '1992-03-22',
      gender: 'Masculino',
      email: 'carlos.santos@inovatech.com.br',
      phone: '(48) 98822-1100',
      address: {
        city: 'Florianópolis',
        state: 'SC'
      },
      role: 'Desenvolvedor Full Stack Sênior',
      department: 'Engenharia de Software',
      salary: 11500,
      workSchedule: '40h semanais - Flexível Remoto',
      admissionDate: '2025-04-10',
      contractType: 'CLT',
      status: 'ativo',
      benefits: ['ben-2', 'ben-4'],
      createdAt: '2025-04-10T08:00:00Z',
      updatedAt: '2026-08-01T08:00:00Z'
    }
  ],
  vacations: [
    {
      id: 'VAC-101',
      employeeId: 'EMP-1001',
      employeeName: 'João Antonio da Silva',
      companyId: 'comp-01',
      acquisitionPeriod: '2025/2026',
      days: 30,
      startDate: '2026-09-01',
      endDate: '2026-09-30',
      status: 'programada',
      createdAt: '2026-07-10T10:00:00Z'
    }
  ],
  terminations: [],
  dpOccurrences: [
    {
      id: 'OCC-01',
      employeeId: 'EMP-1001',
      employeeName: 'João Antonio da Silva',
      companyId: 'comp-01',
      type: 'elogio',
      description: 'Reconhecimento de excelente pontualidade e zero avarias em rotas de longa distância.',
      date: '2026-07-20',
      author: 'RH - Mariana Silva',
      createdAt: '2026-07-20T14:00:00Z'
    }
  ],
  timeClockEntries: [
    {
      id: 'PONTO-101',
      employeeId: 'EMP-1001',
      employeeName: 'João Antonio da Silva',
      companyId: 'comp-01',
      date: '2026-08-06',
      clockIn: '07:55',
      breakOut: '12:00',
      breakIn: '13:00',
      clockOut: '18:30',
      totalHours: 9.5,
      overtimeHours: 0.7,
      overtimeRate: 50,
      status: 'aprovado',
      createdAt: '2026-08-06T18:30:00Z'
    },
    {
      id: 'PONTO-102',
      employeeId: 'EMP-1002',
      employeeName: 'Mariana Oliveira Costa',
      companyId: 'comp-01',
      date: '2026-08-06',
      clockIn: '08:00',
      breakOut: '12:00',
      breakIn: '13:00',
      clockOut: '17:48',
      totalHours: 8.8,
      overtimeHours: 0,
      overtimeRate: 50,
      status: 'normal',
      createdAt: '2026-08-06T17:48:00Z'
    }
  ],
  payrolls: [
    {
      id: 'FOLHA-2026-07-EMP1001',
      employeeId: 'EMP-1001',
      employeeName: 'João Antonio da Silva',
      companyId: 'comp-01',
      monthYear: '2026-07',
      baseSalary: 5200,
      additions: 450,
      discounts: 620,
      overtimeAmount: 380,
      inssAmount: 512,
      irrfAmount: 310,
      netSalary: 4588,
      status: 'paga',
      paidAt: '2026-08-05T10:00:00Z',
      createdAt: '2026-08-01T08:00:00Z'
    },
    {
      id: 'FOLHA-2026-07-EMP1002',
      employeeId: 'EMP-1002',
      employeeName: 'Mariana Oliveira Costa',
      companyId: 'comp-01',
      monthYear: '2026-07',
      baseSalary: 4200,
      additions: 200,
      discounts: 480,
      overtimeAmount: 150,
      inssAmount: 410,
      irrfAmount: 190,
      netSalary: 3470,
      status: 'paga',
      paidAt: '2026-08-05T10:00:00Z',
      createdAt: '2026-08-01T08:00:00Z'
    }
  ],
  benefits: [
    {
      id: 'ben-1',
      companyId: 'comp-01',
      name: 'Vale Refeição (VR Sodexo)',
      type: 'VR',
      value: 850,
      description: 'R$ 38,60 por dia útil sem desconto em folha.',
      active: true,
      createdAt: '2025-01-01T00:00:00Z'
    },
    {
      id: 'ben-2',
      companyId: 'comp-01',
      name: 'Plano de Saúde Bradesco Top',
      type: 'Saúde',
      value: 620,
      description: 'Acomodação em apartamento com coparticipação 10%.',
      active: true,
      createdAt: '2025-01-01T00:00:00Z'
    },
    {
      id: 'ben-3',
      companyId: 'comp-01',
      name: 'Auxílio Combustível / Frota',
      type: 'Combustível',
      value: 500,
      description: 'Cartão combustível pré-pago para rotas operacionais.',
      active: true,
      createdAt: '2025-01-01T00:00:00Z'
    },
    {
      id: 'ben-4',
      companyId: 'comp-01',
      name: 'Bônus por Assiduidade',
      type: 'Assiduidade',
      value: 300,
      description: 'Gratificação mensal para colaboradores sem faltas ou atrasos.',
      active: true,
      createdAt: '2025-01-01T00:00:00Z'
    }
  ],
  centralDocuments: [
    {
      id: 'DOC-CENTRAL-01',
      entityType: 'funcionario',
      entityId: 'EMP-1001',
      entityName: 'João Antonio da Silva',
      companyId: 'comp-01',
      category: 'admissional',
      title: 'Contrato de Trabalho CLT Assinado',
      fileName: 'Contrato_CLT_Joao_Silva.pdf',
      fileUrl: 'data:application/pdf;base64,JVBERi0xLjQK...',
      expirationDate: '2029-06-01',
      status: 'valido',
      uploadedAt: '2025-06-01T08:30:00Z'
    },
    {
      id: 'DOC-CENTRAL-02',
      entityType: 'funcionario',
      entityId: 'EMP-1001',
      entityName: 'João Antonio da Silva',
      companyId: 'comp-01',
      category: 'habilitacao',
      title: 'CNH Categoria E com EAR',
      fileName: 'CNH_Joao_Silva.pdf',
      fileUrl: 'data:application/pdf;base64,JVBERi0xLjQK...',
      expirationDate: '2026-11-20',
      status: 'proximo_vencimento',
      uploadedAt: '2025-06-01T08:35:00Z'
    }
  ],
  headhunterClients: [
    {
      id: 'CLI-1001',
      companyId: 'comp-01',
      corporateName: 'Logística Express Serviços Logísticos S.A.',
      tradeName: 'Logística Express',
      cnpj: '00.000.000/0001-00',
      email: 'contato@logisticaexpress.com.br',
      phone: '(11) 3344-5566',
      city: 'São Paulo',
      state: 'SP',
      contactName: 'Carlos Silva',
      contactEmail: 'carlos@logisticaexpress.com.br',
      contactPhone: '(11) 98877-6655',
      commercialResponsible: 'Carlos Silva',
      billingType: 'percentual_salario',
      feePercent: 200,
      fixedFee: 3500,
      paymentDeadline: '30 dias',
      status: 'ativo',
      createdAt: '2026-01-15T10:00:00Z',
      updatedAt: '2026-01-15T10:00:00Z'
    },
    {
      id: 'CLI-1002',
      companyId: 'comp-01',
      corporateName: 'Tech Solutions Indústria e Comércio Ltda.',
      tradeName: 'Tech Solutions',
      cnpj: '11.222.333/0001-99',
      email: 'financeiro@techsolutions.com.br',
      phone: '(11) 4004-9988',
      city: 'Campinas',
      state: 'SP',
      contactName: 'Mariana Santos',
      contactEmail: 'mariana@techsolutions.com.br',
      contactPhone: '(19) 99123-4567',
      commercialResponsible: 'Mariana Santos',
      billingType: 'valor_fixo',
      feePercent: 15,
      fixedFee: 3500,
      paymentDeadline: '15 dias',
      status: 'ativo',
      createdAt: '2026-02-01T10:00:00Z',
      updatedAt: '2026-02-01T10:00:00Z'
    }
  ],
  headhunterFinancials: []
};

class DBManager {
  private data: DBData;

  constructor() {
    this.data = this.loadDB();
  }

  private loadDB(): DBData {
    try {
      if (!fs.existsSync(path.dirname(DB_PATH))) {
        fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
      }
      if (fs.existsSync(DB_PATH)) {
        const fileContent = fs.readFileSync(DB_PATH, 'utf-8');
        const parsed = JSON.parse(fileContent);
        return {
          ...INITIAL_DATA,
          ...parsed
        };
      }
    } catch (e) {
      console.error('Failed to read db file, initializing with defaults', e);
    }
    this.saveDB(INITIAL_DATA);
    return INITIAL_DATA;
  }

  public saveDB(newData?: DBData): void {
    try {
      if (newData) {
        this.data = newData;
      }
      if (!fs.existsSync(path.dirname(DB_PATH))) {
        fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
      }
      fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving DB:', e);
    }
  }

  // --- GETTERS & QUERIES ---

  public getPortalSettings(): PortalSettings {
    return this.data.portalSettings;
  }

  public updatePortalSettings(settings: Partial<PortalSettings>): PortalSettings {
    this.data.portalSettings = { ...this.data.portalSettings, ...settings };
    this.saveDB();
    return this.data.portalSettings;
  }

  public getCompanies(): Company[] {
    return this.data.companies;
  }

  public getCompanyById(id: string): Company | undefined {
    return this.data.companies.find(c => c.id === id);
  }

  public getJobs(activeOnly: boolean = true, companyId?: string): Job[] {
    return this.data.jobs.filter(job => {
      if (companyId && companyId !== 'master' && job.companyId !== companyId) {
        return false;
      }
      if (activeOnly) {
        const comp = this.getCompanyById(job.companyId);
        return job.status === 'aberta' && job.published && (comp ? comp.active : true);
      }
      return true;
    });
  }

  public getJobById(id: string): Job | undefined {
    return this.data.jobs.find(j => j.id === id);
  }

  public saveJob(job: Job): Job {
    const existingIdx = this.data.jobs.findIndex(j => j.id === job.id);
    if (existingIdx >= 0) {
      this.data.jobs[existingIdx] = { ...job, updatedAt: new Date().toISOString() };
    } else {
      this.data.jobs.push(job);
    }
    this.saveDB();
    return job;
  }

  public deleteJob(id: string, companyId: string): boolean {
    const idx = this.data.jobs.findIndex(
      j => j.id === id && (companyId === 'master' || j.companyId === companyId)
    );
    if (idx >= 0) {
      this.data.jobs.splice(idx, 1);
      this.saveDB();
      return true;
    }
    return false;
  }

  // Candidates & Applications
  public findCandidateByCpf(cpf: string): Candidate | undefined {
    if (!cpf) return undefined;
    const clean = cpf.replace(/\D/g, '');
    if (!clean) return undefined;
    return this.data.candidates.find(c => c.cpf && c.cpf.replace(/\D/g, '') === clean);
  }

  public findCandidateByEmailOrPhone(email: string, phone: string, cpf?: string): Candidate | undefined {
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
    const cleanCpf = cpf ? cpf.replace(/\D/g, '') : '';

    return this.data.candidates.find(c => {
      const cCpf = c.cpf ? c.cpf.replace(/\D/g, '') : '';
      const cEmail = c.email ? c.email.trim().toLowerCase() : '';
      const cPhone = c.phone ? c.phone.replace(/\D/g, '') : '';

      if (cleanCpf && cleanCpf.length === 11 && cCpf === cleanCpf) return true;
      if (cleanEmail && cEmail === cleanEmail) return true;
      if (cleanPhone && cleanPhone.length >= 8 && cPhone === cleanPhone) return true;
      return false;
    });
  }

  public findCandidateById(id: string): Candidate | undefined {
    return this.data.candidates.find(c => c.id === id);
  }

  public saveCandidate(candidate: Candidate): Candidate {
    const idx = this.data.candidates.findIndex(c => c.id === candidate.id);
    if (idx >= 0) {
      this.data.candidates[idx] = { ...candidate, updatedAt: new Date().toISOString() };
    } else {
      this.data.candidates.push(candidate);
    }
    this.saveDB();
    return candidate;
  }

  public getCandidateApplications(candidateId: string): Application[] {
    return this.data.applications.filter(a => a.candidateId === candidateId);
  }

  public findActiveApplication(candidateId: string, jobId: string): Application | undefined {
    return this.data.applications.find(
      a => a.candidateId === candidateId && a.jobId === jobId && a.status === 'ativa'
    );
  }

  public getApplicationsByJob(jobId: string, companyId: string): Application[] {
    return this.data.applications.filter(a => {
      if (a.jobId !== jobId) return false;
      if (companyId !== 'master' && a.companyId !== companyId) return false;
      return true;
    });
  }

  public getApplicationsByCompany(companyId: string): Application[] {
    return this.data.applications.filter(a => {
      if (companyId !== 'master' && a.companyId !== companyId) return false;
      return true;
    });
  }

  public getApplicationById(id: string): Application | undefined {
    return this.data.applications.find(a => a.id === id);
  }

  public saveApplication(app: Application): Application {
    const idx = this.data.applications.findIndex(a => a.id === app.id);
    if (idx >= 0) {
      this.data.applications[idx] = { ...app, updatedAt: new Date().toISOString() };
    } else {
      this.data.applications.push(app);
    }
    this.saveDB();
    return app;
  }

  // Documents
  public saveDocument(doc: CandidateDocument): CandidateDocument {
    const idx = this.data.documents.findIndex(d => d.id === doc.id);
    if (idx >= 0) {
      this.data.documents[idx] = doc;
    } else {
      this.data.documents.push(doc);
    }
    this.saveDB();
    return doc;
  }

  public getCandidateDocuments(candidateId: string, companyId?: string): CandidateDocument[] {
    return this.data.documents.filter(d => {
      if (d.candidateId !== candidateId) return false;
      // If companyId restricted, check if associated application belongs to company
      if (companyId && companyId !== 'master' && d.applicationId) {
        const app = this.getApplicationById(d.applicationId);
        if (app && app.companyId !== companyId) return false;
      }
      return true;
    });
  }

  // Interviews
  public getInterviews(companyId?: string, jobId?: string): Interview[] {
    return this.data.interviews.filter(i => {
      if (companyId && companyId !== 'master' && i.companyId !== companyId) return false;
      if (jobId && i.jobId !== jobId) return false;
      return true;
    });
  }

  public saveInterview(interview: Interview): Interview {
    const idx = this.data.interviews.findIndex(i => i.id === interview.id);
    if (idx >= 0) {
      this.data.interviews[idx] = interview;
    } else {
      this.data.interviews.push(interview);
    }
    this.saveDB();
    return interview;
  }

  // Notes & Timeline
  public getNotes(applicationId: string): Note[] {
    return this.data.notes.filter(n => n.applicationId === applicationId);
  }

  public addNote(note: Note): Note {
    this.data.notes.push(note);
    this.saveDB();
    return note;
  }

  public getTimeline(applicationId: string): TimelineEvent[] {
    return this.data.timeline.filter(t => t.applicationId === applicationId);
  }

  public addTimelineEvent(evt: TimelineEvent): TimelineEvent {
    this.data.timeline.push(evt);
    this.saveDB();
    return evt;
  }

  public getTalentBankCandidates(companyId?: string): Candidate[] {
    return this.data.candidates.filter(c => c.bancoTalentos !== false);
  }

  public getCompanyUsers(): CompanyUser[] {
    return this.data.companyUsers;
  }

  public authenticateUser(email: string, password?: string): CompanyUser | undefined {
    const user = this.data.companyUsers.find(
      u => u.email.toLowerCase().trim() === email.toLowerCase().trim()
    );
    if (!user) return undefined;
    if (user.password && password && user.password !== password) {
      return undefined;
    }
    return user;
  }

  public saveCompanyUser(user: CompanyUser): CompanyUser {
    if (!this.data.companyUsers) this.data.companyUsers = [];
    const idx = this.data.companyUsers.findIndex(u => u.id === user.id);
    if (idx >= 0) {
      this.data.companyUsers[idx] = user;
    } else {
      this.data.companyUsers.push(user);
    }
    this.saveDB();
    return user;
  }

  // --- SAAS PLANS & CONSTRUTOR MASTER ---
  public getSaaSPlans(): SaaSPlan[] {
    return this.data.saasPlans || [];
  }

  public saveSaaSPlan(plan: SaaSPlan): SaaSPlan {
    if (!this.data.saasPlans) this.data.saasPlans = [];
    const idx = this.data.saasPlans.findIndex(p => p.id === plan.id);
    if (idx >= 0) {
      this.data.saasPlans[idx] = plan;
    } else {
      this.data.saasPlans.push(plan);
    }
    this.saveDB();
    return plan;
  }

  public getMasterBuilderConfig(): MasterBuilderConfig {
    return this.data.masterBuilderConfig || INITIAL_BUILDER_CONFIG;
  }

  public updateMasterBuilderConfig(config: Partial<MasterBuilderConfig>): MasterBuilderConfig {
    this.data.masterBuilderConfig = {
      ...this.getMasterBuilderConfig(),
      ...config
    };
    this.saveDB();
    return this.data.masterBuilderConfig;
  }

  // --- SUBSCRIPTIONS ---
  public getSubscriptions(): Subscription[] {
    return this.data.subscriptions || [];
  }

  public getSubscriptionByCompany(companyId: string): Subscription | undefined {
    return (this.data.subscriptions || []).find(s => s.companyId === companyId);
  }

  public saveSubscription(sub: Subscription): Subscription {
    if (!this.data.subscriptions) this.data.subscriptions = [];
    const idx = this.data.subscriptions.findIndex(s => s.id === sub.id || s.companyId === sub.companyId);
    if (idx >= 0) {
      this.data.subscriptions[idx] = { ...sub, updatedAt: new Date().toISOString() };
    } else {
      this.data.subscriptions.push(sub);
    }
    this.saveDB();
    return sub;
  }

  // --- INVOICES & FISCAL NFS-e ENGINE ---
  public getInvoices(companyId?: string): Invoice[] {
    const invoices = this.data.invoices || [];
    if (companyId && companyId !== 'master') {
      return invoices.filter(i => i.companyId === companyId);
    }
    return invoices;
  }

  public getInvoiceById(id: string): Invoice | undefined {
    return (this.data.invoices || []).find(i => i.id === id);
  }

  public saveInvoice(invoice: Invoice): Invoice {
    if (!this.data.invoices) this.data.invoices = [];
    const idx = this.data.invoices.findIndex(i => i.id === invoice.id);
    if (idx >= 0) {
      this.data.invoices[idx] = invoice;
    } else {
      this.data.invoices.push(invoice);
    }
    this.saveDB();
    return invoice;
  }

  /**
   * Idempotent NFS-e Issuer: Guarantees that a fiscal note is never issued twice for the same invoice/idempotencyKey.
   */
  public issueNfeForInvoice(invoiceId: string): { success: boolean; invoice?: Invoice; error?: string } {
    const inv = this.getInvoiceById(invoiceId);
    if (!inv) {
      return { success: false, error: 'Fatura não encontrada.' };
    }

    // Check Idempotency: Never issue duplicate!
    if (inv.nfeStatus === 'emitida') {
      return {
        success: true,
        invoice: inv,
        error: 'Nota fiscal já emitida anteriormente para esta fatura (verificação de idempotência ok).'
      };
    }

    if (inv.status !== 'paga') {
      return { success: false, error: 'Somente faturas pagas podem emitir Nota Fiscal de Serviço.' };
    }

    // Issue NFS-e on backend
    const randomNfeNum = Math.floor(1000 + Math.random() * 9000);
    const nfeNumber = `NFS-2026-${randomNfeNum}`;
    const nfeKey = `352603${inv.companyId.replace(/\D/g, '').padEnd(14, '0')}5600000000${randomNfeNum}1001234567`;

    inv.nfeStatus = 'emitida';
    inv.nfeNumber = nfeNumber;
    inv.nfeKey = nfeKey;
    inv.nfePdfUrl = `https://exemplo.com/nfe/${nfeNumber}.pdf`;
    inv.nfeIssuedAt = new Date().toISOString();

    this.saveInvoice(inv);

    return { success: true, invoice: inv };
  }

  /**
   * Mercado Pago Webhook Handler: Backend execution for payment confirmation & auto NFS-e trigger.
   */
  public handleMercadoPagoWebhook(payload: any): { success: boolean; message: string; invoice?: Invoice } {
    const { action, type, data } = payload;
    const paymentId = data?.id || payload.id;

    if (!paymentId) {
      return { success: false, message: 'ID de pagamento ausente no payload.' };
    }

    let inv = (this.data.invoices || []).find(i => i.mercadopagoPaymentId === String(paymentId));

    if (!inv && payload.external_reference) {
      inv = (this.data.invoices || []).find(i => i.id === payload.external_reference);
    }

    if (!inv) {
      inv = (this.data.invoices || []).find(i => i.status === 'pendente');
    }

    if (inv) {
      inv.status = 'paga';
      inv.mercadopagoPaymentId = String(paymentId);
      inv.paidAt = new Date().toISOString();
      this.saveInvoice(inv);

      const sub = this.getSubscriptionByCompany(inv.companyId);
      if (sub) {
        sub.status = 'ativa';
        sub.lastPaymentDate = new Date().toISOString();
        sub.nextBillingDate = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
        this.saveSubscription(sub);
      }

      const config = this.getMasterBuilderConfig();
      if (config.mercadopagoConfig.autoNfeOnPayment) {
        this.issueNfeForInvoice(inv.id);
      }

      return {
        success: true,
        message: `Pagamento ${paymentId} confirmado com sucesso. Fatura ${inv.id} liquidada e NFS-e processada.`,
        invoice: inv
      };
    }

    return { success: true, message: `Webhook recebido para pagamento ${paymentId}, nenhuma fatura alterada.` };
  }

  // Company Status & Save
  public saveCompany(company: Company): Company {
    const idx = this.data.companies.findIndex(c => c.id === company.id);
    if (idx >= 0) {
      this.data.companies[idx] = company;
    } else {
      this.data.companies.push(company);
    }
    this.saveDB();
    return company;
  }

  public toggleCompanyActiveStatus(companyId: string, active: boolean): Company | undefined {
    const comp = this.getCompanyById(companyId);
    if (comp) {
      comp.active = active;
      this.saveCompany(comp);

      const sub = this.getSubscriptionByCompany(companyId);
      if (sub) {
        sub.status = active ? 'ativa' : 'bloqueada';
        this.saveSubscription(sub);
      }
    }
    return comp;
  }

  public getSystemMetrics() {
    const openJobs = this.getJobs(true);
    const hiringCompanies = new Set(openJobs.map(j => j.companyId)).size;
    const totalApplications = this.data.applications.length;
    const totalCandidates = this.data.candidates.length;

    return {
      availableJobsCount: openJobs.length,
      hiringCompaniesCount: hiringCompanies,
      totalApplications,
      totalCandidates
    };
  }

  // --- 7. FUNCIONÁRIOS (CADASTRO CENTRAL DE COLABORADOR) ---
  public getEmployees(companyId?: string): Employee[] {
    const list = this.data.employees || [];
    if (!companyId || companyId === 'master') return list;
    return list.filter(e => e.companyId === companyId);
  }

  public getEmployeeById(id: string): Employee | undefined {
    return (this.data.employees || []).find(e => e.id === id);
  }

  public saveEmployee(emp: Employee): Employee {
    if (!this.data.employees) this.data.employees = [];
    const idx = this.data.employees.findIndex(e => e.id === emp.id);
    if (idx >= 0) {
      this.data.employees[idx] = emp;
    } else {
      this.data.employees.push(emp);
    }
    this.saveDB();
    return emp;
  }

  // AUTOMATIC FLOW: When a candidate is hired, automatically move all other unselected candidates for that job to Banco de Talentos
  private autoMoveOtherCandidatesToTalentBank(jobId: string, hiredApplicationId: string): void {
    if (!jobId) return;
    const otherApps = (this.data.applications || []).filter(
      a => a.jobId === jobId && a.id !== hiredApplicationId
    );

    otherApps.forEach(a => {
      const stageStr = String(a.stage || '').toLowerCase();
      if (!stageStr.includes('contratad') && !stageStr.includes('banco')) {
        a.stage = 'banco_de_talentos' as any;
        a.status = 'finalizada';
        a.updatedAt = new Date().toISOString();
        this.saveApplication(a);

        const candidate = this.findCandidateById(a.candidateId);
        if (candidate) {
          candidate.bancoTalentos = true;
          this.saveCandidate(candidate);
        }

        this.addTimelineEvent({
          id: `tl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          applicationId: a.id,
          title: 'Redirecionado ao Banco de Talentos',
          description: 'Processo encerrado devido à contratação de outro candidato para a vaga. Perfil mantido no Banco de Talentos.',
          author: 'Sistema ATS',
          timestamp: new Date().toISOString()
        });
      }
    });
  }

  // REGRAS DE INTEGRAÇÃO: Contratação de Candidato -> Promove para Funcionário no DP (Sem duplicidade)
  public hireCandidateToEmployee(applicationId: string, customAdmissionData?: Partial<Employee>): { success: boolean; employee?: Employee; message: string } {
    const app = this.data.applications.find(a => a.id === applicationId);
    if (!app) return { success: false, message: 'Candidatura não encontrada.' };

    const candidate = this.findCandidateById(app.candidateId);
    if (!candidate) return { success: false, message: 'Candidato não encontrado.' };

    const job = this.getJobById(app.jobId);

    // Update application stage to contratado
    app.stage = 'contratado';
    app.updatedAt = new Date().toISOString();
    this.saveApplication(app);

    // Auto-move unselected candidates to Talent Bank
    if (app.jobId) {
      this.autoMoveOtherCandidatesToTalentBank(app.jobId, app.id);
    }

    // Check if candidate is already registered as an employee for this company
    let employee = (this.data.employees || []).find(e => e.cpf === candidate.cpf && e.companyId === app.companyId);

    if (!employee) {
      const newEmpId = `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
      employee = {
        id: newEmpId,
        candidateId: candidate.id,
        companyId: app.companyId,
        name: candidate.name,
        cpf: candidate.cpf,
        birthDate: candidate.birthDate,
        email: candidate.email,
        phone: candidate.phone,
        address: {
          city: candidate.city,
          state: candidate.state
        },
        role: job ? job.title : 'Colaborador',
        department: job ? job.area : 'Geral',
        salary: job && job.salaryMin ? job.salaryMin : 3500,
        workSchedule: job && job.schedule ? job.schedule : '44h semanais CLT',
        admissionDate: new Date().toISOString().slice(0, 10),
        contractType: job ? job.contractType : 'CLT',
        status: 'ativo',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...customAdmissionData
      };
      this.saveEmployee(employee);
    } else {
      employee.status = 'ativo';
      if (job) employee.role = job.title;
      this.saveEmployee(employee);
    }

    // Add timeline event
    this.addTimelineEvent({
      id: `tl-${Date.now()}`,
      applicationId: app.id,
      title: 'Candidato Contratado',
      description: `Candidato ${candidate.name} foi aprovado e contratado com sucesso! Promovido ao cadastro de Funcionários no Departamento Pessoal (ID: ${employee.id}).`,
      author: 'Sistema ATS -> DP Integration',
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      employee,
      message: `Candidato ${candidate.name} contratado com sucesso! Registro criado/atualizado no cadastro central de Funcionários.`
    };
  }

  // --- 8. DEPARTAMENTO PESSOAL (FÉRIAS, RESCISÃO, OCORRÊNCIAS) ---
  public getVacations(companyId?: string): VacationRecord[] {
    const list = this.data.vacations || [];
    if (!companyId || companyId === 'master') return list;
    return list.filter(v => v.companyId === companyId);
  }

  public saveVacation(vacation: VacationRecord): VacationRecord {
    if (!this.data.vacations) this.data.vacations = [];
    const idx = this.data.vacations.findIndex(v => v.id === vacation.id);
    if (idx >= 0) {
      this.data.vacations[idx] = vacation;
    } else {
      this.data.vacations.push(vacation);
    }
    this.saveDB();
    return vacation;
  }

  public getTerminations(companyId?: string): TerminationRecord[] {
    const list = this.data.terminations || [];
    if (!companyId || companyId === 'master') return list;
    return list.filter(t => t.companyId === companyId);
  }

  public saveTermination(term: TerminationRecord): TerminationRecord {
    if (!this.data.terminations) this.data.terminations = [];
    const idx = this.data.terminations.findIndex(t => t.id === term.id);
    if (idx >= 0) {
      this.data.terminations[idx] = term;
    } else {
      this.data.terminations.push(term);
    }
    // Update employee status to desligado
    const emp = this.getEmployeeById(term.employeeId);
    if (emp) {
      emp.status = 'desligado';
      this.saveEmployee(emp);
    }
    this.saveDB();
    return term;
  }

  public getDPOccurrences(companyId?: string): DPOccurrence[] {
    const list = this.data.dpOccurrences || [];
    if (!companyId || companyId === 'master') return list;
    return list.filter(o => o.companyId === companyId);
  }

  public saveDPOccurrence(occ: DPOccurrence): DPOccurrence {
    if (!this.data.dpOccurrences) this.data.dpOccurrences = [];
    const idx = this.data.dpOccurrences.findIndex(o => o.id === occ.id);
    if (idx >= 0) {
      this.data.dpOccurrences[idx] = occ;
    } else {
      this.data.dpOccurrences.push(occ);
    }
    this.saveDB();
    return occ;
  }

  // --- 9. PONTO DIGITAL (BATIMENTO, AJUSTES, BANCO DE HORAS, HE 50/100/140) ---
  public getTimeClockEntries(companyId?: string, employeeId?: string): TimeClockEntry[] {
    let list = this.data.timeClockEntries || [];
    if (companyId && companyId !== 'master') {
      list = list.filter(p => p.companyId === companyId);
    }
    if (employeeId) {
      list = list.filter(p => p.employeeId === employeeId);
    }
    return list;
  }

  public saveTimeClockEntry(entry: TimeClockEntry): TimeClockEntry {
    if (!this.data.timeClockEntries) this.data.timeClockEntries = [];
    const idx = this.data.timeClockEntries.findIndex(p => p.id === entry.id);
    if (idx >= 0) {
      this.data.timeClockEntries[idx] = entry;
    } else {
      this.data.timeClockEntries.push(entry);
    }
    this.saveDB();
    return entry;
  }

  // --- 10. FOLHA DE PAGAMENTO ---
  public getPayrolls(companyId?: string, monthYear?: string): PayrollRecord[] {
    let list = this.data.payrolls || [];
    if (companyId && companyId !== 'master') {
      list = list.filter(p => p.companyId === companyId);
    }
    if (monthYear) {
      list = list.filter(p => p.monthYear === monthYear);
    }
    return list;
  }

  public calculateAndGeneratePayroll(companyId: string, monthYear: string): PayrollRecord[] {
    const employees = this.getEmployees(companyId).filter(e => e.status === 'ativo' || e.status === 'ferias');
    const timeClock = this.getTimeClockEntries(companyId);

    const createdPayrolls: PayrollRecord[] = [];

    employees.forEach(emp => {
      // Calculate OT from timeclock for this month
      const empPonto = timeClock.filter(p => p.employeeId === emp.id && p.date.startsWith(monthYear));
      let overtimeHours50 = 0;
      let overtimeHours100 = 0;
      let overtimeHours140 = 0;

      empPonto.forEach(p => {
        if (p.overtimeHours > 0) {
          if (p.overtimeRate === 50) overtimeHours50 += p.overtimeHours;
          else if (p.overtimeRate === 100) overtimeHours100 += p.overtimeHours;
          else if (p.overtimeRate === 140) overtimeHours140 += p.overtimeHours;
        }
      });

      const hourlyRate = (emp.salary || 3000) / 220;
      const otAmount =
        overtimeHours50 * hourlyRate * 1.5 +
        overtimeHours100 * hourlyRate * 2.0 +
        overtimeHours140 * hourlyRate * 2.4;

      const baseSalary = emp.salary || 3000;
      const additions = Math.round(otAmount);
      const inssAmount = Math.round(baseSalary * 0.11);
      const irrfAmount = Math.round(baseSalary > 4000 ? (baseSalary - inssAmount) * 0.15 : 0);
      const discounts = inssAmount + irrfAmount;
      const netSalary = baseSalary + additions - discounts;

      const payroll: PayrollRecord = {
        id: `FOLHA-${monthYear}-${emp.id}`,
        employeeId: emp.id,
        employeeName: emp.name,
        companyId: emp.companyId,
        monthYear,
        baseSalary,
        additions,
        discounts,
        overtimeAmount: Math.round(otAmount),
        inssAmount,
        irrfAmount,
        netSalary,
        status: 'rascunho',
        createdAt: new Date().toISOString()
      };

      if (!this.data.payrolls) this.data.payrolls = [];
      const idx = this.data.payrolls.findIndex(p => p.id === payroll.id);
      if (idx >= 0) this.data.payrolls[idx] = payroll;
      else this.data.payrolls.push(payroll);

      createdPayrolls.push(payroll);
    });

    this.saveDB();
    return createdPayrolls;
  }

  // --- 11. BENEFÍCIOS ---
  public getBenefits(companyId?: string): BenefitItem[] {
    const list = this.data.benefits || [];
    if (!companyId || companyId === 'master') return list;
    return list.filter(b => b.companyId === companyId);
  }

  public saveBenefit(benefit: BenefitItem): BenefitItem {
    if (!this.data.benefits) this.data.benefits = [];
    const idx = this.data.benefits.findIndex(b => b.id === benefit.id);
    if (idx >= 0) {
      this.data.benefits[idx] = benefit;
    } else {
      this.data.benefits.push(benefit);
    }
    this.saveDB();
    return benefit;
  }

  // --- 12. DOCUMENTOS CENTRAIS ---
  public getCentralDocuments(companyId?: string, entityType?: string, entityId?: string): DocumentItem[] {
    let list = this.data.centralDocuments || [];
    if (companyId && companyId !== 'master') {
      list = list.filter(d => d.companyId === companyId);
    }
    if (entityType) {
      list = list.filter(d => d.entityType === entityType);
    }
    if (entityId) {
      list = list.filter(d => d.entityId === entityId);
    }
    return list;
  }

  public saveCentralDocument(doc: DocumentItem): DocumentItem {
    if (!this.data.centralDocuments) this.data.centralDocuments = [];
    const idx = this.data.centralDocuments.findIndex(d => d.id === doc.id);
    if (idx >= 0) {
      this.data.centralDocuments[idx] = doc;
    } else {
      this.data.centralDocuments.push(doc);
    }
    this.saveDB();
    return doc;
  }

  // --- 1. DASHBOARD COMPLETO DAS EMPRESAS ---
  public getCompanyDashboardMetrics(companyId: string) {
    const emp = this.getEmployees(companyId);
    const jobs = this.getJobs(false, companyId);
    const apps = this.getApplicationsByCompany(companyId);
    const interviews = this.getInterviews(companyId);
    const vacations = this.getVacations(companyId);
    const point = this.getTimeClockEntries(companyId);
    const payrolls = this.getPayrolls(companyId);
    const benefits = this.getBenefits(companyId);
    const hhClients = this.getHeadhunterClients(companyId);
    const hhFinancials = this.getHeadhunterFinancials(companyId);

    const activeEmployees = emp.filter(e => e.status === 'ativo').length;
    const openJobs = jobs.filter(j => j.status === 'aberta' && j.origin === 'vaga_interna').length;
    const clientJobsCount = jobs.filter(j => j.status === 'aberta' && (j.origin === 'recrutamento_cliente' || j.origin === 'headhunter')).length;
    const totalCandidates = apps.length;
    const pendingInterviews = interviews.filter(i => i.status === 'agendada').length;
    const scheduledVacations = vacations.filter(v => v.status === 'programada' || v.status === 'em_andamento').length;

    const totalPayrollAmount = payrolls.reduce((acc, p) => acc + (p.netSalary || 0), 0);

    const toInvoiceAmount = hhFinancials
      .filter(f => f.status === 'A faturar')
      .reduce((acc, f) => acc + (f.feeAmount || 0), 0);

    const toReceiveAmount = hhFinancials
      .filter(f => f.status === 'Cobrança gerada' || f.status === 'Aguardando pagamento' || f.status === 'Pago')
      .reduce((acc, f) => acc + (f.feeAmount || 0), 0);

    const activeClients = hhClients.filter(c => c.status === 'ativo').length;

    return {
      activeEmployees,
      openJobs: jobs.filter(j => j.status === 'aberta').length,
      internalOpenJobs: openJobs,
      clientJobsCount,
      activeClients,
      totalCandidates,
      pendingInterviews,
      scheduledVacations,
      pointEntriesToday: point.length,
      totalPayrollAmount,
      totalBenefitsCount: benefits.length,
      toInvoiceAmount,
      toReceiveAmount,
      headhunterHiredMonth: hhFinancials.length,
      alerts: [
        scheduledVacations > 0 ? `${scheduledVacations} colaboradores com férias programadas/em andamento.` : null,
        pendingInterviews > 0 ? `${pendingInterviews} entrevistas agendadas na fila.` : null,
        openJobs > 0 ? `${openJobs} vagas abertas com candidaturas em triagem.` : null
      ].filter(Boolean)
    };
  }

  // --- 13. HEADHUNTER CLIENTS & FINANCIAL ---
  public getHeadhunterClients(companyId?: string): HeadhunterClient[] {
    const list = this.data.headhunterClients || [];
    if (!companyId || companyId === 'master') return list;
    return list.filter(c => c.companyId === companyId);
  }

  public getHeadhunterClientById(id: string): HeadhunterClient | undefined {
    return (this.data.headhunterClients || []).find(c => c.id === id);
  }

  public saveHeadhunterClient(client: HeadhunterClient): HeadhunterClient {
    if (!this.data.headhunterClients) this.data.headhunterClients = [];
    const idx = this.data.headhunterClients.findIndex(c => c.id === client.id);
    if (idx >= 0) {
      this.data.headhunterClients[idx] = { ...client, updatedAt: new Date().toISOString() };
    } else {
      this.data.headhunterClients.push(client);
    }
    this.saveDB();
    return client;
  }

  public deleteHeadhunterClient(id: string, companyId: string): boolean {
    if (!this.data.headhunterClients) return false;
    const idx = this.data.headhunterClients.findIndex(
      c => c.id === id && (companyId === 'master' || c.companyId === companyId)
    );
    if (idx >= 0) {
      this.data.headhunterClients.splice(idx, 1);
      this.saveDB();
      return true;
    }
    return false;
  }

  public getHeadhunterFinancials(companyId?: string): HeadhunterFinancial[] {
    const list = this.data.headhunterFinancials || [];
    if (!companyId || companyId === 'master') return list;
    return list.filter(f => f.companyId === companyId);
  }

  public getHeadhunterFinancialById(id: string): HeadhunterFinancial | undefined {
    return (this.data.headhunterFinancials || []).find(f => f.id === id);
  }

  public saveHeadhunterFinancial(fin: HeadhunterFinancial): HeadhunterFinancial {
    if (!this.data.headhunterFinancials) this.data.headhunterFinancials = [];
    const idx = this.data.headhunterFinancials.findIndex(f => f.id === fin.id);
    if (idx >= 0) {
      this.data.headhunterFinancials[idx] = { ...fin, updatedAt: new Date().toISOString() };
    } else {
      this.data.headhunterFinancials.push(fin);
    }
    this.saveDB();
    return fin;
  }

  public hireHeadhunterCandidate(
    applicationId: string,
    recruiterUser?: { id?: string; name?: string },
    payload?: {
      clientId?: string;
      clientName?: string;
      salary?: number;
      headhunterFee?: number;
      billingRule?: string;
      feePercent?: number;
      commercialResponsible?: string;
      closingDate?: string;
      notes?: string;
      companyId?: string;
    }
  ): { success: boolean; financial?: HeadhunterFinancial; message: string } {
    const app = this.data.applications.find(a => a.id === applicationId);
    if (!app) return { success: false, message: 'Candidatura não encontrada.' };

    const candidate = this.findCandidateById(app.candidateId);
    if (!candidate) return { success: false, message: 'Candidato não encontrado.' };

    const job = this.getJobById(app.jobId);
    if (!job) return { success: false, message: 'Vaga não encontrada.' };

    // Prevent Duplication: Check if financial record already exists for this applicationId
    const existingFin = (this.data.headhunterFinancials || []).find(f => f.applicationId === applicationId);
    if (existingFin) {
      return {
        success: false,
        message: 'Esta contratação já possui um lançamento no Financeiro Headhunter.'
      };
    }

    // Determine Client
    let client = payload?.clientId ? this.getHeadhunterClientById(payload.clientId) : undefined;
    if (!client && job.clientId) {
      client = this.getHeadhunterClientById(job.clientId);
    }

    const clientId = payload?.clientId || client?.id || job.clientId;
    if (!clientId) {
      return {
        success: false,
        message: 'Selecione o Cliente Corporativo responsável por esta contratação.'
      };
    }

    const clientName = payload?.clientName || client?.tradeName || client?.corporateName || job.clientName || 'Cliente Headhunter';

    // Update application stage
    app.stage = 'contratado';
    app.status = 'finalizada';
    app.updatedAt = new Date().toISOString();
    this.saveApplication(app);

    // Auto-move unselected candidates to Talent Bank
    if (app.jobId) {
      this.autoMoveOtherCandidatesToTalentBank(app.jobId, app.id);
    }

    const salary = payload?.salary ?? job.salaryMin ?? 6500;
    const feePercent = payload?.feePercent ?? client?.feePercent ?? 100;
    const fixedFee = client?.fixedFee ?? 3500;
    const billingType = (payload?.billingRule || client?.billingType || 'percentual_salario') as 'percentual_salario' | 'valor_fixo' | 'percentual_anual' | 'manual';

    let feeAmount = payload?.headhunterFee;
    if (feeAmount === undefined || feeAmount === null) {
      if (billingType === 'percentual_salario') {
        feeAmount = Math.round((salary * feePercent) / 100);
      } else if (billingType === 'valor_fixo') {
        feeAmount = fixedFee;
      } else if (billingType === 'percentual_anual') {
        feeAmount = Math.round((salary * 12 * feePercent) / 100);
      } else {
        feeAmount = 4000;
      }
    }

    let formulaStr = '';
    if (billingType === 'percentual_salario') {
      formulaStr = `${feePercent}% sobre salário mensal (R$ ${salary.toLocaleString('pt-BR')})`;
    } else if (billingType === 'valor_fixo') {
      formulaStr = `Valor fixo de R$ ${fixedFee.toLocaleString('pt-BR')}`;
    } else if (billingType === 'percentual_anual') {
      formulaStr = `${feePercent}% sobre salário anual (R$ ${salary.toLocaleString('pt-BR')})`;
    } else {
      formulaStr = `Valor de honorários negociado: R$ ${feeAmount.toLocaleString('pt-BR')}`;
    }

    // Calculate due date (default 30 days from now)
    const dueDays = parseInt((client?.paymentDeadline || '30').replace(/\D/g, '')) || 30;
    const dueDateObj = new Date(Date.now() + dueDays * 24 * 3600 * 1000);
    const dueDateStr = dueDateObj.toISOString().slice(0, 10);

    const contractDate = payload?.closingDate || new Date().toISOString().slice(0, 10);

    const newFin: HeadhunterFinancial = {
      id: `FIN-${Math.floor(1000 + Math.random() * 9000)}`,
      companyId: payload?.companyId || app.companyId,
      applicationId: app.id,
      candidateId: candidate.id,
      candidateName: candidate.name,
      candidateCpf: candidate.cpf,
      candidateEmail: candidate.email,
      candidatePhone: candidate.phone,
      jobId: job.id,
      jobTitle: job.title,
      clientId,
      clientName,
      recruiterId: recruiterUser?.id || job.recruiterId || 'rec-1',
      recruiterName: recruiterUser?.name || job.recruiterName || 'Recrutador Responsável',
      contractDate,
      baseSalary: salary,
      billingType,
      feePercent,
      feeAmount,
      calculationFormula: formulaStr,
      dueDate: dueDateStr,
      status: 'A faturar',
      commercialResponsible: payload?.commercialResponsible || client?.commercialResponsible || job.commercialResponsible || 'Gestor Comercial',
      history: [
        {
          date: new Date().toISOString(),
          action: 'Contratação Headhunter Registrada',
          user: recruiterUser?.name || 'Sistema RL Connect',
          description: `Candidato ${candidate.name} contratado para a vaga ${job.title} no cliente ${clientName}. Lançamento financeiro no valor de R$ ${feeAmount.toLocaleString('pt-BR')} criado com status 'A faturar'.`
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.saveHeadhunterFinancial(newFin);

    // Add Timeline event
    this.addTimelineEvent({
      id: `tl-${Date.now()}`,
      applicationId: app.id,
      title: 'Contratação Headhunter Realizada',
      description: `Contratação concluída para a empresa cliente ${clientName}. Gerado faturamento no valor de R$ ${feeAmount.toLocaleString('pt-BR')} (ID Financeiro: ${newFin.id}).`,
      author: 'Módulo Headhunter',
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      financial: newFin,
      message: 'Contratação concluída e enviada para o Financeiro Headhunter.'
    };
  }
}

export const db = new DBManager();

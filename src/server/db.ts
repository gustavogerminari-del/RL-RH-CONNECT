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
  CompanyUser
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
}

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

// Initial seed data for RL RH Connect
const INITIAL_DATA: DBData = {
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
  ]
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
    const clean = cpf.replace(/\D/g, '');
    return this.data.candidates.find(c => c.cpf.replace(/\D/g, '') === clean);
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
    return this.data.candidates.filter(c => c.bancoTalentos);
  }

  public getCompanyUsers(): CompanyUser[] {
    return this.data.companyUsers;
  }

  public authenticateUser(email: string): CompanyUser | undefined {
    return this.data.companyUsers.find(
      u => u.email.toLowerCase().trim() === email.toLowerCase().trim()
    );
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
}

export const db = new DBManager();

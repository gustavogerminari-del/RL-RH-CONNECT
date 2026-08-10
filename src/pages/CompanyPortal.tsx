import React, { useState, useEffect } from 'react';
import {
  Building2,
  Lock,
  Mail,
  User,
  Plus,
  Briefcase,
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  Layers,
  ChevronRight,
  Eye,
  Trash2,
  Filter,
  BarChart2,
  Settings,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  Clock,
  DollarSign,
  Gift,
  Upload,
  UserCheck,
  Award,
  TrendingUp,
  LayoutDashboard,
  Bell,
  FileCheck,
  Sun,
  UserX,
  HeartPulse,
  Globe,
  Shield,
  X
} from 'lucide-react';
import { CompanyUser, Company, Job, Application, Candidate, CandidateDocument } from '../types';
import { CandidateSideDrawer } from '../components/CandidateSideDrawer';
import { formatCPF, maskCPFForPrivacy } from '../utils/cpf';
import { hasModule } from '../utils/modules';

// Import Official Sub-Module Views
import { CompanyDashboardView } from '../components/company/CompanyDashboardView';
import { RecrutamentoVagasView } from '../components/company/RecrutamentoVagasView';
import { CandidatosPorVagaView } from '../components/company/CandidatosPorVagaView';
import { HeadhunterView } from '../components/company/HeadhunterView';
import { EncaminharHeadhunterModal } from '../components/company/EncaminharHeadhunterModal';
import { BancoTalentosView } from '../components/company/BancoTalentosView';
import { AgendaEntrevistasView } from '../components/company/AgendaEntrevistasView';
import { FuncionariosView } from '../components/company/FuncionariosView';
import { DepartamentoPessoalView } from '../components/company/DepartamentoPessoalView';
import { PontoDigitalView } from '../components/company/PontoDigitalView';
import { FolhaPagamentoView } from '../components/company/FolhaPagamentoView';
import { BeneficiosView } from '../components/company/BeneficiosView';
import { CentralDocumentosView } from '../components/company/CentralDocumentosView';
import { RelatoriosView } from '../components/company/RelatoriosView';
import { IaRhView } from '../components/company/IaRhView';

interface CompanyPortalProps {
  currentUser: CompanyUser | null;
  currentCompany: Company | null;
  onLogin: (user: CompanyUser, company: Company | null) => void;
  onLogout: () => void;
}

export const CompanyPortal: React.FC<CompanyPortalProps> = ({
  currentUser,
  currentCompany,
  onLogin,
  onLogout
}) => {
  // Login form state
  const [emailInput, setEmailInput] = useState('rh@logisticabrasil.com.br');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Dynamically loaded companies list
  const [allCompaniesList, setAllCompaniesList] = useState<Array<{ company: Company; user?: CompanyUser }>>([
    {
      company: { id: 'comp-01', name: 'Logística Brasil Express', city: 'São Paulo', state: 'SP', active: true, createdAt: '' },
      user: { id: 'usr-comp1', email: 'rh@logisticabrasil.com.br', name: 'Gustavo Admin', companyId: 'comp-01', role: 'admin' }
    },
    {
      company: { id: 'comp-02', name: 'InovaTech Software', city: 'Florianópolis', state: 'SC', active: true, createdAt: '' },
      user: { id: 'usr-comp2', email: 'recrutamento@inovatech.com.br', name: 'Rafaela RH', companyId: 'comp-02', role: 'admin' }
    }
  ]);

  useEffect(() => {
    fetch('/api/master/subscriptions')
      .then(r => r.json())
      .then(data => {
        if (data.subscriptions && Array.isArray(data.subscriptions)) {
          const fetchedCompanies = data.subscriptions.map((s: any) => ({
            company: s.company,
            user: {
              id: `usr-${s.company.id}`,
              email: `admin@${s.company.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com.br`,
              name: 'Administrador Empresa',
              companyId: s.company.id,
              role: 'admin' as const
            }
          }));
          if (fetchedCompanies.length > 0) {
            setAllCompaniesList(fetchedCompanies);
          }
        }
      })
      .catch(() => {});
  }, []);

  // Active view inside Company Panel
  const [activeMenu, setActiveMenu] = useState<string>('dashboard');
  const [activeTopTab, setActiveTopTab] = useState<string>('Visão Geral');
  const [headhunterSubTab, setHeadhunterSubTab] = useState<'visão_geral' | 'projetos' | 'clientes' | 'financeiro' | 'portal_cliente'>('visão_geral');

  // Jobs state
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // Job Applications list state (Columns/Table)
  const [applications, setApplications] = useState<
    (Application & { candidate?: Candidate; documentsCount?: number })[]
  >([]);

  // Side Drawer Candidate Profile ID
  const [drawerAppId, setDrawerAppId] = useState<string | null>(null);

  // Central de Contratações State
  const [contratacoesList, setContratacoesList] = useState([
    {
      id: 'c-1',
      candidateName: 'gustavo',
      jobTitle: 'LOGISTICA',
      date: '03/08/2026',
      destination: 'Departamento Pessoal (DP)',
      statusProcesso: 'Aguardando Admissão no DP',
      remuneration: 'R$ 5.200,00',
      salaryAmount: 'R$ 5.200,00',
      honorariosAmount: 'N/A (Vaga Interna)',
      clientName: 'InovaTech (Interna)',
      sentToHeadhunter: false,
      isDP: true
    }
  ]);

  const [selectedForwardItem, setSelectedForwardItem] = useState<any | null>(null);
  const [forwardForm, setForwardForm] = useState({
    salary: 'R$ 6.500,00',
    fee: 'R$ 13.000,00',
    client: 'Logística Express S.A.',
    notes: 'Contratação finalizada no ATS e encaminhada para faturamento de honorários do Headhunter.'
  });
  const [forwardBannerMessage, setForwardBannerMessage] = useState<string | null>(null);

  const handleConfirmForwardToDP = (item: any) => {
    setContratacoesList(prev =>
      prev.map(i =>
        i.id === item.id
          ? {
              ...i,
              statusProcesso: 'Encaminhado ao Departamento Pessoal (Admissões)',
              destination: 'Departamento Pessoal (DP)'
            }
          : i
      )
    );
    setForwardBannerMessage(
      `🎉 Contratação de "${item.candidateName}" (Vaga: ${item.jobTitle}) foi encaminhada com sucesso para a área do Departamento Pessoal (Admissões)!`
    );
    setTimeout(() => {
      setActiveMenu('admissoes');
    }, 1500);
  };

  const handleConfirmForwardToHeadhunter = () => {
    if (!selectedForwardItem) return;
    setContratacoesList(prev =>
      prev.map(item =>
        item.id === selectedForwardItem.id
          ? {
              ...item,
              sentToHeadhunter: true,
              statusProcesso: 'Encaminhado ao Headhunter & Financeiro',
              remuneration: forwardForm.salary,
              honorariosAmount: forwardForm.fee,
              clientName: forwardForm.client
            }
          : item
      )
    );
    const candidateName = selectedForwardItem.candidateName;
    const jobTitle = selectedForwardItem.jobTitle;
    setSelectedForwardItem(null);
    setForwardBannerMessage(
      `🎉 Contratação de "${candidateName}" (Vaga: ${jobTitle}) foi encaminhada com sucesso para o Módulo Headhunter / Financeiro!`
    );
  };

  // Job Creation/Edit Modal state
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Partial<Job>>({
    title: '',
    area: 'Administrativo',
    city: 'São Paulo',
    state: 'SP',
    workMode: 'Presencial',
    contractType: 'CLT',
    salaryMin: 3000,
    salaryMax: 4500,
    salaryDisclosed: true,
    openingsCount: 1,
    description: '',
    responsibilities: [''],
    requirements: [''],
    benefits: [''],
    status: 'aberta',
    published: true,
    documentRequirements: [
      {
        id: 'doc-1',
        category: 'profissionais',
        docType: 'Currículo',
        title: 'Currículo Vitae',
        level: 'obrigatorio'
      }
    ],
    customQuestions: []
  });

  const companyId = currentUser?.companyId || 'comp-01';

  // Fetch company jobs
  const fetchCompanyJobs = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/company/jobs?companyId=${companyId}`);
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
        if (data.jobs && data.jobs.length > 0 && !selectedJobId) {
          setSelectedJobId(data.jobs[0].id);
        }
      }
    } catch (e) {
      console.error('Error fetching company jobs:', e);
    }
  };

  // Fetch candidate list for selected job
  const fetchApplicationsForJob = async (jobId: string) => {
    try {
      const res = await fetch(`/api/company/jobs/${jobId}/applications?companyId=${companyId}`);
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
      }
    } catch (e) {
      console.error('Error fetching applications for job:', e);
    }
  };

  const fetchContratacoes = async () => {
    try {
      const res = await fetch(`/api/company/contratacoes?companyId=${companyId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.contratacoes) {
          setContratacoesList(prev => {
            const backendItems = data.contratacoes;
            const prevNonBackend = prev.filter(p => !p.id.startsWith('contratacao-'));
            return [...backendItems, ...prevNonBackend];
          });
        }
      }
    } catch (e) {
      console.error('Error fetching contratacoes:', e);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchCompanyJobs();
      fetchContratacoes();
    }
  }, [currentUser, companyId]);

  useEffect(() => {
    if (activeMenu === 'contratacoes') {
      fetchContratacoes();
    }
  }, [activeMenu, companyId]);

  useEffect(() => {
    if (selectedJobId && currentUser) {
      fetchApplicationsForJob(selectedJobId);
    }
  }, [selectedJobId, currentUser]);

  const handleDirectLogin = async (email: string) => {
    setLoginError(null);
    setEmailInput(email);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Falha na autenticação.');

      onLogin(data.user, data.company);
    } catch (err: any) {
      setLoginError(err.message || 'E-mail não cadastrado.');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleDirectLogin(emailInput);
  };

  const handleSaveJob = async () => {
    try {
      const res = await fetch('/api/company/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobData: editingJob, companyId })
      });

      if (res.ok) {
        setShowJobModal(false);
        fetchCompanyJobs();
      }
    } catch (e) {
      console.error('Error saving job:', e);
    }
  };

  // --- IF NOT LOGGED IN: SHOW ENTERPRISE LOGIN PAGE ---
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
        <div className="bg-white text-slate-900 rounded-2xl max-w-md w-full p-8 shadow-2xl border border-slate-200">
          <div className="text-center mb-6 space-y-2">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold mx-auto shadow-md">
              <Building2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              RL RH Connect — Portal Empresarial
            </h2>
            <p className="text-xs text-slate-500">
              Acesso exclusivo para Gestores de RH e Recrutadores
            </p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium">
              {loginError}
            </div>
          )}

          {/* Preset Demo Accounts */}
          <div className="mb-6 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
            <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider">
              Clique em uma conta para Acesso Instantâneo:
            </span>
            <button
              type="button"
              onClick={() => handleDirectLogin('rh@logisticabrasil.com.br')}
              className="w-full text-left px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm block truncate transition-colors cursor-pointer"
            >
              🏢 Logística Brasil Express (Entrar como RH)
            </button>
            <button
              type="button"
              onClick={() => handleDirectLogin('recrutamento@inovatech.com.br')}
              className="w-full text-left px-3 py-2 bg-white border border-slate-300 hover:border-blue-500 font-medium text-slate-800 rounded-lg block truncate cursor-pointer"
            >
              💻 InovaTech Software (Empresa B - Isolamento)
            </button>
            <button
              type="button"
              onClick={() => handleDirectLogin('master@rlrhconnect.com')}
              className="w-full text-left px-3 py-2 bg-indigo-50 border border-indigo-300 hover:bg-indigo-100 font-bold text-indigo-900 rounded-lg block truncate cursor-pointer"
            >
              👑 Administrador Master (Acesso Global)
            </button>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                E-mail Corporativo
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Senha</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  defaultValue="123456"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-colors text-xs uppercase tracking-wider"
            >
              Entrar no Painel RH
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Helper to check if a system module is enabled for current company
  const isModuleEnabled = (moduleId: string): boolean => {
    if (!currentCompany) return true;
    return hasModule(currentCompany, moduleId);
  };

  // Route Guard: Redirect to dashboard if activeMenu requires an uncontracted module
  useEffect(() => {
    if (!currentCompany) return;

    const menuModuleMap: Record<string, string> = {
      headhunter: 'headhunter',
      'banco-de-talentos': 'banco-de-talentos',
      'agenda-entrevistas': 'agenda-entrevistas',
      funcionarios: 'funcionarios',
      'departamento-pessoal': 'funcionarios',
      admissoes: 'admissoes',
      ferias: 'ferias',
      rescisoes: 'ferias',
      afastamentos: 'ferias',
      'ponto-digital': 'ponto-digital',
      'folha-de-pagamento': 'folha-de-pagamento',
      beneficios: 'beneficios',
      sst: 'sst',
      'central-documentos': 'central-documentos',
      relatorios: 'relatorios',
      'ia-rh': 'ia-rh'
    };

    const requiredModule = menuModuleMap[activeMenu];
    if (requiredModule && !hasModule(currentCompany, requiredModule)) {
      setActiveMenu('dashboard');
    }
  }, [activeMenu, currentCompany]);

  // Horizontal top tabs list filtered by company active modules
  const allTopTabs = [
    { id: 'Visão Geral', menu: 'dashboard', module: null },
    { id: 'Colaboradores', menu: 'funcionarios', module: 'funcionarios' },
    { id: 'Organograma', menu: 'funcionarios', module: 'funcionarios' },
    { id: 'Cargos e Salários', menu: 'funcionarios', module: 'funcionarios' },
    { id: 'Jornada', menu: 'ponto-digital', module: 'ponto-digital' },
    { id: 'Admissões', menu: 'admissoes', module: 'admissoes' },
    { id: 'Benefícios', menu: 'beneficios', module: 'beneficios' },
    { id: 'Férias e Afastamentos', menu: 'ferias', module: 'ferias' },
    { id: 'Saúde e Segurança (SST)', menu: 'sst', module: 'sst' },
    { id: 'Documentos', menu: 'central-documentos', module: 'central-documentos' },
    { id: 'Rescisões', menu: 'rescisoes', module: 'ferias' },
    { id: 'Folha de Pagamento', menu: 'folha-de-pagamento', module: 'folha-de-pagamento' },
    { id: 'Relatórios', menu: 'relatorios', module: 'relatorios' },
    { id: 'Assistente IA RH', menu: 'ia-rh', module: 'ia-rh' },
    { id: 'Acessos ao Portal', menu: 'dashboard', module: null },
    { id: 'Configurações', menu: 'dashboard', module: null }
  ];

  const topTabs = allTopTabs.filter(
    tab => !tab.module || isModuleEnabled(tab.module)
  );

  return (
    <div className="min-h-screen bg-[#070d18] text-slate-100 flex flex-col font-sans select-none">
      {/* 1. TOPMOST AUTHENTICATION STATUS BAR */}
      <div className="bg-[#050a14] text-slate-300 px-4 py-1.5 border-b border-slate-800/80 flex items-center justify-between text-[11px]">
        <div className="flex items-center space-x-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-medium text-slate-400">Sessão Autenticada:</span>
          <span className="font-bold text-white">{currentUser.name}</span>
          <span className="text-slate-400">({currentUser.email || 'gustavo.germinari@hotmail.com'})</span>
          <span className="bg-slate-800/90 text-blue-300 border border-slate-700/80 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
            • {currentUser.role === 'admin' ? 'ADMIN_EMPRESA' : currentUser.role.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-2 text-[11px]">
            <span className="text-slate-400">Empresa:</span>
            <select
              value={currentUser.companyId}
              onChange={e => {
                const found = allCompaniesList.find(c => c.company.id === e.target.value);
                if (found) {
                  onLogin(
                    found.user || {
                      id: `usr-${found.company.id}`,
                      email: `admin@${found.company.id}.com.br`,
                      name: 'Administrador Empresa',
                      companyId: found.company.id,
                      role: 'admin'
                    },
                    found.company
                  );
                }
              }}
              className="bg-[#0b1322] border border-slate-700 text-slate-200 font-semibold rounded-lg px-2 py-0.5 text-xs focus:ring-1 focus:ring-blue-500"
            >
              {allCompaniesList.map(item => (
                <option key={item.company.id} value={item.company.id}>
                  {item.company.name} ({item.company.city || 'SP'})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onLogout}
            className="text-rose-400 hover:text-rose-300 text-xs font-bold transition-colors flex items-center space-x-1"
          >
            <span>[&rarr; Encerrar Sessão</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN BRANDING & GLOBAL SEARCH HEADER BAR */}
      <div className="bg-[#0b1324] text-white px-5 py-2.5 border-b border-slate-800 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-blue-600 font-black text-white flex items-center justify-center text-sm shadow-md border border-blue-400/30">
            RL
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-extrabold text-base tracking-tight text-white leading-none">
                RL CONNECT
              </h1>
              <span className="bg-blue-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                R LOURENÇO RH
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Gestão Inteligente de Pessoas & Seleção
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl mx-4 hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Buscar candidato, vaga ou competência..."
              className="w-full bg-[#121c33] border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium"
            />
          </div>
        </div>

        {/* Quick Actions & User Profile */}
        <div className="flex items-center space-x-3 shrink-0">
          <button className="px-3.5 py-2 bg-[#1a253d] hover:bg-[#253557] border border-slate-700/80 text-white text-xs font-bold rounded-xl flex items-center space-x-2 transition-colors shadow-2xs">
            <Plus className="w-4 h-4 text-blue-400" />
            <span>Ação Rápida</span>
            <ChevronRight className="w-3.5 h-3.5 rotate-90 text-slate-400" />
          </button>

          <div className="w-9 h-9 rounded-xl bg-[#121c33] border border-slate-700/80 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer transition-colors relative">
            <div className="w-2 h-2 rounded-full bg-blue-500 absolute top-2 right-2"></div>
            <Bell className="w-4 h-4" />
          </div>

          <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 font-bold flex items-center justify-center text-xs uppercase">
              {currentUser.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden lg:block text-left leading-tight">
              <span className="block text-xs font-bold text-white">{currentUser.name}</span>
              <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                {currentUser.role === 'admin' ? 'ADMIN_EMPRESA' : currentUser.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* 3. LEFT DARK SIDEBAR MENU */}
        <aside className="w-60 bg-[#09101f] border-r border-slate-800/80 p-3 hidden md:flex flex-col space-y-4 text-xs shrink-0 overflow-y-auto select-none">
          {/* MENU GROUP: INÍCIO */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 block mb-1">
              INÍCIO
            </span>
            <button
              onClick={() => { setActiveMenu('dashboard'); setActiveTopTab('Visão Geral'); }}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl font-bold transition-all text-left ${
                activeMenu === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-[#131f36] hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span className="truncate">Visão Geral</span>
            </button>
          </div>

          {/* MENU GROUP: RECRUTAMENTO & HEADHUNTER */}
          {(isModuleEnabled('vagas') || isModuleEnabled('candidatos') || isModuleEnabled('banco-de-talentos') || isModuleEnabled('agenda-entrevistas') || isModuleEnabled('contratacoes') || isModuleEnabled('headhunter')) && (
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 block mb-1">
                RECRUTAMENTO & HEADHUNTER
              </span>
              <div className="space-y-0.5">
                {isModuleEnabled('vagas') && (
                  <button
                    onClick={() => { setActiveMenu('vagas'); setActiveTopTab('Visão Geral'); }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold transition-all text-left ${
                      activeMenu === 'vagas'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-300 hover:bg-[#131f36] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Briefcase className="w-4 h-4 shrink-0" />
                      <span className="truncate">Vagas</span>
                    </div>
                    <span className="text-[10px] font-black bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                      {jobs.length || 16}
                    </span>
                  </button>
                )}

                {isModuleEnabled('candidatos') && (
                  <button
                    onClick={() => { setActiveMenu('candidatos'); setActiveTopTab('Visão Geral'); }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold transition-all text-left ${
                      activeMenu === 'candidatos'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-300 hover:bg-[#131f36] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Users className="w-4 h-4 shrink-0" />
                      <span className="truncate">Candidatos</span>
                    </div>
                    <span className="text-[10px] font-black bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                      10
                    </span>
                  </button>
                )}

                {isModuleEnabled('banco-de-talentos') && (
                  <button
                    onClick={() => { setActiveMenu('banco-de-talentos'); setActiveTopTab('Visão Geral'); }}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl font-bold transition-all text-left ${
                      activeMenu === 'banco-de-talentos'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-300 hover:bg-[#131f36] hover:text-white'
                    }`}
                  >
                    <UserCheck className="w-4 h-4 shrink-0" />
                    <span className="truncate">Banco de Talentos</span>
                  </button>
                )}

                {isModuleEnabled('agenda-entrevistas') && (
                  <button
                    onClick={() => { setActiveMenu('agenda-entrevistas'); setActiveTopTab('Visão Geral'); }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold transition-all text-left ${
                      activeMenu === 'agenda-entrevistas'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-300 hover:bg-[#131f36] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Calendar className="w-4 h-4 shrink-0" />
                      <span className="truncate">Entrevistas</span>
                    </div>
                    <span className="text-[10px] font-black bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                      1
                    </span>
                  </button>
                )}

                {isModuleEnabled('contratacoes') && (
                  <button
                    onClick={() => { setActiveMenu('contratacoes'); setActiveTopTab('Admissões'); }}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl font-bold transition-all text-left ${
                      activeMenu === 'contratacoes'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-300 hover:bg-[#131f36] hover:text-white'
                    }`}
                  >
                    <FileCheck className="w-4 h-4 shrink-0" />
                    <span className="truncate">Contratações</span>
                  </button>
                )}

                {isModuleEnabled('headhunter') && (
                  <>
                    <button
                      onClick={() => { setActiveMenu('headhunter'); setHeadhunterSubTab('clientes'); setActiveTopTab('Visão Geral'); }}
                      className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl font-bold transition-all text-left ${
                        activeMenu === 'headhunter' && headhunterSubTab === 'clientes'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-slate-300 hover:bg-[#131f36] hover:text-white'
                      }`}
                    >
                      <Award className="w-4 h-4 shrink-0" />
                      <span className="truncate">Clientes Headhunter</span>
                    </button>

                    <button
                      onClick={() => { setActiveMenu('headhunter'); setHeadhunterSubTab('financeiro'); setActiveTopTab('Visão Geral'); }}
                      className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl font-bold transition-all text-left ${
                        activeMenu === 'headhunter' && headhunterSubTab === 'financeiro'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-slate-300 hover:bg-[#131f36] hover:text-white'
                      }`}
                    >
                      <DollarSign className="w-4 h-4 shrink-0" />
                      <span className="truncate">Financeiro Headhunter</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* MENU GROUP: COLABORADORES */}
          {(isModuleEnabled('funcionarios') || isModuleEnabled('admissoes')) && (
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 block mb-1">
                COLABORADORES
              </span>
              <div className="space-y-0.5">
                {isModuleEnabled('funcionarios') && (
                  <button
                    onClick={() => { setActiveMenu('funcionarios'); setActiveTopTab('Colaboradores'); }}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl font-bold transition-all text-left ${
                      activeMenu === 'funcionarios'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-300 hover:bg-[#131f36] hover:text-white'
                    }`}
                  >
                    <Users className="w-4 h-4 shrink-0" />
                    <span className="truncate">Colaboradores</span>
                  </button>
                )}

                {isModuleEnabled('admissoes') && (
                  <button
                    onClick={() => { setActiveMenu('admissoes'); setActiveTopTab('Admissões'); }}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl font-bold transition-all text-left ${
                      activeMenu === 'admissoes'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-300 hover:bg-[#131f36] hover:text-white'
                    }`}
                  >
                    <FileCheck className="w-4 h-4 shrink-0" />
                    <span className="truncate">Admissões Digitais</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* MENU GROUP: DEPARTAMENTO PESSOAL */}
          {(isModuleEnabled('ponto-digital') || isModuleEnabled('folha-de-pagamento') || isModuleEnabled('beneficios') || isModuleEnabled('ferias') || isModuleEnabled('central-documentos') || isModuleEnabled('sst')) && (
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 block mb-1">
                DEPARTAMENTO PESSOAL
              </span>
              <div className="space-y-0.5">
                {isModuleEnabled('ponto-digital') && (
                  <button
                    onClick={() => { setActiveMenu('ponto-digital'); setActiveTopTab('Jornada'); }}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl font-bold transition-all text-left ${
                      activeMenu === 'ponto-digital'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-300 hover:bg-[#131f36] hover:text-white'
                    }`}
                  >
                    <Clock className="w-4 h-4 shrink-0" />
                    <span className="truncate">Jornada (Ponto)</span>
                  </button>
                )}

                {isModuleEnabled('folha-de-pagamento') && (
                  <button
                    onClick={() => { setActiveMenu('folha-de-pagamento'); setActiveTopTab('Folha de Pagamento'); }}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl font-bold transition-all text-left ${
                      activeMenu === 'folha-de-pagamento'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-300 hover:bg-[#131f36] hover:text-white'
                    }`}
                  >
                    <DollarSign className="w-4 h-4 shrink-0" />
                    <span className="truncate">Folha de Pagamento</span>
                  </button>
                )}

                {isModuleEnabled('beneficios') && (
                  <button
                    onClick={() => { setActiveMenu('beneficios'); setActiveTopTab('Benefícios'); }}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl font-bold transition-all text-left ${
                      activeMenu === 'beneficios'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-300 hover:bg-[#131f36] hover:text-white'
                    }`}
                  >
                    <Gift className="w-4 h-4 shrink-0" />
                    <span className="truncate">Benefícios</span>
                  </button>
                )}

                {isModuleEnabled('ferias') && (
                  <>
                    <button
                      onClick={() => { setActiveMenu('departamento-pessoal'); setActiveTopTab('Férias e Afastamentos'); }}
                      className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl font-bold transition-all text-left ${
                        activeMenu === 'departamento-pessoal'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-slate-300 hover:bg-[#131f36] hover:text-white'
                      }`}
                    >
                      <Sun className="w-4 h-4 shrink-0" />
                      <span className="truncate">Férias & Afastamentos</span>
                    </button>

                    <button
                      onClick={() => { setActiveMenu('departamento-pessoal'); setActiveTopTab('Rescisões'); }}
                      className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl font-bold transition-all text-left ${
                        activeMenu === 'departamento-pessoal'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-slate-300 hover:bg-[#131f36] hover:text-white'
                      }`}
                    >
                      <UserX className="w-4 h-4 shrink-0" />
                      <span className="truncate">Rescisões</span>
                    </button>
                  </>
                )}

                {isModuleEnabled('central-documentos') && (
                  <button
                    onClick={() => { setActiveMenu('central-documentos'); setActiveTopTab('Documentos'); }}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl font-bold transition-all text-left ${
                      activeMenu === 'central-documentos'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-300 hover:bg-[#131f36] hover:text-white'
                    }`}
                  >
                    <FileText className="w-4 h-4 shrink-0" />
                    <span className="truncate">Documentos</span>
                  </button>
                )}

                {isModuleEnabled('sst') && (
                  <button
                    onClick={() => { setActiveMenu('sst'); setActiveTopTab('Saúde e Segurança (SST)'); }}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl font-bold transition-all text-left ${
                      activeMenu === 'sst'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-300 hover:bg-[#131f36] hover:text-white'
                    }`}
                  >
                    <HeartPulse className="w-4 h-4 shrink-0" />
                    <span className="truncate">Saúde e Segurança (SST)</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* MENU GROUP: GESTÃO & IA */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 block mb-1">
              GESTÃO
            </span>
            <div className="space-y-0.5">
              {isModuleEnabled('agenda-entrevistas') && (
                <button
                  onClick={() => { setActiveMenu('agenda-entrevistas'); setActiveTopTab('Visão Geral'); }}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl font-bold transition-all text-left ${
                    activeMenu === 'agenda-entrevistas'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-300 hover:bg-[#131f36] hover:text-white'
                  }`}
                >
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span className="truncate">Agenda</span>
                </button>
              )}

              {isModuleEnabled('relatorios') && (
                <button
                  onClick={() => { setActiveMenu('relatorios'); setActiveTopTab('Relatórios'); }}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl font-bold transition-all text-left ${
                    activeMenu === 'relatorios'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-300 hover:bg-[#131f36] hover:text-white'
                  }`}
                >
                  <BarChart2 className="w-4 h-4 shrink-0" />
                  <span className="truncate">Relatórios Gerais</span>
                </button>
              )}

              {isModuleEnabled('ia-rh') && (
                <button
                  onClick={() => { setActiveMenu('ia-rh'); setActiveTopTab('Assistente IA RH'); }}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl font-bold transition-all text-left ${
                    activeMenu === 'ia-rh'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-300 hover:bg-[#131f36] hover:text-white'
                  }`}
                >
                  <Sparkles className="w-4 h-4 shrink-0 text-amber-400" />
                  <span className="truncate">Assistente IA RH</span>
                </button>
              )}

              <a
                href="/vagas"
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl font-bold transition-all text-left text-slate-300 hover:bg-[#131f36] hover:text-white"
              >
                <Globe className="w-4 h-4 shrink-0" />
                <span className="truncate">Portal de Vagas</span>
              </a>
            </div>
          </div>
        </aside>

        {/* 4. MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50 text-slate-900 overflow-hidden">
          {/* TOP HORIZONTAL SUBTAB BAR (MATCHING USER REFERENCE IMAGES) */}
          <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center space-x-2 overflow-x-auto shrink-0 shadow-2xs">
            {topTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTopTab(tab.id);
                  setActiveMenu(tab.menu as any);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                  activeTopTab === tab.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium'
                }`}
              >
                <span>{tab.id}</span>
              </button>
            ))}
          </div>

          {/* MAIN PAGE CONTAINER */}
          <main className="flex-1 p-4 md:p-6 overflow-y-auto">
            {/* MENU: DASHBOARD INTEGRADO */}
            {activeMenu === 'dashboard' && (
              <CompanyDashboardView
                companyId={companyId}
                companyName={currentCompany?.name || 'Empresa RL RH Connect'}
                onNavigate={(menu) => setActiveMenu(menu as any)}
              />
            )}

            {/* MENU: RECRUTAMENTO VAGAS */}
            {activeMenu === 'vagas' && (
              <RecrutamentoVagasView companyId={companyId} userRole={currentUser?.role} onNavigateMenu={(menu) => setActiveMenu(menu)} />
            )}

            {/* MENU: CANDIDATOS POR VAGA */}
            {activeMenu === 'candidatos' && (
              <CandidatosPorVagaView
                companyId={companyId}
                onSelectJob={() => setActiveMenu('vagas')}
                onOpenDrawer={(appId) => setDrawerAppId(appId)}
              />
            )}

            {/* MENU: CONTRATAÇÕES CENTRAL */}
            {activeMenu === 'contratacoes' && (
              <div className="space-y-6">
                {forwardBannerMessage && (
                  <div className="bg-emerald-600 text-white p-4 rounded-2xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold animate-in fade-in">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-5 h-5 text-amber-300 shrink-0" />
                      <span>{forwardBannerMessage}</span>
                    </div>
                    <button
                      onClick={() => setActiveMenu('headhunter')}
                      className="px-4 py-2 bg-white text-emerald-900 font-extrabold rounded-xl shadow-xs hover:bg-emerald-50 transition shrink-0"
                    >
                      Ir para o Módulo Headhunter →
                    </button>
                  </div>
                )}

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">
                          Central Única de Contratações
                        </h2>
                        <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full text-xs">
                          {contratacoesList.length} contratação(ões)
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Central única de acompanhamento automático das contratações. Todos os processos são encaminhados e sincronizados em tempo real com o Módulo Headhunter e Financeiro.
                      </p>
                    </div>
                  </div>

                  {/* KPI Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        TOTAL DE CONTRATAÇÕES
                      </span>
                      <span className="text-2xl font-black text-slate-900 mt-1 block">
                        {contratacoesList.length}
                      </span>
                      <span className="text-[11px] text-slate-500 mt-1 block">Contratações concluídas</span>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        ENCAMINHADAS PARA HEADHUNTER / FINANCEIRO
                      </span>
                      <span className="text-2xl font-black text-purple-600 mt-1 block">
                        {contratacoesList.filter(c => c.sentToHeadhunter).length}
                      </span>
                      <span className="text-[11px] text-slate-500 mt-1 block">Fluxo Headhunter / Faturamento</span>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex items-center space-x-2 border-b border-slate-200 pb-3 mb-6 text-xs font-bold overflow-x-auto">
                    <button className="px-3 py-1.5 bg-slate-900 text-white rounded-lg whitespace-nowrap">Todas {contratacoesList.length}</button>
                    <button className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg whitespace-nowrap">
                      Financeiro / Headhunter {contratacoesList.filter(c => c.sentToHeadhunter).length}
                    </button>
                    <button className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg whitespace-nowrap">Aguardando Cobrança</button>
                    <button className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg whitespace-nowrap">Finalizadas</button>
                  </div>

                  {/* List of Hire Cards */}
                  <div className="space-y-4">
                    {contratacoesList.map(c => (
                      <div key={c.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                        <div className="bg-emerald-50 px-4 py-2 border-b border-emerald-100 flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span className="font-bold text-emerald-900">Contratação concluída</span>
                            <span className="text-emerald-700">Data: {c.date}</span>
                          </div>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                            c.sentToHeadhunter
                              ? 'bg-purple-200 text-purple-900'
                              : 'bg-emerald-200 text-emerald-900'
                          }`}>
                            {c.sentToHeadhunter ? 'Encaminhado ao Headhunter' : 'Contratado'}
                          </span>
                        </div>

                        <div className="p-5 space-y-4">
                          <div>
                            <h3 className="text-base font-extrabold text-slate-900">{c.candidateName}</h3>
                            <p className="text-xs font-semibold text-slate-600">Cargo/Vaga: {c.jobTitle}</p>
                          </div>

                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-wrap gap-4 text-xs font-medium text-slate-700">
                            <div>
                              <span className="block text-[10px] text-slate-400 uppercase font-bold">Destino</span>
                              <span className="font-bold text-slate-900">{c.destination}</span>
                            </div>
                            <div>
                              <span className="block text-[10px] text-slate-400 uppercase font-bold">Status do Processo</span>
                              <span className={`font-bold px-2 py-0.5 rounded-md ${
                                c.sentToHeadhunter
                                  ? 'text-purple-700 bg-purple-50 border border-purple-200'
                                  : 'text-indigo-700 bg-indigo-50'
                              }`}>
                                {c.statusProcesso}
                              </span>
                            </div>
                            <div>
                              <span className="block text-[10px] text-slate-400 uppercase font-bold">Remuneração</span>
                              <span className="font-bold text-slate-900">{c.remuneration}</span>
                            </div>
                            {c.sentToHeadhunter && (
                              <div>
                                <span className="block text-[10px] text-slate-400 uppercase font-bold">Honorários Headhunter</span>
                                <span className="font-bold text-purple-700">{c.honorariosAmount}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <button className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl">
                              Ver detalhes
                            </button>

                            {(c.isDP || (c.destination && (c.destination.includes('DP') || c.destination.includes('Departamento'))) || !c.sentToHeadhunter) ? (
                              <button
                                onClick={() => handleConfirmForwardToDP(c)}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center space-x-1.5 transition transform active:scale-95"
                              >
                                <Building2 className="w-4 h-4" />
                                <span>Encaminhar para Área do DP (Admissões) →</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedForwardItem(c);
                                  setForwardForm({
                                    salary: c.salaryAmount || 'R$ 6.500,00',
                                    fee: c.honorariosAmount || 'R$ 13.000,00',
                                    client: c.clientName || 'Logística Express S.A.',
                                    notes: `Contratação de ${c.candidateName} finalizada no ATS e encaminhada para faturamento de honorários do Headhunter.`
                                  });
                                }}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center space-x-1.5 transition transform active:scale-95"
                              >
                                <DollarSign className="w-4 h-4" />
                                <span>Finalizar e Encaminhar ao Headhunter →</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* MENU: HEADHUNTER */}
            {activeMenu === 'headhunter' && (
              <HeadhunterView
                companyId={companyId}
                onOpenDrawer={(appId) => setDrawerAppId(appId)}
                initialSubTab={headhunterSubTab}
              />
            )}

            {/* MENU: BANCO DE TALENTOS */}
            {activeMenu === 'banco-de-talentos' && (
              <BancoTalentosView companyId={companyId} />
            )}

            {/* MENU: AGENDA DE ENTREVISTAS */}
            {activeMenu === 'agenda-entrevistas' && (
              <AgendaEntrevistasView companyId={companyId} />
            )}

            {/* MENU: FUNCIONARIOS / COLABORADORES */}
            {activeMenu === 'funcionarios' && (
              <FuncionariosView companyId={companyId} />
            )}

            {/* MENU: DEPARTAMENTO PESSOAL (DP) / ADMISSÕES */}
            {(activeMenu === 'departamento-pessoal' || activeMenu === 'admissoes' || activeMenu === 'ferias' || activeMenu === 'rescisoes' || activeMenu === 'afastamentos') && (
              <DepartamentoPessoalView companyId={companyId} />
            )}

            {/* MENU: PONTO DIGITAL */}
            {activeMenu === 'ponto-digital' && (
              <PontoDigitalView companyId={companyId} />
            )}

            {/* MENU: FOLHA DE PAGAMENTO */}
            {activeMenu === 'folha-de-pagamento' && (
              <FolhaPagamentoView companyId={companyId} />
            )}

            {/* MENU: BENEFICIOS */}
            {activeMenu === 'beneficios' && (
              <BeneficiosView companyId={companyId} />
            )}

            {/* MENU: CENTRAL DOCUMENTAL */}
            {activeMenu === 'central-documentos' && (
              <CentralDocumentosView companyId={companyId} />
            )}

            {/* MENU: SAÚDE E SEGURANÇA (SST) */}
            {activeMenu === 'sst' && (
              <div className="space-y-6">
                {/* Header Title Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md">
                      <HeartPulse className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">
                        Saúde e Segurança do Trabalho (SST) & Medicina Ocupacional
                      </h2>
                      <p className="text-xs text-slate-500">
                        Controle unificado de ASOs, PGR/PCMSO, Entrega de EPIs, Treinamentos NRs e CAT e-Social.
                      </p>
                    </div>
                  </div>

                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs rounded-xl self-start md:self-auto flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>e-Social S-2210 / S-2220 / S-2240 Prontos</span>
                  </span>
                </div>

                {/* SST Subtabs */}
                <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold">
                  <button className="px-3.5 py-2 bg-blue-600 text-white rounded-xl shadow-xs">Visão Geral SST</button>
                  <button className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl">Medicina & Exames (ASO)</button>
                  <button className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl">Riscos & Programas (PGR)</button>
                  <button className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl">EPIs & Treinamentos NRs</button>
                  <button className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl">Acidentes & CAT (S-2210)</button>
                  <button className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl">Auditoria & Relatórios</button>
                </div>

                {/* Dark SST Hero Banner */}
                <div className="bg-[#0b1324] text-white rounded-2xl p-6 shadow-xl border border-slate-800 space-y-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <span className="inline-block px-2.5 py-1 bg-blue-500/20 text-blue-300 text-[10px] font-bold rounded-md uppercase tracking-wider mb-2 border border-blue-400/20">
                        CONFORMIDADE E-SOCIAL S-2210 / S-2220 / S-2240 • Empresa Matriz
                      </span>
                      <h3 className="text-xl font-extrabold tracking-tight text-white">
                        Painel Geral de Saúde e Segurança do Trabalho (SST)
                      </h3>
                      <p className="text-slate-300 text-xs mt-1 max-w-2xl leading-relaxed">
                        Gestão integrada de Medicina Ocupacional, Exames Periódicos, Programas de Risco (PGR/PCMSO), Entrega de EPIs com Assinatura Eletrônica, Treinamentos Obrigatórios e Comunicação de Acidentes (CAT).
                      </p>
                    </div>

                    <div className="flex space-x-2 shrink-0">
                      <button className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center space-x-1.5">
                        <Calendar className="w-4 h-4" />
                        <span>Agendar Exame</span>
                      </button>
                      <button className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center space-x-1.5">
                        <AlertCircle className="w-4 h-4" />
                        <span>Registrar Acidente</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* SST KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">ASO / EXAMES</span>
                      <HeartPulse className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <span className="text-2xl font-black text-slate-900">38</span>
                      <span className="text-xs font-semibold text-emerald-600 ml-1.5">em dia (79%)</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                      <span>4 a vencer</span>
                      <span className="text-rose-600 font-bold">2 vencidos</span>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">EPIS & FICHA DIGITAL</span>
                      <Shield className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <span className="text-2xl font-black text-slate-900">1</span>
                      <span className="text-xs font-semibold text-slate-600 ml-1.5">entregas ativas</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                      <span>1 trocas pendentes</span>
                      <span>1 sem ass.</span>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">TREINAMENTOS NRS</span>
                      <Award className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <span className="text-2xl font-black text-slate-900">92%</span>
                      <span className="text-xs font-semibold text-emerald-600 ml-1.5">cobertura geral</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                      <span>3 a vencer</span>
                      <span className="text-rose-600 font-bold">2 vencidos</span>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">ACCIDENTES & CAT</span>
                      <AlertCircle className="w-5 h-5 text-rose-600" />
                    </div>
                    <div>
                      <span className="text-2xl font-black text-slate-900">1</span>
                      <span className="text-xs font-semibold text-slate-600 ml-1.5">ocorridos este ano</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                      <span>TF: 5</span>
                      <span className="text-rose-600 font-bold">1 CATs pendentes</span>
                    </div>
                  </div>
                </div>

                {/* Alerts Section */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-extrabold text-slate-900">Pendências e Alertas de Conformidade</h4>
                    <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded-full">Ação Requerida</span>
                  </div>

                  <div className="divide-y divide-slate-100 text-xs">
                    <div className="py-3 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                        <div>
                          <span className="font-bold text-slate-900 block">Mariana Oliveira Ramos (Analista de RH)</span>
                          <span className="text-slate-500 text-[11px]">ASO Vencido em 2026-02-10</span>
                        </div>
                      </div>
                      <button className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs">
                        Agendar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MENU: RELATORIOS */}
            {activeMenu === 'relatorios' && (
              <RelatoriosView companyId={companyId} />
            )}

            {/* MENU: ASSISTENTE IA RH */}
            {activeMenu === 'ia-rh' && (
              <IaRhView companyId={companyId} />
            )}
          </main>
        </div>
      </div>

      {/* CANDIDATE SIDE DRAWER */}
      {drawerAppId && (
        <CandidateSideDrawer
          applicationId={drawerAppId}
          companyId={companyId}
          onClose={() => setDrawerAppId(null)}
          onUpdateStage={() => {
            fetchApplicationsForJob(selectedJobId || '');
            fetchContratacoes();
          }}
          onNavigateMenu={(menuId) => {
            setActiveMenu(menuId);
            setDrawerAppId(null);
            if (menuId === 'contratacoes') {
              fetchContratacoes();
            }
          }}
        />
      )}

      {/* CREATE JOB MODAL */}
      {showJobModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900">
              Criar Nova Vaga de Emprego
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2">
                <label className="block font-semibold mb-1">Título da Vaga *</label>
                <input
                  type="text"
                  value={editingJob.title || ''}
                  onChange={e => setEditingJob(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2 bg-slate-50 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Cidade *</label>
                <input
                  type="text"
                  value={editingJob.city || ''}
                  onChange={e => setEditingJob(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full p-2 bg-slate-50 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Estado (UF) *</label>
                <input
                  type="text"
                  value={editingJob.state || ''}
                  onChange={e => setEditingJob(prev => ({ ...prev, state: e.target.value }))}
                  className="w-full p-2 bg-slate-50 border rounded-lg"
                />
              </div>

              <div className="col-span-2">
                <label className="block font-semibold mb-1">Descrição Sobre a Vaga</label>
                <textarea
                  rows={3}
                  value={editingJob.description || ''}
                  onChange={e =>
                    setEditingJob(prev => ({ ...prev, description: e.target.value }))
                  }
                  className="w-full p-2 bg-slate-50 border rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowJobModal(false)}
                className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveJob}
                className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl text-xs"
              >
                Publicar Vaga
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Encaminhar para o Headhunter / Financeiro */}
      {selectedForwardItem && (
        <EncaminharHeadhunterModal
          isOpen={Boolean(selectedForwardItem)}
          onClose={() => setSelectedForwardItem(null)}
          companyId={companyId}
          applicationId={selectedForwardItem.applicationId || selectedForwardItem.id}
          candidateName={selectedForwardItem.candidateName}
          jobTitle={selectedForwardItem.jobTitle}
          jobId={selectedForwardItem.jobId}
          initialSalary={selectedForwardItem.salaryAmount || selectedForwardItem.remuneration || 6500}
          initialClientId={selectedForwardItem.clientId}
          initialClientName={selectedForwardItem.clientName}
          initialFee={selectedForwardItem.honorariosAmount}
          closingDate={selectedForwardItem.date}
          onSuccess={(msg) => {
            setContratacoesList(prev =>
              prev.map(item =>
                item.id === selectedForwardItem.id
                  ? {
                      ...item,
                      sentToHeadhunter: true,
                      statusProcesso: 'Encaminhado ao Headhunter & Financeiro'
                    }
                  : item
              )
            );
            setForwardBannerMessage(msg);
            setSelectedForwardItem(null);
          }}
        />
      )}
    </div>
  );
};

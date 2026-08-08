import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Building2,
  CreditCard,
  FileSpreadsheet,
  Wrench,
  Globe,
  Plus,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Save,
  DollarSign,
  TrendingUp,
  FileCheck,
  QrCode,
  ExternalLink,
  Layers,
  Settings2,
  Lock,
  Unlock,
  Sliders,
  Send,
  Zap,
  Eye,
  EyeOff,
  Copy,
  Key,
  Users,
  CheckSquare,
  Square,
  ChevronRight,
  UserPlus,
  Pencil
} from 'lucide-react';
import {
  PortalSettings,
  SaaSPlan,
  Subscription,
  Invoice,
  MasterBuilderConfig,
  Company
} from '../types';

const ALL_SYSTEM_MODULES = [
  { id: 'vagas', name: 'Recrutamento & Seleção (Vagas/ATS)', desc: 'Gestão de vagas, pipeline Kanban e triagem', category: 'Recrutamento' },
  { id: 'candidatos', name: 'Gestão de Candidatos', desc: 'Perfis, testes e avaliação de candidatos', category: 'Recrutamento' },
  { id: 'headhunter', name: 'Módulo Headhunter & Faturamento', desc: 'Gestão de clientes e cobrança de honorários', category: 'Recrutamento' },
  { id: 'banco-de-talentos', name: 'Banco de Talentos Global', desc: 'Busca ativa por habilidades e localização', category: 'Recrutamento' },
  { id: 'agenda-entrevistas', name: 'Agenda de Entrevistas & Meets', desc: 'Agendamentos e integração com Google Meet', category: 'Recrutamento' },
  { id: 'contratacoes', name: 'Central de Contratações', desc: 'Aprovação unificada e encaminhamento', category: 'Recrutamento' },
  { id: 'funcionarios', name: 'Colaboradores & Organograma', desc: 'Gestão de funcionários e estrutura organizacional', category: 'Departamento Pessoal' },
  { id: 'admissoes', name: 'Admissões Digitais', desc: 'Envio e validação de documentos admissionais', category: 'Departamento Pessoal' },
  { id: 'ponto-digital', name: 'Ponto Digital & Jornada', desc: 'Espelho de ponto, batidas e banco de horas', category: 'Departamento Pessoal' },
  { id: 'folha-de-pagamento', name: 'Folha de Pagamento', desc: 'Cálculos salariais, impostos e holerites', category: 'Departamento Pessoal' },
  { id: 'beneficios', name: 'Gestão de Benefícios', desc: 'VT, VR, VA, Plano de Saúde e premiações', category: 'Departamento Pessoal' },
  { id: 'ferias', name: 'Férias, Afastamentos & Rescisões', desc: 'Férias, licenças e desligamentos de colaboradores', category: 'Departamento Pessoal' },
  { id: 'sst', name: 'Saúde & Segurança (SST / e-Social)', desc: 'ASOs, PGR/PCMSO, EPIs e eventos e-Social', category: 'Departamento Pessoal' },
  { id: 'central-documentos', name: 'Central de Documentos', desc: 'Repositório com alertas digitais de vencimento', category: 'Gestão' },
  { id: 'relatorios', name: 'Relatórios BI & Analytics', desc: 'Métricas de RH, turnover e indicadores', category: 'Gestão' },
  { id: 'ia-rh', name: 'Assistente IA RH (Gemini)', desc: 'IA para triagem, descrição de vagas e Fit Score', category: 'Inteligência Artificial' }
];

interface MasterPortalProps {
  settings?: PortalSettings;
  onSaveSettings: (settings: PortalSettings) => void;
}

export const MasterPortal: React.FC<MasterPortalProps> = ({ settings, onSaveSettings }) => {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'empresas' | 'planos' | 'financeiro' | 'construtor' | 'settings'
  >('dashboard');

  // State data from backend
  const [plans, setPlans] = useState<SaaSPlan[]>([]);
  const [subscriptionsData, setSubscriptionsData] = useState<
    Array<{ company: Company; subscription: Subscription; user?: any; jobsCount: number; applicationsCount: number }>
  >([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [builderConfig, setBuilderConfig] = useState<MasterBuilderConfig | null>(null);
  const [portalForm, setPortalForm] = useState<PortalSettings>(
    settings || {
      portalName: 'RL RH Connect',
      bannerTitle: 'Conectando talentos às melhores oportunidades',
      bannerSubtitle: 'Encontre a oportunidade ideal para sua carreira.',
      primaryColor: '#1e40af',
      secondaryColor: '#0d9488',
      logoUrl: '',
      bgImageUrl: '',
      featuredJobIds: ['job-101'],
      footerText: '© 2026 RL RH Connect. Todos os direitos reservados.',
      whatsappContact: '(11) 98765-4321',
      emailContact: 'contato@rlrhconnect.com.br',
      linkedinUrl: 'https://linkedin.com/company/rlrhconnect',
      facebookUrl: 'https://facebook.com/rlrhconnect',
      instagramUrl: 'https://instagram.com/rlrhconnect',
      privacyPolicyText: 'Política de privacidade referente à LGPD...',
      termsOfUseText: 'Termos de uso do portal...',
      seoTitle: 'RL RH Connect - Portal de Vagas',
      seoDescription: 'Portal completo de empregos e recrutamento'
    }
  );

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modals & Forms
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planForm, setPlanForm] = useState<Partial<SaaSPlan>>({
    name: '',
    description: '',
    priceMonthly: 390,
    priceAnnual: 3900,
    maxJobs: 10,
    maxUsers: 5,
    maxCandidates: 1000,
    features: ['Vagas ilimitadas no portal', 'IA Fit Scoring', 'Suporte WhatsApp'],
    active: true
  });

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({
    companyId: '',
    planId: '',
    billingCycle: 'mensal' as 'mensal' | 'anual',
    paymentMethod: 'pix' as 'pix' | 'cartao_credito' | 'boleto'
  });

  const [selectedInvoiceForQr, setSelectedInvoiceForQr] = useState<Invoice | null>(null);

  // Company Registration State
  const [showCompanyRegisterModal, setShowCompanyRegisterModal] = useState(false);
  const [companyStep, setCompanyStep] = useState<1 | 2 | 3>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedCreds, setCopiedCreds] = useState(false);

  const [companyRegisterForm, setCompanyRegisterForm] = useState({
    name: '',
    tradeName: '',
    cnpj: '',
    city: 'São Paulo',
    state: 'SP',
    description: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    adminRole: 'admin',
    planId: 'plan-starter',
    billingCycle: 'mensal' as 'mensal' | 'anual',
    modules: ALL_SYSTEM_MODULES.map(m => m.id)
  });

  const [newlyCreatedCompanyDetails, setNewlyCreatedCompanyDetails] = useState<{
    company: Company;
    user: { email: string; password?: string; name: string };
    subscription: Subscription;
  } | null>(null);

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let pwd = '';
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCompanyRegisterForm(prev => ({ ...prev, adminPassword: pwd }));
  };

  const handleToggleModule = (moduleId: string) => {
    setCompanyRegisterForm(prev => {
      const exists = prev.modules.includes(moduleId);
      return {
        ...prev,
        modules: exists ? prev.modules.filter(m => m !== moduleId) : [...prev.modules, moduleId]
      };
    });
  };

  const handleSelectPresetModules = (preset: 'all' | 'recruitment' | 'dp') => {
    if (preset === 'all') {
      setCompanyRegisterForm(prev => ({ ...prev, modules: ALL_SYSTEM_MODULES.map(m => m.id) }));
    } else if (preset === 'recruitment') {
      setCompanyRegisterForm(prev => ({
        ...prev,
        modules: ['vagas', 'candidatos', 'headhunter', 'banco-de-talentos', 'agenda-entrevistas', 'contratacoes', 'relatorios', 'ia-rh']
      }));
    } else if (preset === 'dp') {
      setCompanyRegisterForm(prev => ({
        ...prev,
        modules: ['funcionarios', 'admissoes', 'ponto-digital', 'folha-de-pagamento', 'beneficios', 'ferias', 'sst', 'central-documentos', 'relatorios']
      }));
    }
  };

  const handleRegisterCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyRegisterForm.name.trim()) {
      notify('Preencha o Nome da Empresa.', 'error');
      return;
    }
    if (!companyRegisterForm.adminEmail.trim()) {
      notify('Preencha o E-mail do Administrador.', 'error');
      return;
    }
    if (!companyRegisterForm.adminPassword.trim()) {
      notify('Preencha a Senha de Acesso.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/master/companies/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyRegisterForm)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        notify(`Empresa "${data.company.name}" e credenciais criadas com sucesso!`);
        setShowCompanyRegisterModal(false);
        setNewlyCreatedCompanyDetails({
          company: data.company,
          user: data.user,
          subscription: data.subscription
        });
        loadMasterData();
      } else {
        notify(data.error || 'Erro ao cadastrar empresa.', 'error');
      }
    } catch (err) {
      notify('Erro de comunicação ao cadastrar empresa.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Edit Company State & Handlers
  const [showEditCompanyModal, setShowEditCompanyModal] = useState(false);
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);
  const [editCompanyStep, setEditCompanyStep] = useState<1 | 2 | 3>(1);
  const [showEditPassword, setShowEditPassword] = useState(false);

  const [editCompanyForm, setEditCompanyForm] = useState({
    name: '',
    tradeName: '',
    cnpj: '',
    city: 'São Paulo',
    state: 'SP',
    description: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    adminRole: 'admin',
    planId: 'plan-starter',
    billingCycle: 'mensal' as 'mensal' | 'anual',
    active: true,
    modules: ALL_SYSTEM_MODULES.map(m => m.id)
  });

  const generateRandomEditPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let pwd = '';
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setEditCompanyForm(prev => ({ ...prev, adminPassword: pwd }));
  };

  const handleOpenEditCompany = (item: { company: Company; subscription: Subscription; user?: any }) => {
    setEditingCompanyId(item.company.id);
    setEditCompanyStep(1);
    setEditCompanyForm({
      name: item.company.name || '',
      tradeName: item.company.tradeName || '',
      cnpj: item.company.cnpj || '',
      city: item.company.city || 'São Paulo',
      state: item.company.state || 'SP',
      description: item.company.description || '',
      adminName: item.user?.name || 'Administrador',
      adminEmail: item.user?.email || '',
      adminPassword: item.user?.password || '',
      adminRole: item.user?.role || 'admin',
      planId: item.subscription?.planId || 'plan-starter',
      billingCycle: item.subscription?.billingCycle || 'mensal',
      active: item.company.active,
      modules: item.company.modules && item.company.modules.length > 0
        ? item.company.modules
        : (item.subscription?.modules && item.subscription.modules.length > 0 ? item.subscription.modules : ALL_SYSTEM_MODULES.map(m => m.id))
    });
    setShowEditCompanyModal(true);
  };

  const handleToggleEditModule = (moduleId: string) => {
    setEditCompanyForm(prev => {
      const exists = prev.modules.includes(moduleId);
      return {
        ...prev,
        modules: exists ? prev.modules.filter(m => m !== moduleId) : [...prev.modules, moduleId]
      };
    });
  };

  const handleSelectEditPresetModules = (preset: 'all' | 'recruitment' | 'dp') => {
    if (preset === 'all') {
      setEditCompanyForm(prev => ({ ...prev, modules: ALL_SYSTEM_MODULES.map(m => m.id) }));
    } else if (preset === 'recruitment') {
      setEditCompanyForm(prev => ({
        ...prev,
        modules: ['vagas', 'candidatos', 'headhunter', 'banco-de-talentos', 'agenda-entrevistas', 'contratacoes', 'relatorios', 'ia-rh']
      }));
    } else if (preset === 'dp') {
      setEditCompanyForm(prev => ({
        ...prev,
        modules: ['funcionarios', 'admissoes', 'ponto-digital', 'folha-de-pagamento', 'beneficios', 'ferias', 'sst', 'central-documentos', 'relatorios']
      }));
    }
  };

  const handleUpdateCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompanyId) return;
    if (!editCompanyForm.name.trim()) {
      notify('O Nome da Empresa é obrigatório.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/master/companies/${editingCompanyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editCompanyForm)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        notify(`Empresa "${data.company.name}" atualizada com sucesso!`);
        setShowEditCompanyModal(false);
        loadMasterData();
      } else {
        notify(data.error || 'Erro ao atualizar empresa.', 'error');
      }
    } catch (err) {
      notify('Erro de comunicação ao atualizar empresa.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load all master data
  const loadMasterData = async () => {
    setLoading(true);
    try {
      const [resPlans, resSubs, resInvoices, resBuilder] = await Promise.all([
        fetch('/api/master/plans').then(r => r.json()),
        fetch('/api/master/subscriptions').then(r => r.json()),
        fetch('/api/master/invoices').then(r => r.json()),
        fetch('/api/master/builder').then(r => r.json())
      ]);

      if (resPlans.plans) setPlans(resPlans.plans);
      if (resSubs.subscriptions) setSubscriptionsData(resSubs.subscriptions);
      if (resInvoices.invoices) setInvoices(resInvoices.invoices);
      if (resBuilder.config) setBuilderConfig(resBuilder.config);
    } catch (e) {
      console.error('Error loading master data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMasterData();
  }, []);

  const notify = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Actions
  const handleSaveSaaSPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/master/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planForm })
      });
      const data = await res.json();
      if (res.ok) {
        notify('Plano SaaS salvo com sucesso!');
        setShowPlanModal(false);
        loadMasterData();
      } else {
        notify(data.error || 'Erro ao salvar plano', 'error');
      }
    } catch (e: any) {
      notify(e.message, 'error');
    }
  };

  const handleToggleCompanyStatus = async (companyId: string, currentActive: boolean) => {
    try {
      const res = await fetch('/api/master/subscriptions/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, active: !currentActive })
      });
      if (res.ok) {
        notify(`Status da empresa alterado para ${!currentActive ? 'Ativo' : 'Bloqueado'}. (Dados preservados).`);
        loadMasterData();
      }
    } catch (e: any) {
      notify(e.message, 'error');
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceForm.companyId) {
      notify('Selecione uma empresa.', 'error');
      return;
    }
    try {
      const res = await fetch('/api/master/invoices/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceForm)
      });
      const data = await res.json();
      if (res.ok) {
        notify('Cobrança gerada com sucesso via Mercado Pago!');
        setShowInvoiceModal(false);
        setSelectedInvoiceForQr(data.invoice);
        loadMasterData();
      } else {
        notify(data.error || 'Erro ao gerar cobrança', 'error');
      }
    } catch (e: any) {
      notify(e.message, 'error');
    }
  };

  const handleIssueNfe = async (invoiceId: string) => {
    try {
      const res = await fetch(`/api/master/invoices/${invoiceId}/issue-nfe`, {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok) {
        notify(data.message || 'NFS-e emitida com sucesso!');
        loadMasterData();
      } else {
        notify(data.error || 'Falha ao emitir NFS-e', 'error');
      }
    } catch (e: any) {
      notify(e.message, 'error');
    }
  };

  const handleSimulateWebhook = async (paymentId: string) => {
    try {
      const res = await fetch('/api/webhooks/mercadopago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'payment.created',
          type: 'payment',
          data: { id: paymentId || 'MP-PAY-SIMULATED-99' }
        })
      });
      const data = await res.json();
      notify(`Webhook simulado: ${data.message}`);
      loadMasterData();
    } catch (e: any) {
      notify(e.message, 'error');
    }
  };

  const handleSaveBuilderConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!builderConfig) return;
    try {
      const res = await fetch('/api/master/builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: builderConfig })
      });
      if (res.ok) {
        notify('Configurações do Construtor Master salvas!');
        loadMasterData();
      }
    } catch (e: any) {
      notify(e.message, 'error');
    }
  };

  const handleSavePortalSettingsForm = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(portalForm);
    notify('Configurações visuais do Portal de Vagas salvas no sistema!');
  };

  // Metrics
  const totalMRR = subscriptionsData
    .filter(s => s.subscription.status === 'ativa')
    .reduce((acc, curr) => acc + (curr.subscription.price || 0), 0);

  const activeSubsCount = subscriptionsData.filter(s => s.subscription.status === 'ativa').length;
  const overdueSubsCount = subscriptionsData.filter(s => s.subscription.status === 'atrasada').length;
  const nfeIssuedCount = invoices.filter(i => i.nfeStatus === 'emitida').length;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 text-xs text-slate-900">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-7 h-7 text-amber-400" />
            <h1 className="text-xl font-black tracking-tight">RL RH Connect — Painel Master SaaS</h1>
          </div>
          <p className="text-blue-200">
            Módulo de Administração Global: Gestão de Empresas, Assinaturas, Mercado Pago, NFS-e e Construtor Interno.
          </p>
        </div>

        <button
          onClick={loadMasterData}
          disabled={loading}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/20 transition flex items-center space-x-2 text-xs"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Sincronizar Dados</span>
        </button>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-2xl font-bold flex items-center space-x-3 shadow-md ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border border-rose-300 text-rose-900'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center space-x-2 whitespace-nowrap ${
            activeTab === 'dashboard'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white border text-slate-700 hover:bg-slate-50'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Visão Geral & Métricas</span>
        </button>

        <button
          onClick={() => setActiveTab('empresas')}
          className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center space-x-2 whitespace-nowrap ${
            activeTab === 'empresas'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white border text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Empresas & Assinaturas ({subscriptionsData.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('planos')}
          className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center space-x-2 whitespace-nowrap ${
            activeTab === 'planos'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white border text-slate-700 hover:bg-slate-50'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Planos & Preços ({plans.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('financeiro')}
          className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center space-x-2 whitespace-nowrap ${
            activeTab === 'financeiro'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white border text-slate-700 hover:bg-slate-50'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Cobranças & NFS-e ({invoices.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('construtor')}
          className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center space-x-2 whitespace-nowrap ${
            activeTab === 'construtor'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white border text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Construtor Master</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center space-x-2 whitespace-nowrap ${
            activeTab === 'settings'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white border text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Visual do Portal de Vagas</span>
        </button>
      </div>

      {/* TAB 1: VISÃO GERAL & METRICAS */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="font-semibold text-xs">MRR (Receita Recorrente)</span>
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900">
                R$ {totalMRR.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[10px] text-slate-500">Calculado sobre assinaturas ativas</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="font-semibold text-xs">Empresas Ativas</span>
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900">{activeSubsCount}</div>
              <p className="text-[10px] text-slate-500">{overdueSubsCount} pendentes/atrasadas</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="font-semibold text-xs">Faturas Processadas</span>
                <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900">{invoices.length}</div>
              <p className="text-[10px] text-slate-500">
                {invoices.filter(i => i.status === 'paga').length} pagas no sistema
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="font-semibold text-xs">NFS-e Emitidas</span>
                <FileCheck className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900">{nfeIssuedCount}</div>
              <p className="text-[10px] text-slate-500">Emissão automática e idempotente</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Ações Rápidas do Administrador Master</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => setShowInvoiceModal(true)}
                  className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl font-bold text-left hover:bg-blue-100 transition flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4 text-blue-600" />
                  <span>Gerar Cobrança MP</span>
                </button>

                <button
                  onClick={() => setShowPlanModal(true)}
                  className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-xl font-bold text-left hover:bg-indigo-100 transition flex items-center space-x-2"
                >
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  <span>Criar Novo Plano</span>
                </button>

                <button
                  onClick={() => handleSimulateWebhook('MP-PAY-TEST-001')}
                  className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl font-bold text-left hover:bg-emerald-100 transition flex items-center space-x-2"
                >
                  <Send className="w-4 h-4 text-emerald-600" />
                  <span>Simular Webhook MP</span>
                </button>

                <button
                  onClick={() => setActiveTab('construtor')}
                  className="p-3 bg-purple-50 border border-purple-200 text-purple-900 rounded-xl font-bold text-left hover:bg-purple-100 transition flex items-center space-x-2"
                >
                  <Wrench className="w-4 h-4 text-purple-600" />
                  <span>Construtor Interno</span>
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Visão de Assinaturas por Empresa</span>
              </h3>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {subscriptionsData.map(({ company, subscription, jobsCount }) => (
                  <div
                    key={company.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold block text-slate-900">{company.name}</span>
                      <span className="text-[10px] text-slate-500">
                        Plano: {subscription.planName} • Vagas abertas: {jobsCount}
                      </span>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        subscription.status === 'ativa'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {subscription.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EMPRESAS & ASSINATURAS */}
      {activeTab === 'empresas' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Gestão Multissociedade / Empresas Cadastradas</h3>
              <p className="text-slate-500 text-[11px]">
                Monitore o uso das empresas, cadastros, credenciais e módulos ativados.
              </p>
            </div>
            <button
              onClick={() => { setCompanyStep(1); setShowCompanyRegisterModal(true); }}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md flex items-center space-x-2 shrink-0 text-xs"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Cadastrar Nova Empresa</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b bg-slate-50 text-slate-700 font-bold">
                  <th className="p-3">Empresa / CNPJ</th>
                  <th className="p-3">Plano Atual</th>
                  <th className="p-3">Status Assinatura</th>
                  <th className="p-3">Vencimento</th>
                  <th className="p-3">Vagas</th>
                  <th className="p-3">Ações Master</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subscriptionsData.map(item => {
                  const { company, subscription, jobsCount } = item;
                  return (
                    <tr key={company.id} className="hover:bg-slate-50">
                      <td className="p-3 font-semibold">
                        <div className="font-bold text-slate-900">{company.name}</div>
                        <div className="text-[10px] text-slate-500">{company.cnpj || 'CNPJ não informado'}</div>
                      </td>

                      <td className="p-3">
                        <span className="font-bold text-blue-700">{subscription.planName}</span>
                        <div className="text-[10px] text-slate-500">
                          R$ {subscription.price}/mês ({subscription.billingCycle})
                        </div>
                      </td>

                      <td className="p-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-block ${
                            company.active && subscription.status === 'ativa'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {company.active ? subscription.status.toUpperCase() : 'BLOQUEADA'}
                        </span>
                      </td>

                      <td className="p-3 text-slate-600">
                        {new Date(subscription.nextBillingDate).toLocaleDateString('pt-BR')}
                      </td>

                      <td className="p-3 font-bold text-slate-900">{jobsCount} vagas</td>

                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleOpenEditCompany(item)}
                            className="px-3 py-1.5 rounded-lg font-bold text-[11px] bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition flex items-center space-x-1 shrink-0"
                            title="Editar empresa, credenciais, plano e módulos"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Editar</span>
                          </button>

                          <button
                            onClick={() => handleToggleCompanyStatus(company.id, company.active)}
                            className={`px-3 py-1.5 rounded-lg font-bold text-[11px] border transition flex items-center space-x-1 shrink-0 ${
                              company.active
                                ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            }`}
                          >
                            {company.active ? (
                              <>
                                <Lock className="w-3.5 h-3.5" />
                                <span>Bloquear</span>
                              </>
                            ) : (
                              <>
                                <Unlock className="w-3.5 h-3.5" />
                                <span>Ativar</span>
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PLANOS & PREÇOS */}
      {activeTab === 'planos' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200">
            <div>
              <h3 className="font-bold text-sm">Planos de Assinatura SaaS</h3>
              <p className="text-slate-500 text-[11px]">Gerencie limites de vagas, usuários e precificação.</p>
            </div>
            <button
              onClick={() => setShowPlanModal(true)}
              className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Novo Plano</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map(p => (
              <div
                key={p.id}
                className={`bg-white rounded-2xl p-6 border shadow-2xs space-y-4 flex flex-col justify-between relative ${
                  p.popular ? 'border-2 border-blue-600' : 'border-slate-200'
                }`}
              >
                {p.popular && (
                  <span className="absolute -top-3 right-4 bg-blue-600 text-white font-bold text-[10px] px-3 py-1 rounded-full uppercase">
                    Mais Vendido
                  </span>
                )}

                <div className="space-y-2">
                  <h4 className="text-base font-extrabold text-slate-900">{p.name}</h4>
                  <p className="text-slate-500 text-xs min-h-[36px]">{p.description}</p>

                  <div className="pt-2">
                    <span className="text-2xl font-black text-slate-900">R$ {p.priceMonthly}</span>
                    <span className="text-slate-500 font-semibold"> / mês</span>
                  </div>

                  <div className="text-[11px] text-slate-600 font-medium">
                    Opção Anual: R$ {p.priceAnnual}/ano
                  </div>

                  <div className="border-t pt-3 space-y-1.5 text-[11px]">
                    <div className="flex justify-between font-bold">
                      <span>Limite de Vagas:</span>
                      <span className="text-blue-700">{p.maxJobs === -1 ? 'Ilimitado' : `${p.maxJobs} vagas`}</span>
                    </div>

                    <div className="flex justify-between font-bold">
                      <span>Limite de Usuários:</span>
                      <span className="text-blue-700">{p.maxUsers} recrutadores</span>
                    </div>
                  </div>

                  <div className="border-t pt-3 space-y-1">
                    <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400">Recursos:</span>
                    <ul className="space-y-1 text-slate-700">
                      {p.features.map((feat, idx) => (
                        <li key={idx} className="flex items-center space-x-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t flex justify-end">
                  <button
                    onClick={() => {
                      setPlanForm(p);
                      setShowPlanModal(true);
                    }}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-xl text-center"
                  >
                    Editar Plano
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: COBRANÇAS & NFS-e */}
      {activeTab === 'financeiro' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Gestão de Cobranças Mercado Pago & Emissão de NFS-e</h3>
              <p className="text-slate-500 text-[11px]">
                Acompanhe liquidações, emita Notas Fiscais de Serviço e simule notificações de webhook.
              </p>
            </div>

            <button
              onClick={() => setShowInvoiceModal(true)}
              className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Gerar Cobrança MP</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b bg-slate-50 font-bold text-slate-700">
                  <th className="p-3">Fatura / Empresa</th>
                  <th className="p-3">Valor</th>
                  <th className="p-3">Método</th>
                  <th className="p-3">Status Pagamento</th>
                  <th className="p-3">Nota Fiscal (NFS-e)</th>
                  <th className="p-3">Ações Fiscal / Webhook</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{inv.id}</div>
                      <div className="text-[10px] text-slate-500">{inv.companyName}</div>
                    </td>

                    <td className="p-3 font-bold text-slate-900">
                      R$ {inv.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="p-3 font-semibold uppercase text-slate-700">{inv.paymentMethod}</td>

                    <td className="p-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          inv.status === 'paga'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {inv.status.toUpperCase()}
                      </span>
                    </td>

                    <td className="p-3">
                      {inv.nfeStatus === 'emitida' ? (
                        <div className="space-y-0.5">
                          <span className="font-bold text-emerald-700 flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{inv.nfeNumber}</span>
                          </span>
                          <span className="text-[10px] text-slate-400 block truncate max-w-[150px]">
                            Chave: {inv.nfeKey}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-semibold italic">Pendente emissão</span>
                      )}
                    </td>

                    <td className="p-3 space-x-2">
                      {inv.status === 'paga' && inv.nfeStatus !== 'emitida' && (
                        <button
                          onClick={() => handleIssueNfe(inv.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition"
                        >
                          Emitir NFS-e
                        </button>
                      )}

                      {inv.status === 'paga' && inv.nfeStatus === 'emitida' && (
                        <button
                          onClick={() => handleIssueNfe(inv.id)}
                          title="Testa a idempotência garantindo que não emite duplicado"
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg border"
                        >
                          Verificar Idempotência
                        </button>
                      )}

                      {inv.status === 'pendente' && (
                        <button
                          onClick={() => handleSimulateWebhook(inv.mercadopagoPaymentId || 'MP-PAY-SIM-99')}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition"
                        >
                          Simular Baixa
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: CONSTRUTOR MASTER INTERNO */}
      {activeTab === 'construtor' && builderConfig && (
        <form onSubmit={handleSaveBuilderConfig} className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-bold text-sm border-b pb-2 text-slate-900 flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              <span>1. Módulos & Recursos Habilitados na Plataforma</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(builderConfig.menuModules).map(([key, value]) => (
                <label
                  key={key}
                  className="p-3 bg-slate-50 border rounded-xl flex items-center justify-between cursor-pointer hover:bg-slate-100 transition"
                >
                  <span className="font-bold text-slate-800 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={e =>
                      setBuilderConfig(prev =>
                        prev
                          ? {
                              ...prev,
                              menuModules: { ...prev.menuModules, [key]: e.target.checked }
                            }
                          : null
                      )
                    }
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Mercado Pago Integration */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-bold text-sm border-b pb-2 text-slate-900 flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>2. Integração com Mercado Pago (PIX, Cartão & Boleto)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-semibold mb-1">Access Token do Mercado Pago</label>
                <input
                  type="text"
                  value={builderConfig.mercadopagoConfig.accessToken}
                  onChange={e =>
                    setBuilderConfig(prev =>
                      prev
                        ? {
                            ...prev,
                            mercadopagoConfig: { ...prev.mercadopagoConfig, accessToken: e.target.value }
                          }
                        : null
                    )
                  }
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Public Key do Mercado Pago</label>
                <input
                  type="text"
                  value={builderConfig.mercadopagoConfig.publicKey}
                  onChange={e =>
                    setBuilderConfig(prev =>
                      prev
                        ? {
                            ...prev,
                            mercadopagoConfig: { ...prev.mercadopagoConfig, publicKey: e.target.value }
                          }
                        : null
                    )
                  }
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div className="flex items-center space-x-4 pt-6">
                <label className="flex items-center space-x-2 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={builderConfig.mercadopagoConfig.sandboxMode}
                    onChange={e =>
                      setBuilderConfig(prev =>
                        prev
                          ? {
                              ...prev,
                              mercadopagoConfig: { ...prev.mercadopagoConfig, sandboxMode: e.target.checked }
                            }
                          : null
                      )
                    }
                    className="w-4 h-4 rounded"
                  />
                  <span>Modo Sandbox (Testes)</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={builderConfig.mercadopagoConfig.autoNfeOnPayment}
                    onChange={e =>
                      setBuilderConfig(prev =>
                        prev
                          ? {
                              ...prev,
                              mercadopagoConfig: { ...prev.mercadopagoConfig, autoNfeOnPayment: e.target.checked }
                            }
                          : null
                      )
                    }
                    className="w-4 h-4 rounded"
                  />
                  <span>Emitir NFS-e Automaticamente ao Confirmar Pagamento</span>
                </label>
              </div>
            </div>
          </div>

          {/* Provedor NFS-e Fiscal */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-bold text-sm border-b pb-2 text-slate-900 flex items-center space-x-2">
              <FileCheck className="w-4 h-4 text-amber-600" />
              <span>3. Provedor de Emissão de NFS-e (Fiscal)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">Provedor NFS-e</label>
                <select
                  value={builderConfig.nfeProviderConfig.providerName}
                  onChange={e =>
                    setBuilderConfig(prev =>
                      prev
                        ? {
                            ...prev,
                            nfeProviderConfig: {
                              ...prev.nfeProviderConfig,
                              providerName: e.target.value as any
                            }
                          }
                        : null
                    )
                  }
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                >
                  <option value="e-Notas">e-Notas API</option>
                  <option value="Focus NFe">Focus NFe API</option>
                  <option value="NFe.io">NFe.io API</option>
                  <option value="Prefeitura Direta">Prefeitura Direta (Abrasf)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Chave API / Secret do Provedor</label>
                <input
                  type="text"
                  value={builderConfig.nfeProviderConfig.apiKey}
                  onChange={e =>
                    setBuilderConfig(prev =>
                      prev
                        ? {
                            ...prev,
                            nfeProviderConfig: { ...prev.nfeProviderConfig, apiKey: e.target.value }
                          }
                        : null
                    )
                  }
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">CNPJ do Emissor Master</label>
                <input
                  type="text"
                  value={builderConfig.nfeProviderConfig.companyCnpj}
                  onChange={e =>
                    setBuilderConfig(prev =>
                      prev
                        ? {
                            ...prev,
                            nfeProviderConfig: { ...prev.nfeProviderConfig, companyCnpj: e.target.value }
                          }
                        : null
                    )
                  }
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Código de Serviço Municipal</label>
                <input
                  type="text"
                  value={builderConfig.nfeProviderConfig.serviceCode}
                  onChange={e =>
                    setBuilderConfig(prev =>
                      prev
                        ? {
                            ...prev,
                            nfeProviderConfig: { ...prev.nfeProviderConfig, serviceCode: e.target.value }
                          }
                        : null
                    )
                  }
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition flex items-center space-x-2 text-xs"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Construtor Master</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 6: CONFIGURAÇÕES VISUAIS DO PORTAL */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSavePortalSettingsForm} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold border-b pb-2 text-slate-900">
            Identidade, Banner, Contatos e LGPD do Portal de Vagas
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Nome do Portal Público</label>
              <input
                type="text"
                value={portalForm.portalName}
                onChange={e => setPortalForm(prev => ({ ...prev, portalName: e.target.value }))}
                className="w-full p-2.5 bg-slate-50 border rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">E-mail de Suporte</label>
              <input
                type="email"
                value={portalForm.emailContact}
                onChange={e => setPortalForm(prev => ({ ...prev, emailContact: e.target.value }))}
                className="w-full p-2.5 bg-slate-50 border rounded-xl"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold mb-1">Título do Banner Principal</label>
              <input
                type="text"
                value={portalForm.bannerTitle}
                onChange={e => setPortalForm(prev => ({ ...prev, bannerTitle: e.target.value }))}
                className="w-full p-2.5 bg-slate-50 border rounded-xl"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold mb-1">Subtítulo do Banner</label>
              <textarea
                rows={2}
                value={portalForm.bannerSubtitle}
                onChange={e => setPortalForm(prev => ({ ...prev, bannerSubtitle: e.target.value }))}
                className="w-full p-2.5 bg-slate-50 border rounded-xl"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition flex items-center space-x-2 text-xs"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Alterações do Portal</span>
            </button>
          </div>
        </form>
      )}

      {/* MODAL CRIAR/EDITAR PLANO */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">
              {planForm.id ? 'Editar Plano SaaS' : 'Criar Novo Plano SaaS'}
            </h3>

            <form onSubmit={handleSaveSaaSPlan} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Nome do Plano</label>
                <input
                  type="text"
                  required
                  value={planForm.name || ''}
                  onChange={e => setPlanForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Descrição Curta</label>
                <input
                  type="text"
                  value={planForm.description || ''}
                  onChange={e => setPlanForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Preço Mensal (R$)</label>
                  <input
                    type="number"
                    value={planForm.priceMonthly || 0}
                    onChange={e => setPlanForm(prev => ({ ...prev, priceMonthly: Number(e.target.value) }))}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Preço Anual (R$)</label>
                  <input
                    type="number"
                    value={planForm.priceAnnual || 0}
                    onChange={e => setPlanForm(prev => ({ ...prev, priceAnnual: Number(e.target.value) }))}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Limite de Vagas (-1 = ilimitado)</label>
                  <input
                    type="number"
                    value={planForm.maxJobs || 5}
                    onChange={e => setPlanForm(prev => ({ ...prev, maxJobs: Number(e.target.value) }))}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Limite de Usuários Recrutadores</label>
                  <input
                    type="number"
                    value={planForm.maxUsers || 2}
                    onChange={e => setPlanForm(prev => ({ ...prev, maxUsers: Number(e.target.value) }))}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  className="px-4 py-2 border rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold">
                  Salvar Plano
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL GERAR COBRANÇA */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Gerar Cobrança via Mercado Pago</h3>

            <form onSubmit={handleCreateInvoice} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Empresa Contratante</label>
                <select
                  required
                  value={invoiceForm.companyId}
                  onChange={e => setInvoiceForm(prev => ({ ...prev, companyId: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                >
                  <option value="">Selecione uma empresa...</option>
                  {subscriptionsData.map(s => (
                    <option key={s.company.id} value={s.company.id}>
                      {s.company.name} ({s.company.cnpj || 'Sem CNPJ'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Plano SaaS</label>
                <select
                  required
                  value={invoiceForm.planId}
                  onChange={e => setInvoiceForm(prev => ({ ...prev, planId: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                >
                  <option value="">Selecione o plano...</option>
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} — R$ {p.priceMonthly}/mês
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Periodicidade</label>
                  <select
                    value={invoiceForm.billingCycle}
                    onChange={e => setInvoiceForm(prev => ({ ...prev, billingCycle: e.target.value as any }))}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  >
                    <option value="mensal">Mensal</option>
                    <option value="anual">Anual</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Forma de Pagamento</label>
                  <select
                    value={invoiceForm.paymentMethod}
                    onChange={e => setInvoiceForm(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  >
                    <option value="pix">PIX Instântaneo</option>
                    <option value="boleto">Boleto Bancário</option>
                    <option value="cartao_credito">Cartão de Crédito</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(false)}
                  className="px-4 py-2 border rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold">
                  Gerar Cobrança
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL QR CODE PIX / FATURA GERADA */}
      {selectedInvoiceForQr && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-center">
            <h3 className="text-base font-bold text-slate-900">Cobrança Gerada — Mercado Pago</h3>
            <p className="text-slate-500 text-xs">{selectedInvoiceForQr.companyName}</p>

            <div className="p-4 bg-slate-50 border rounded-2xl space-y-2">
              <div className="text-2xl font-black text-slate-900">
                R$ {selectedInvoiceForQr.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold inline-block">
                AGUARDANDO PAGAMENTO
              </span>
            </div>

            {selectedInvoiceForQr.pixQrCode && (
              <div className="space-y-2">
                <p className="font-bold text-xs text-slate-700">Copia e Cola PIX:</p>
                <textarea
                  readOnly
                  rows={3}
                  value={selectedInvoiceForQr.pixQrCode}
                  className="w-full text-[10px] font-mono p-2 bg-slate-100 border rounded-xl text-slate-700"
                />
              </div>
            )}

            <button
              onClick={() => setSelectedInvoiceForQr(null)}
              className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-xl"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* MODAL CADASTRAR NOVA EMPRESA E MÓDULOS */}
      {showCompanyRegisterModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8 border border-slate-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Cadastrar Nova Empresa & Credenciais</h3>
                  <p className="text-slate-500 text-xs">Configure o cadastro, credenciais de login e os módulos do RL RH Connect.</p>
                </div>
              </div>
              <button
                onClick={() => setShowCompanyRegisterModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-2 hover:bg-slate-100 rounded-xl"
              >
                ✕
              </button>
            </div>

            {/* Stepper Tabs */}
            <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
              <button
                type="button"
                onClick={() => setCompanyStep(1)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
                  companyStep === 1 ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>1. Dados da Empresa</span>
              </button>
              <button
                type="button"
                onClick={() => setCompanyStep(2)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
                  companyStep === 2 ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>2. Login & Senha</span>
              </button>
              <button
                type="button"
                onClick={() => setCompanyStep(3)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
                  companyStep === 3 ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>3. Plano & Módulos</span>
              </button>
            </div>

            <form onSubmit={handleRegisterCompanySubmit} className="space-y-5">
              {/* PASSO 1: DADOS DA EMPRESA */}
              {companyStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nome da Empresa / Razão Social *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Grupo RL Soluções em RH Ltda"
                        value={companyRegisterForm.name}
                        onChange={e => setCompanyRegisterForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nome Fantasia
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: RL RH Connect"
                        value={companyRegisterForm.tradeName}
                        onChange={e => setCompanyRegisterForm(prev => ({ ...prev, tradeName: e.target.value }))}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        CNPJ
                      </label>
                      <input
                        type="text"
                        placeholder="00.000.000/0001-00"
                        value={companyRegisterForm.cnpj}
                        onChange={e => setCompanyRegisterForm(prev => ({ ...prev, cnpj: e.target.value }))}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Cidade
                      </label>
                      <input
                        type="text"
                        placeholder="São Paulo"
                        value={companyRegisterForm.city}
                        onChange={e => setCompanyRegisterForm(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Estado (UF)
                      </label>
                      <input
                        type="text"
                        placeholder="SP"
                        maxLength={2}
                        value={companyRegisterForm.state}
                        onChange={e => setCompanyRegisterForm(prev => ({ ...prev, state: e.target.value.toUpperCase() }))}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500 uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Descrição ou Observações da Empresa
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Empresa do segmento de logística e transporte..."
                      value={companyRegisterForm.description}
                      onChange={e => setCompanyRegisterForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setCompanyStep(2)}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition shadow-md flex items-center space-x-2"
                    >
                      <span>Acesso & Credenciais</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* PASSO 2: LOGIN E SENHA */}
              {companyStep === 2 && (
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-center space-x-3 text-blue-900 text-xs">
                    <Key className="w-5 h-5 text-blue-600 shrink-0" />
                    <span>Estes dados serão utilizados pelo cliente/administrador para fazer login no portal da empresa.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nome do Administrador Principal
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Carlos Santos"
                      value={companyRegisterForm.adminName}
                      onChange={e => setCompanyRegisterForm(prev => ({ ...prev, adminName: e.target.value }))}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      E-mail de Login do Administrador *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="carlos@empresa.com.br"
                      value={companyRegisterForm.adminEmail}
                      onChange={e => setCompanyRegisterForm(prev => ({ ...prev, adminEmail: e.target.value }))}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Senha de Acesso do Administrador *
                      </label>
                      <button
                        type="button"
                        onClick={generateRandomPassword}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Gerar Senha Segura</span>
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Digite a senha..."
                        value={companyRegisterForm.adminPassword}
                        onChange={e => setCompanyRegisterForm(prev => ({ ...prev, adminPassword: e.target.value }))}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:bg-white focus:ring-2 focus:ring-blue-500 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Perfil / Nível de Acesso
                    </label>
                    <select
                      value={companyRegisterForm.adminRole}
                      onChange={e => setCompanyRegisterForm(prev => ({ ...prev, adminRole: e.target.value }))}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="admin">Administrador Geral (Total Acesso)</option>
                      <option value="rh">Gestor de RH & Recrutamento</option>
                      <option value="dp">Administrador de DP & Ponto</option>
                      <option value="headhunter">Headhunter Autorizado</option>
                    </select>
                  </div>

                  <div className="flex justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setCompanyStep(1)}
                      className="px-4 py-2 border border-slate-200 font-bold rounded-xl text-xs text-slate-600 hover:bg-slate-50"
                    >
                      &larr; Voltar
                    </button>
                    <button
                      type="button"
                      onClick={() => setCompanyStep(3)}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition shadow-md flex items-center space-x-2"
                    >
                      <span>Módulos & Plano</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* PASSO 3: PLANO E MÓDULOS */}
              {companyStep === 3 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Plano SaaS Contratado
                      </label>
                      <select
                        value={companyRegisterForm.planId}
                        onChange={e => setCompanyRegisterForm(prev => ({ ...prev, planId: e.target.value }))}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500"
                      >
                        {plans.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} — R$ {p.priceMonthly}/mês
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Ciclo de Faturamento
                      </label>
                      <select
                        value={companyRegisterForm.billingCycle}
                        onChange={e => setCompanyRegisterForm(prev => ({ ...prev, billingCycle: e.target.value as any }))}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="mensal">Mensal</option>
                        <option value="anual">Anual (Desconto)</option>
                      </select>
                    </div>
                  </div>

                  {/* PRESETS DE MÓDULOS */}
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <label className="block text-xs font-bold text-slate-900">
                        Módulos Liberados para esta Empresa ({companyRegisterForm.modules.length} de {ALL_SYSTEM_MODULES.length})
                      </label>
                      <div className="flex items-center space-x-2 text-[10px] font-bold">
                        <button
                          type="button"
                          onClick={() => handleSelectPresetModules('all')}
                          className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200"
                        >
                          Liberar Todos (Enterprise)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSelectPresetModules('recruitment')}
                          className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                        >
                          Apenas R&S
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSelectPresetModules('dp')}
                          className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                        >
                          Apenas DP
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto p-2 bg-slate-50 border rounded-2xl">
                      {ALL_SYSTEM_MODULES.map(m => {
                        const isChecked = companyRegisterForm.modules.includes(m.id);
                        return (
                          <div
                            key={m.id}
                            onClick={() => handleToggleModule(m.id)}
                            className={`p-2.5 rounded-xl border transition cursor-pointer flex items-start space-x-2.5 select-none ${
                              isChecked
                                ? 'bg-white border-blue-500 shadow-2xs'
                                : 'bg-slate-100/60 border-slate-200 text-slate-400 opacity-60 hover:opacity-100'
                            }`}
                          >
                            <div className="pt-0.5">
                              {isChecked ? (
                                <CheckSquare className="w-4 h-4 text-blue-600 shrink-0" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-400 shrink-0" />
                              )}
                            </div>
                            <div className="leading-tight">
                              <div className="flex items-center space-x-1.5">
                                <span className="font-bold text-xs text-slate-900">{m.name}</span>
                              </div>
                              <span className="text-[10px] text-slate-500 block mt-0.5">{m.desc}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-between pt-3">
                    <button
                      type="button"
                      onClick={() => setCompanyStep(2)}
                      className="px-4 py-2 border border-slate-200 font-bold rounded-xl text-xs text-slate-600 hover:bg-slate-50"
                    >
                      &larr; Voltar
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shadow-md flex items-center space-x-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{loading ? 'Cadastrando Empresa...' : 'Cadastrar Empresa & Salvar'}</span>
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETALHES E CREDENCIAIS DA NOVA EMPRESA CADASTRADA */}
      {newlyCreatedCompanyDetails && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-emerald-100 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center font-black text-2xl shadow-inner">
              ✓
            </div>

            <div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-extrabold uppercase tracking-wider inline-block mb-2">
                Empresa e Acesso Cadastrados!
              </span>
              <h3 className="text-xl font-extrabold text-slate-900">
                {newlyCreatedCompanyDetails.company.name}
              </h3>
              <p className="text-slate-500 text-xs mt-1">
                A conta da empresa já está ativa e pronta para uso com todos os módulos selecionados.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500 font-sans font-bold">E-mail de Login:</span>
                <span className="font-bold text-slate-900">{newlyCreatedCompanyDetails.user.email}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500 font-sans font-bold">Senha de Acesso:</span>
                <span className="font-bold text-blue-600">{newlyCreatedCompanyDetails.user.password || '******'}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500 font-sans font-bold">Plano Contratado:</span>
                <span className="font-sans font-bold text-slate-900">{newlyCreatedCompanyDetails.subscription.planName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans font-bold">Módulos Habilitados:</span>
                <span className="font-sans font-bold text-emerald-700">
                  {newlyCreatedCompanyDetails.company.modules?.length || 16} Módulos Liberados
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  const text = `RL RH CONNECT - CREDENCIAIS DE ACESSO\nEmpresa: ${newlyCreatedCompanyDetails.company.name}\nLogin: ${newlyCreatedCompanyDetails.user.email}\nSenha: ${newlyCreatedCompanyDetails.user.password}\nPlano: ${newlyCreatedCompanyDetails.subscription.planName}`;
                  navigator.clipboard.writeText(text);
                  setCopiedCreds(true);
                  setTimeout(() => setCopiedCreds(false), 3000);
                }}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center space-x-2 shadow-md"
              >
                <Copy className="w-4 h-4" />
                <span>{copiedCreds ? '✓ Credenciais Copiadas!' : 'Copiar Credenciais de Acesso'}</span>
              </button>

              <button
                onClick={() => setNewlyCreatedCompanyDetails(null)}
                className="w-full py-2.5 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-50 transition"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR EMPRESA & CREDENCIAIS */}
      {showEditCompanyModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8 border border-slate-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Editar Cadastro da Empresa</h3>
                  <p className="text-slate-500 text-xs">Atualize dados cadastrais, credenciais de login e módulos ativados.</p>
                </div>
              </div>
              <button
                onClick={() => setShowEditCompanyModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-2 hover:bg-slate-100 rounded-xl"
              >
                ✕
              </button>
            </div>

            {/* Stepper Tabs */}
            <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
              <button
                type="button"
                onClick={() => setEditCompanyStep(1)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
                  editCompanyStep === 1 ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>1. Dados da Empresa</span>
              </button>
              <button
                type="button"
                onClick={() => setEditCompanyStep(2)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
                  editCompanyStep === 2 ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>2. Login & Senha</span>
              </button>
              <button
                type="button"
                onClick={() => setEditCompanyStep(3)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
                  editCompanyStep === 3 ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>3. Plano & Módulos</span>
              </button>
            </div>

            <form onSubmit={handleUpdateCompanySubmit} className="space-y-5">
              {/* PASSO 1: DADOS DA EMPRESA */}
              {editCompanyStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nome da Empresa / Razão Social *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Grupo RL Soluções em RH Ltda"
                        value={editCompanyForm.name}
                        onChange={e => setEditCompanyForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nome Fantasia
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: RL RH Connect"
                        value={editCompanyForm.tradeName}
                        onChange={e => setEditCompanyForm(prev => ({ ...prev, tradeName: e.target.value }))}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        CNPJ
                      </label>
                      <input
                        type="text"
                        placeholder="00.000.000/0001-00"
                        value={editCompanyForm.cnpj}
                        onChange={e => setEditCompanyForm(prev => ({ ...prev, cnpj: e.target.value }))}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Cidade
                      </label>
                      <input
                        type="text"
                        placeholder="São Paulo"
                        value={editCompanyForm.city}
                        onChange={e => setEditCompanyForm(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Estado (UF)
                      </label>
                      <input
                        type="text"
                        placeholder="SP"
                        maxLength={2}
                        value={editCompanyForm.state}
                        onChange={e => setEditCompanyForm(prev => ({ ...prev, state: e.target.value.toUpperCase() }))}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500 uppercase"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Status do Acesso da Empresa
                      </label>
                      <select
                        value={editCompanyForm.active ? 'active' : 'blocked'}
                        onChange={e => setEditCompanyForm(prev => ({ ...prev, active: e.target.value === 'active' }))}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="active">🟢 Ativa & Liberada</option>
                        <option value="blocked">🔴 Bloqueada (Suspenso)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Descrição / Observações Internas
                      </label>
                      <input
                        type="text"
                        placeholder="Observações do contrato ou conta..."
                        value={editCompanyForm.description}
                        onChange={e => setEditCompanyForm(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setEditCompanyStep(2)}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition shadow-md flex items-center space-x-2"
                    >
                      <span>Acesso & Credenciais</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* PASSO 2: LOGIN E SENHA */}
              {editCompanyStep === 2 && (
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-center space-x-3 text-blue-900 text-xs">
                    <Key className="w-5 h-5 text-blue-600 shrink-0" />
                    <span>Atualize o login, senha e permissões do administrador desta empresa.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nome do Administrador Principal
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Carlos Santos"
                      value={editCompanyForm.adminName}
                      onChange={e => setEditCompanyForm(prev => ({ ...prev, adminName: e.target.value }))}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      E-mail de Login do Administrador *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="carlos@empresa.com.br"
                      value={editCompanyForm.adminEmail}
                      onChange={e => setEditCompanyForm(prev => ({ ...prev, adminEmail: e.target.value }))}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Nova Senha de Acesso (opcional)
                      </label>
                      <button
                        type="button"
                        onClick={generateRandomEditPassword}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Gerar Senha Segura</span>
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showEditPassword ? 'text' : 'password'}
                        placeholder="Digite uma nova senha..."
                        value={editCompanyForm.adminPassword}
                        onChange={e => setEditCompanyForm(prev => ({ ...prev, adminPassword: e.target.value }))}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:bg-white focus:ring-2 focus:ring-blue-500 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowEditPassword(!showEditPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                      >
                        {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Perfil / Nível de Acesso
                    </label>
                    <select
                      value={editCompanyForm.adminRole}
                      onChange={e => setEditCompanyForm(prev => ({ ...prev, adminRole: e.target.value }))}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="admin">Administrador Geral (Total Acesso)</option>
                      <option value="rh">Gestor de RH & Recrutamento</option>
                      <option value="dp">Administrador de DP & Ponto</option>
                      <option value="headhunter">Headhunter Autorizado</option>
                    </select>
                  </div>

                  <div className="flex justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setEditCompanyStep(1)}
                      className="px-4 py-2 border border-slate-200 font-bold rounded-xl text-xs text-slate-600 hover:bg-slate-50"
                    >
                      &larr; Voltar
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditCompanyStep(3)}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition shadow-md flex items-center space-x-2"
                    >
                      <span>Módulos & Plano</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* PASSO 3: PLANO E MÓDULOS */}
              {editCompanyStep === 3 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Plano SaaS Contratado
                      </label>
                      <select
                        value={editCompanyForm.planId}
                        onChange={e => setEditCompanyForm(prev => ({ ...prev, planId: e.target.value }))}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500"
                      >
                        {plans.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} — R$ {p.priceMonthly}/mês
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Ciclo de Faturamento
                      </label>
                      <select
                        value={editCompanyForm.billingCycle}
                        onChange={e => setEditCompanyForm(prev => ({ ...prev, billingCycle: e.target.value as any }))}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="mensal">Mensal</option>
                        <option value="anual">Anual (Desconto)</option>
                      </select>
                    </div>
                  </div>

                  {/* PRESETS DE MÓDULOS */}
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <label className="block text-xs font-bold text-slate-900">
                        Módulos Liberados para esta Empresa ({editCompanyForm.modules.length} de {ALL_SYSTEM_MODULES.length})
                      </label>
                      <div className="flex items-center space-x-2 text-[10px] font-bold">
                        <button
                          type="button"
                          onClick={() => handleSelectEditPresetModules('all')}
                          className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200"
                        >
                          Liberar Todos (Enterprise)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSelectEditPresetModules('recruitment')}
                          className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                        >
                          Apenas R&S
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSelectEditPresetModules('dp')}
                          className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                        >
                          Apenas DP
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto p-2 bg-slate-50 border rounded-2xl">
                      {ALL_SYSTEM_MODULES.map(m => {
                        const isChecked = editCompanyForm.modules.includes(m.id);
                        return (
                          <div
                            key={m.id}
                            onClick={() => handleToggleEditModule(m.id)}
                            className={`p-2.5 rounded-xl border transition cursor-pointer flex items-start space-x-2.5 select-none ${
                              isChecked
                                ? 'bg-white border-blue-500 shadow-2xs'
                                : 'bg-slate-100/60 border-slate-200 text-slate-400 opacity-60 hover:opacity-100'
                            }`}
                          >
                            <div className="pt-0.5">
                              {isChecked ? (
                                <CheckSquare className="w-4 h-4 text-blue-600 shrink-0" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-400 shrink-0" />
                              )}
                            </div>
                            <div className="leading-tight">
                              <div className="flex items-center space-x-1.5">
                                <span className="font-bold text-xs text-slate-900">{m.name}</span>
                              </div>
                              <span className="text-[10px] text-slate-500 block mt-0.5">{m.desc}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-between pt-3">
                    <button
                      type="button"
                      onClick={() => setEditCompanyStep(2)}
                      className="px-4 py-2 border border-slate-200 font-bold rounded-xl text-xs text-slate-600 hover:bg-slate-50"
                    >
                      &larr; Voltar
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition shadow-md flex items-center space-x-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{loading ? 'Salvando Alterações...' : 'Salvar Alterações da Empresa'}</span>
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

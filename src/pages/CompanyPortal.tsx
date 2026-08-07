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
  ArrowRight
} from 'lucide-react';
import { CompanyUser, Company, Job, Application, Candidate, CandidateDocument } from '../types';
import { CandidateSideDrawer } from '../components/CandidateSideDrawer';
import { formatCPF, maskCPFForPrivacy } from '../utils/cpf';

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

  // Active view inside Company Panel
  const [activeMenu, setActiveMenu] = useState<
    'dashboard' | 'recrutamento' | 'vagas' | 'candidatos' | 'banco-de-talentos' | 'entrevistas' | 'relatorios' | 'configuracoes'
  >('vagas');

  // Jobs state
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // Job Applications list state (Columns/Table)
  const [applications, setApplications] = useState<
    (Application & { candidate?: Candidate; documentsCount?: number })[]
  >([]);

  // Side Drawer Candidate Profile ID
  const [drawerAppId, setDrawerAppId] = useState<string | null>(null);

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

  useEffect(() => {
    if (currentUser) {
      fetchCompanyJobs();
    }
  }, [currentUser, companyId]);

  useEffect(() => {
    if (selectedJobId && currentUser) {
      fetchApplicationsForJob(selectedJobId);
    }
  }, [selectedJobId, currentUser]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Falha na autenticação.');

      onLogin(data.user, data.company);
    } catch (err: any) {
      setLoginError(err.message || 'E-mail não cadastrado.');
    }
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
              Contas de Demonstração Rápidas:
            </span>
            <button
              type="button"
              onClick={() => setEmailInput('rh@logisticabrasil.com.br')}
              className="w-full text-left px-2.5 py-1.5 bg-white border rounded-lg hover:border-blue-500 font-medium text-slate-800 block truncate"
            >
              🏢 Logística Brasil Express (Empresa A)
            </button>
            <button
              type="button"
              onClick={() => setEmailInput('recrutamento@inovatech.com.br')}
              className="w-full text-left px-2.5 py-1.5 bg-white border rounded-lg hover:border-blue-500 font-medium text-slate-800 block truncate"
            >
              💻 InovaTech Software (Empresa B - Isolamento)
            </button>
            <button
              type="button"
              onClick={() => setEmailInput('master@rlrhconnect.com')}
              className="w-full text-left px-2.5 py-1.5 bg-blue-50 border border-blue-300 rounded-lg font-bold text-blue-900 block truncate"
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

  // --- LOGGED IN: ENTERPRISE PANEL DASHBOARD ---
  const currentJobObj = jobs.find(j => j.id === selectedJobId);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Company Header Bar */}
      <div className="bg-slate-900 text-white px-4 py-3 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-white leading-tight">
              {currentCompany?.name || 'RL RH Connect Master'}
            </h1>
            <span className="text-[11px] text-blue-300">
              Usuário: {currentUser.name} ({currentUser.role.toUpperCase()})
            </span>
          </div>
        </div>

        {/* Multi-Company Switcher Quick Test */}
        <div className="flex items-center space-x-2">
          <span className="text-slate-400 hidden md:inline">Alternar Empresa:</span>
          <select
            value={currentUser.companyId}
            onChange={e => {
              if (e.target.value === 'comp-01')
                onLogin(
                  {
                    id: 'usr-comp1',
                    email: 'rh@logisticabrasil.com.br',
                    name: 'Mariana Silva',
                    companyId: 'comp-01',
                    role: 'admin'
                  },
                  {
                    id: 'comp-01',
                    name: 'Logística Brasil Express',
                    city: 'São Paulo',
                    state: 'SP',
                    active: true,
                    createdAt: ''
                  }
                );
              else if (e.target.value === 'comp-02')
                onLogin(
                  {
                    id: 'usr-comp2',
                    email: 'recrutamento@inovatech.com.br',
                    name: 'Carlos Eduardo',
                    companyId: 'comp-02',
                    role: 'recruiter'
                  },
                  {
                    id: 'comp-02',
                    name: 'InovaTech Software',
                    city: 'Florianópolis',
                    state: 'SC',
                    active: true,
                    createdAt: ''
                  }
                );
              else
                onLogin(
                  {
                    id: 'usr-master',
                    email: 'master@rlrhconnect.com',
                    name: 'Admin Master',
                    companyId: 'master',
                    role: 'master'
                  },
                  null
                );
            }}
            className="bg-slate-800 border border-slate-700 text-white font-semibold rounded-lg px-2.5 py-1 text-xs"
          >
            <option value="comp-01">Logística Brasil Express</option>
            <option value="comp-02">InovaTech Software</option>
            <option value="master">ADMIN MASTER (Global)</option>
          </select>

          <button
            onClick={onLogout}
            className="px-3 py-1 bg-rose-600/80 hover:bg-rose-600 text-white rounded-lg font-semibold"
          >
            Sair
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Menu */}
        <aside className="w-56 bg-white border-r border-slate-200 p-4 hidden md:flex flex-col space-y-1 text-xs shrink-0">
          {[
            { id: 'vagas', label: 'Vagas & Candidatos', icon: Briefcase },
            { id: 'banco-de-talentos', label: 'Banco de Talentos', icon: Users },
            { id: 'entrevistas', label: 'Agenda de Entrevistas', icon: Calendar },
            { id: 'relatorios', label: 'Relatórios & Métricas', icon: BarChart2 }
          ].map(m => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => setActiveMenu(m.id as any)}
                className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl font-bold transition-all text-left ${
                  activeMenu === m.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{m.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {/* MENU: VAGAS & CANDIDATOS POR VAGA */}
          {activeMenu === 'vagas' && (
            <div className="space-y-6">
              {/* Top Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    Recrutamento → Candidatos por Vaga
                  </h2>
                  <p className="text-xs text-slate-500">
                    Empresa: {currentCompany?.name || 'Visão Global Admin Master'}
                  </p>
                </div>

                <button
                  onClick={() => setShowJobModal(true)}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center space-x-2 shrink-0 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Criar Nova Vaga</span>
                </button>
              </div>

              {/* Vaga Selector & Stats Bar */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-700">Selecione a Vaga:</span>
                    <select
                      value={selectedJobId || ''}
                      onChange={e => setSelectedJobId(e.target.value)}
                      className="bg-slate-50 border border-slate-300 font-bold text-slate-900 text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 max-w-md"
                    >
                      {jobs.map(j => (
                        <option key={j.id} value={j.id}>
                          {j.title} ({j.city}/{j.state}) — {j.openingsCount} vagas
                        </option>
                      ))}
                    </select>
                  </div>

                  {currentJobObj && (
                    <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg">
                        Status: {currentJobObj.status.toUpperCase()}
                      </span>
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg">
                        Candidatos: {applications.length}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* CANDIDATES TABLE / LIST VIEW (SECTION 29: COLUMNS) */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">
                    Candidatos Inscritos ({applications.length})
                  </h3>
                  <span className="text-xs text-slate-400">
                    Visualização em lista sequencial
                  </span>
                </div>

                {applications.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 space-y-2">
                    <Users className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs font-semibold text-slate-700">
                      Nenhum candidato inscrito nesta vaga até o momento.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                        <tr>
                          <th className="p-3.5">Candidato</th>
                          <th className="p-3.5">Cidade</th>
                          <th className="p-3.5">Data Inscrição</th>
                          <th className="p-3.5">Currículo</th>
                          <th className="p-3.5">Anexos</th>
                          <th className="p-3.5">Triagem IA</th>
                          <th className="p-3.5">Etapa Actual</th>
                          <th className="p-3.5 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {applications.map(app => (
                          <tr
                            key={app.id}
                            className="hover:bg-blue-50/40 transition-colors cursor-pointer"
                            onClick={() => setDrawerAppId(app.id)}
                          >
                            <td className="p-3.5 font-bold text-slate-900">
                              <div className="flex items-center space-x-2">
                                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                                  {app.candidate?.name?.charAt(0) || 'C'}
                                </div>
                                <div>
                                  <span className="block">{app.candidate?.name}</span>
                                  <span className="text-[10px] text-slate-400 font-normal">
                                    CPF: {maskCPFForPrivacy(app.candidate?.cpf || '')}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="p-3.5">
                              {app.candidate?.city}/{app.candidate?.state}
                            </td>

                            <td className="p-3.5">
                              {new Date(app.createdAt).toLocaleDateString('pt-BR')}
                            </td>

                            <td className="p-3.5 font-semibold text-blue-600">
                              {app.candidate?.resumeUrl ? '✓ Anetado' : 'Ausente'}
                            </td>

                            <td className="p-3.5 font-medium text-slate-600">
                              {app.documentsCount || 0} arquivos
                            </td>

                            <td className="p-3.5">
                              <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                {app.aiScore || 85}%
                              </span>
                            </td>

                            <td className="p-3.5">
                              <span className="font-bold uppercase text-[10px] px-2 py-1 bg-blue-100 text-blue-800 rounded-md">
                                {app.stage}
                              </span>
                            </td>

                            <td className="p-3.5 text-right">
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  setDrawerAppId(app.id);
                                }}
                                className="px-2.5 py-1.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                Abrir Perfil
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* OTHER MENUS: BANCO DE TALENTOS */}
          {activeMenu === 'banco-de-talentos' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Banco de Talentos Geral</h2>
              <p className="text-xs text-slate-500">
                Pesquise profissionais cadastrados que aceitaram disponibilizar seus perfis.
              </p>
              <div className="bg-white rounded-2xl p-6 border border-slate-200">
                <p className="text-xs text-slate-600">
                  Acesso ao repositório completo com busca de currículos e competências ativas.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* CANDIDATE SIDE DRAWER */}
      {drawerAppId && (
        <CandidateSideDrawer
          applicationId={drawerAppId}
          companyId={companyId}
          onClose={() => setDrawerAppId(null)}
          onUpdateStage={() => fetchApplicationsForJob(selectedJobId || '')}
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
    </div>
  );
};

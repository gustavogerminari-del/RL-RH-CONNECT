import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  Grid,
  List,
  Eye,
  Users,
  Edit,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  MapPin,
  Building2,
  Calendar,
  Sparkles,
  ChevronLeft,
  X,
  FileText,
  ShieldAlert,
  UserCheck,
  Building,
  Award,
  AlertCircle
} from 'lucide-react';
import { Job, Application, Candidate } from '../../types';
import { CandidateSideDrawer } from '../CandidateSideDrawer';

interface Props {
  companyId: string;
  userRole?: string;
  onNavigateMenu?: (menu: string) => void;
}

export const RecrutamentoVagasView: React.FC<Props> = ({ companyId, userRole = 'admin', onNavigateMenu }) => {
  // Permission check for commercial fields
  const canViewCommercial = userRole === 'admin' || userRole === 'master' || userRole === 'commercial' || userRole === 'director';

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  // View Mode: Cards or Table List
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todas');
  const [contractTypeFilter, setContractTypeFilter] = useState('todos');
  const [originFilter, setOriginFilter] = useState('todas');
  const [includeArchived, setIncludeArchived] = useState(false);

  // Selected Job for Candidate Management Mode
  const [managingJob, setManagingJob] = useState<Job | null>(null);
  const [jobApplications, setJobApplications] = useState<any[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [appSubTab, setAppSubTab] = useState<'inscritos' | 'banco_ia'>('inscritos');

  // Selected Job for Details Modal
  const [detailsJob, setDetailsJob] = useState<Job | null>(null);

  // Job Form Modal State (Creation & Editing)
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  // New Requirement Input for Form
  const [reqInput, setReqInput] = useState('');

  // Official Single Form State
  const [jobForm, setJobForm] = useState({
    title: '',
    department: '',
    area: 'Administrativo',
    city: '',
    state: '',
    workMode: 'Presencial' as any,
    contractType: 'CLT' as any,
    status: 'aberta' as any,
    openingsCount: 1,
    deadline: '',
    salaryRange: '',
    description: '',
    requirements: [] as string[],
    recruiterName: '',
    managerName: '',
    centerCostCode: '',
    origin: 'vaga_interna' as 'vaga_interna' | 'recrutamento_cliente' | 'headhunter',
    clientName: '',
    clientId: '',
    billingRule: '',
    feePercent: '',
    negotiatedValue: '',
    paymentDeadline: '',
    commercialResponsible: '',
    paymentStatus: 'Aguardando contratação' as any,
    commercialNotes: '',
    published: true
  });

  // Candidate Side Drawer
  const [drawerAppId, setDrawerAppId] = useState<string | null>(null);

  // Talent Bank IA Matching State inside Job
  const [talentBankCandidates, setTalentBankCandidates] = useState<Candidate[]>([]);
  const [talentSearch, setTalentSearch] = useState('');
  const [addingCandidateId, setAddingCandidateId] = useState<string | null>(null);

  // Fetch Jobs
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/company/jobs?companyId=${companyId}`);
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
      }
    } catch (e) {
      console.error('Erro ao buscar vagas:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [companyId]);

  // Fetch Applications when a job is selected for Candidate Management
  const fetchJobApplications = async (jobId: string) => {
    setLoadingApps(true);
    try {
      const res = await fetch(`/api/company/jobs/${jobId}/applications?companyId=${companyId}`);
      if (res.ok) {
        const data = await res.json();
        setJobApplications(data.applications || []);
      }
    } catch (e) {
      console.error('Erro ao buscar candidaturas da vaga:', e);
    } finally {
      setLoadingApps(false);
    }
  };

  // Fetch Talent Bank Candidates
  const fetchTalentBank = async () => {
    try {
      const res = await fetch(`/api/company/talent-bank`);
      if (res.ok) {
        const data = await res.json();
        setTalentBankCandidates(data.candidates || []);
      }
    } catch (e) {
      console.error('Erro ao buscar Banco de Talentos:', e);
    }
  };

  useEffect(() => {
    if (managingJob && appSubTab === 'banco_ia') {
      fetchTalentBank();
    }
  }, [managingJob, appSubTab]);

  // Open Form for Creating
  const handleOpenCreateForm = () => {
    setEditingJob(null);
    setJobForm({
      title: '',
      department: '',
      area: 'Administrativo',
      city: 'São Paulo',
      state: 'SP',
      workMode: 'Presencial',
      contractType: 'CLT',
      status: 'aberta',
      openingsCount: 1,
      deadline: '',
      salaryRange: '',
      description: '',
      requirements: ['Ensino Médio completo', 'Experiência prévia na função'],
      recruiterName: '',
      managerName: '',
      centerCostCode: '',
      origin: 'vaga_interna',
      clientName: '',
      clientId: '',
      billingRule: '',
      feePercent: '',
      negotiatedValue: '',
      paymentDeadline: '',
      commercialResponsible: '',
      paymentStatus: 'Aguardando contratação',
      commercialNotes: '',
      published: true
    });
    setReqInput('');
    setShowJobModal(true);
  };

  // Open Form for Editing
  const handleOpenEditForm = (job: Job) => {
    setEditingJob(job);
    setJobForm({
      title: job.title || '',
      department: job.department || job.area || '',
      area: job.area || 'Administrativo',
      city: job.city || '',
      state: job.state || '',
      workMode: job.workMode || 'Presencial',
      contractType: job.contractType || 'CLT',
      status: job.status || 'aberta',
      openingsCount: job.openingsCount || 1,
      deadline: job.deadline || '',
      salaryRange: job.salaryRange || '',
      description: job.description || '',
      requirements: job.requirements?.length ? [...job.requirements] : ['Requisito da Vaga'],
      recruiterName: job.recruiterName || '',
      managerName: job.managerName || '',
      centerCostCode: job.centerCostCode || '',
      origin: (job.origin as any) || 'vaga_interna',
      clientName: job.clientName || '',
      clientId: job.clientId || '',
      billingRule: job.billingRule || '',
      feePercent: job.feePercent !== undefined ? String(job.feePercent) : '',
      negotiatedValue: job.negotiatedValue !== undefined ? String(job.negotiatedValue) : '',
      paymentDeadline: job.paymentDeadline || '',
      commercialResponsible: job.commercialResponsible || '',
      paymentStatus: job.paymentStatus || 'Aguardando contratação',
      commercialNotes: job.commercialNotes || '',
      published: job.published !== undefined ? job.published : true
    });
    setReqInput('');
    setShowJobModal(true);
  };

  // Save Job Handler
  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!jobForm.title.trim()) {
      alert('Por favor, informe o Cargo / Título da vaga.');
      return;
    }
    if (!jobForm.description.trim()) {
      alert('Por favor, informe a descrição detalhada da vaga.');
      return;
    }
    if (jobForm.requirements.length === 0) {
      alert('A vaga precisa ter pelo menos 1 requisito cadastrado.');
      return;
    }

    if ((jobForm.origin === 'recrutamento_cliente' || jobForm.origin === 'headhunter') && !jobForm.clientName.trim()) {
      alert('Para vagas de Cliente ou Headhunter, o nome do Cliente Contratante é obrigatório.');
      return;
    }

    try {
      const payload = {
        companyId,
        jobData: {
          id: editingJob ? editingJob.id : `job-${Date.now()}`,
          title: jobForm.title,
          department: jobForm.department,
          area: jobForm.department || jobForm.area,
          city: jobForm.city,
          state: jobForm.state,
          workMode: jobForm.workMode,
          contractType: jobForm.contractType,
          status: jobForm.status,
          openingsCount: Number(jobForm.openingsCount) || 1,
          deadline: jobForm.deadline,
          salaryRange: jobForm.salaryRange,
          description: jobForm.description,
          requirements: jobForm.requirements,
          recruiterName: jobForm.recruiterName,
          managerName: jobForm.managerName,
          centerCostCode: jobForm.centerCostCode,
          origin: jobForm.origin,
          clientName: jobForm.clientName,
          clientId: jobForm.clientId,
          billingRule: jobForm.billingRule,
          feePercent: jobForm.feePercent ? Number(jobForm.feePercent) : undefined,
          negotiatedValue: jobForm.negotiatedValue ? Number(jobForm.negotiatedValue) : undefined,
          paymentDeadline: jobForm.paymentDeadline,
          commercialResponsible: jobForm.commercialResponsible,
          paymentStatus: jobForm.paymentStatus,
          commercialNotes: jobForm.commercialNotes,
          published: jobForm.published
        }
      };

      const res = await fetch('/api/company/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert(editingJob ? 'Vaga atualizada com sucesso!' : 'Nova vaga corporativa cadastrada com sucesso!');
        setShowJobModal(false);
        fetchJobs();
      } else {
        alert('Erro ao salvar vaga.');
      }
    } catch (err) {
      alert('Erro na comunicação com o servidor.');
    }
  };

  // Add requirement to form
  const handleAddRequirement = () => {
    if (!reqInput.trim()) return;
    setJobForm({ ...jobForm, requirements: [...jobForm.requirements, reqInput.trim()] });
    setReqInput('');
  };

  // Remove requirement from form
  const handleRemoveRequirement = (idx: number) => {
    const updated = jobForm.requirements.filter((_, i) => i !== idx);
    setJobForm({ ...jobForm, requirements: updated });
  };

  // Quick End/Close Job
  const handleCloseJob = async (job: Job) => {
    if (!window.confirm(`Deseja realmente encerrar a vaga "${job.title}"?`)) return;

    try {
      const res = await fetch('/api/company/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          jobData: {
            ...job,
            status: 'concluida'
          }
        })
      });

      if (res.ok) {
        fetchJobs();
      }
    } catch (e) {
      alert('Erro ao encerrar vaga.');
    }
  };

  // Add Candidate from Talent Bank to Job
  const handleAddCandidateToJob = async (candidateId: string) => {
    if (!managingJob) return;
    setAddingCandidateId(candidateId);
    try {
      const res = await fetch(`/api/company/jobs/${managingJob.id}/add-candidate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId,
          companyId,
          source: 'Banco de Talentos IA'
        })
      });

      if (res.ok) {
        alert('Candidato vinculado à vaga com sucesso!');
        fetchJobApplications(managingJob.id);
        setAppSubTab('inscritos');
      } else {
        const err = await res.json();
        alert(err.error || 'Erro ao vincular candidato.');
      }
    } catch (e) {
      alert('Erro ao vincular candidato.');
    } finally {
      setAddingCandidateId(null);
    }
  };

  // Filter Jobs Logic
  const filteredJobs = jobs.filter(j => {
    // Search filter
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchTitle = j.title?.toLowerCase().includes(q);
      const matchDept = j.department?.toLowerCase().includes(q) || j.area?.toLowerCase().includes(q);
      const matchClient = j.clientName?.toLowerCase().includes(q);
      const matchRecruiter = j.recruiterName?.toLowerCase().includes(q);
      const matchReqs = j.requirements?.some(r => r.toLowerCase().includes(q));
      if (!matchTitle && !matchDept && !matchClient && !matchRecruiter && !matchReqs) return false;
    }

    // Department Filter
    if (departmentFilter !== 'todos') {
      const dept = j.department || j.area;
      if (dept !== departmentFilter) return false;
    }

    // Status Filter
    if (statusFilter !== 'todas') {
      if (statusFilter === 'abertas' && j.status !== 'aberta') return false;
      if (statusFilter === 'em_andamento' && j.status !== 'em_andamento') return false;
      if (statusFilter === 'concluidas' && (j.status !== 'concluida' && j.status !== 'encerrada')) return false;
      if (statusFilter === 'canceladas' && j.status !== 'cancelada') return false;
    }

    // Contract Type Filter
    if (contractTypeFilter !== 'todos' && j.contractType !== contractTypeFilter) return false;

    // Origin Filter
    if (originFilter !== 'todas') {
      const orig = j.origin || 'vaga_interna';
      if (orig !== originFilter) return false;
    }

    // Archived Filter
    if (!includeArchived && j.archived) return false;

    return true;
  });

  // Get unique departments for filter dropdown
  const departmentsList = Array.from(new Set(jobs.map(j => j.department || j.area).filter(Boolean)));

  // Render Candidate Management Mode inside Job
  if (managingJob) {
    return (
      <div className="space-y-6">
        {/* Navigation Back */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setManagingJob(null)}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1 transition"
            >
              <ChevronLeft className="w-4 h-4" /> Voltar para Vagas
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Gestão da Vaga: {managingJob.title}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                  {managingJob.origin === 'headhunter' ? 'Headhunter' : managingJob.origin === 'recrutamento_cliente' ? 'Cliente' : 'Interna'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {managingJob.city}/{managingJob.state} • {managingJob.contractType} • {managingJob.openingsCount} vaga(s) • Recrutador: {managingJob.recruiterName || 'Não atribuído'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenEditForm(managingJob)}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
            >
              <Edit className="w-3.5 h-3.5" /> Editar Vaga
            </button>
          </div>
        </div>

        {/* Sub Tabs: Inscritos vs Banco de Talentos IA */}
        <div className="bg-white rounded-2xl border border-slate-200 p-2 flex items-center gap-2 text-xs font-bold">
          <button
            onClick={() => setAppSubTab('inscritos')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 ${
              appSubTab === 'inscritos'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" /> Candidatos Inscritos ({jobApplications.length})
          </button>
          <button
            onClick={() => setAppSubTab('banco_ia')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 ${
              appSubTab === 'banco_ia'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" /> Banco de Talentos IA (Match de Perfis)
          </button>
        </div>

        {/* TAB 1: CANDIDATOS INSCRITOS */}
        {appSubTab === 'inscritos' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            {loadingApps ? (
              <div className="p-12 text-center text-slate-500 text-xs">Carregando candidatos da vaga...</div>
            ) : jobApplications.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <Users className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="font-bold text-slate-800 text-sm">Nenhum candidato inscrito nesta vaga.</p>
                <p className="text-xs text-slate-500">Utilize a aba "Banco de Talentos IA" para buscar profissionais compatíveis no sistema.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">Candidato</th>
                      <th className="p-3.5">Cidade</th>
                      <th className="p-3.5">Origem</th>
                      <th className="p-3.5">Inscrição</th>
                      <th className="p-3.5">Etapa</th>
                      <th className="p-3.5 text-center">Triagem IA</th>
                      <th className="p-3.5 text-center">Triagem RH</th>
                      <th className="p-3.5 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {jobApplications.map((app: any) => {
                      const c = app.candidate;
                      return (
                        <tr key={app.id} className="hover:bg-slate-50/80 transition">
                          <td className="p-3.5">
                            <div className="font-bold text-slate-900 text-sm">{c?.name || 'Candidato'}</div>
                            <div className="text-[11px] text-slate-500">{c?.phone || 'Sem telefone'}</div>
                          </td>
                          <td className="p-3.5">{c?.city}/{c?.state}</td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                              {app.source || 'Portal de Vagas'}
                            </span>
                          </td>
                          <td className="p-3.5">{new Date(app.createdAt).toLocaleDateString('pt-BR')}</td>
                          <td className="p-3.5">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 uppercase">
                              {app.stage}
                            </span>
                          </td>
                          <td className="p-3.5 text-center font-bold text-blue-600">
                            {app.aiScore ? `${app.aiScore}% Match` : 'Concluída'}
                          </td>
                          <td className="p-3.5 text-center">
                            {app.rhRating ? (
                              <span className="font-bold text-amber-600">{app.rhRating}/5 ★</span>
                            ) : (
                              <span className="text-slate-400 text-[10px]">Pendente</span>
                            )}
                          </td>
                          <td className="p-3.5 text-center">
                            <button
                              onClick={() => setDrawerAppId(app.id)}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                            >
                              Abrir Ficha / Painel
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: BANCO DE TALENTOS IA */}
        {appSubTab === 'banco_ia' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" /> Cruzamento Inteligente de Perfis no Banco de Talentos
                </h3>
                <p className="text-xs text-slate-500">
                  Encontre profissionais cadastrados compatíveis com os requisitos de <strong>"{managingJob.title}"</strong> e vincule-os sem duplicar cadastros.
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filtrar por nome, cidade ou competência..."
                  value={talentSearch}
                  onChange={e => setTalentSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {talentBankCandidates
                .filter(c => {
                  if (!talentSearch) return true;
                  const q = talentSearch.toLowerCase();
                  return (
                    c.name.toLowerCase().includes(q) ||
                    c.city.toLowerCase().includes(q) ||
                    c.skills?.some(s => s.toLowerCase().includes(q))
                  );
                })
                .map(c => {
                  const isEnrolled = jobApplications.some(a => a.candidateId === c.id);
                  return (
                    <div key={c.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{c.name}</h4>
                          <p className="text-xs text-slate-500">{c.city}/{c.state} • {c.currentRole || 'Profissional'}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                          92% IA Match
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1 text-[10px]">
                        {c.skills?.slice(0, 4).map((s, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 rounded-md font-medium">
                            {s}
                          </span>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                        <span className="text-[10px] text-slate-400 font-mono">ID: {c.id}</span>

                        {isEnrolled ? (
                          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Já Inscrito
                          </span>
                        ) : (
                          <button
                            disabled={addingCandidateId === c.id}
                            onClick={() => handleAddCandidateToJob(c.id)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" /> Vincular à Vaga
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Candidate Drawer */}
        {drawerAppId && (
          <CandidateSideDrawer
            applicationId={drawerAppId}
            companyId={companyId}
            onClose={() => setDrawerAppId(null)}
            onUpdateStage={() => {
              if (managingJob) fetchJobApplications(managingJob.id);
            }}
            onNavigateMenu={(menuId) => {
              if (onNavigateMenu) {
                onNavigateMenu(menuId);
                setDrawerAppId(null);
              }
            }}
          />
        )}
      </div>
    );
  }

  // MAIN JOBS VIEW
  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-2 border border-blue-400/20">
            <Briefcase className="w-3.5 h-3.5" /> Gestão Corporativa de Seleção & Headhunter
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Gestão de Vagas Corporativas</h1>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            Painel unificado para controle de vagas internas, recrutamento para clientes e busca ativa (Headhunter).
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-center border border-white/10">
            <span className="text-xs text-blue-200 uppercase font-bold block">Total Ativas</span>
            <span className="text-xl font-extrabold text-white">{filteredJobs.length} posições</span>
          </div>

          <button
            onClick={handleOpenCreateForm}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold rounded-xl shadow-lg transition flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ Cadastrar Nova Vaga Corporativa</span>
          </button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Buscar por cargo, departamento, cliente, recrutador ou requisitos..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={departmentFilter}
              onChange={e => setDepartmentFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl px-3 py-2"
            >
              <option value="todos">Todos os Departamentos</option>
              {departmentsList.map((d, i) => (
                <option key={i} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl px-3 py-2"
            >
              <option value="todas">Todos os Status</option>
              <option value="abertas">Somente Abertas</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="concluidas">Concluídas / Encerradas</option>
              <option value="canceladas">Canceladas</option>
            </select>
          </div>

          {/* Origin Filter */}
          <div>
            <select
              value={originFilter}
              onChange={e => setOriginFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl px-3 py-2"
            >
              <option value="todas">Todas as Origens</option>
              <option value="vaga_interna">Vaga Interna</option>
              <option value="recrutamento_cliente">Recrutamento p/ Cliente</option>
              <option value="headhunter">Módulo Headhunter</option>
            </select>
          </div>
        </div>

        {/* Bottom Bar: Toggle Cards vs Table & Checkbox Include Archived */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-semibold">
              <input
                type="checkbox"
                checked={includeArchived}
                onChange={e => setIncludeArchived(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Incluir vagas arquivadas</span>
            </label>

            <span className="text-slate-300">|</span>

            <span className="text-slate-500 font-medium">
              Exibindo <strong>{filteredJobs.length}</strong> de <strong>{jobs.length}</strong> vagas
            </span>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                viewMode === 'cards'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" /> Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                viewMode === 'table'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" /> Tabela / Lista
            </button>
          </div>
        </div>
      </div>

      {/* JOBS CONTENT AREA */}
      {loading ? (
        <div className="bg-white p-12 text-center text-slate-500 rounded-2xl border">
          Carregando vagas corporativas...
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-white p-12 text-center text-slate-500 rounded-2xl border space-y-2">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="font-bold text-slate-800 text-sm">Nenhuma vaga encontrada com os filtros selecionados.</p>
          <p className="text-xs text-slate-500">Tente ajustar os termos de pesquisa ou crie uma nova vaga corporativa.</p>
        </div>
      ) : viewMode === 'cards' ? (
        /* CARDS GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredJobs.map(j => {
            const isHeadhunter = j.origin === 'headhunter';
            const isClient = j.origin === 'recrutamento_cliente';

            return (
              <div
                key={j.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Origin Badge & Status */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        isHeadhunter
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : isClient
                          ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {isHeadhunter ? '★ Headhunter' : isClient ? 'Cliente' : 'Vaga Interna'}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        j.status === 'aberta'
                          ? 'bg-emerald-100 text-emerald-800'
                          : j.status === 'em_andamento'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {j.status}
                    </span>
                  </div>

                  {/* Title & Dept */}
                  <div>
                    <h3 className="font-bold text-slate-900 text-base leading-snug">{j.title}</h3>
                    <p className="text-xs font-semibold text-slate-500">{j.department || j.area || 'Geral'}</p>
                    {j.clientName && canViewCommercial && (
                      <p className="text-xs font-bold text-indigo-600 mt-0.5">Cliente: {j.clientName}</p>
                    )}
                  </div>

                  {/* Location & Modality & Contract */}
                  <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-700 font-medium">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{j.city}/{j.state} ({j.workMode})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>Contrato {j.contractType} • {j.openingsCount} vaga(s)</span>
                    </div>
                    {j.deadline && (
                      <div className="flex items-center gap-2 text-amber-700 font-bold">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>SLA / Prazo: {new Date(j.deadline).toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}
                  </div>

                  {/* Recruiter */}
                  <p className="text-xs text-slate-500">
                    Recrutador Responsável: <strong>{j.recruiterName || 'Equipe RH'}</strong>
                  </p>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => setDetailsJob(j)}
                    className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition flex items-center justify-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> Detalhes
                  </button>

                  <button
                    onClick={() => {
                      setManagingJob(j);
                      fetchJobApplications(j.id);
                    }}
                    className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1"
                  >
                    <Users className="w-3.5 h-3.5" /> Candidatos
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE LIST VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Cargo / Vaga</th>
                  <th className="p-3.5">Origem</th>
                  <th className="p-3.5">Departamento</th>
                  <th className="p-3.5">Local / Modalidade</th>
                  <th className="p-3.5">Contrato</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">SLA Prazo</th>
                  <th className="p-3.5 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredJobs.map(j => (
                  <tr key={j.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5 font-bold text-slate-900 text-sm">
                      {j.title}
                      {j.clientName && canViewCommercial && (
                        <div className="text-[11px] text-indigo-600 font-semibold">{j.clientName}</div>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                        {j.origin === 'headhunter' ? 'Headhunter' : j.origin === 'recrutamento_cliente' ? 'Cliente' : 'Interna'}
                      </span>
                    </td>
                    <td className="p-3.5">{j.department || j.area || 'Geral'}</td>
                    <td className="p-3.5">{j.city}/{j.state} ({j.workMode})</td>
                    <td className="p-3.5">{j.contractType}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                        {j.status}
                      </span>
                    </td>
                    <td className="p-3.5">{j.deadline ? new Date(j.deadline).toLocaleDateString('pt-BR') : 'Sem prazo'}</td>
                    <td className="p-3.5 text-center flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setDetailsJob(j)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                        title="Ver Detalhes"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setManagingJob(j);
                          fetchJobApplications(j.id);
                        }}
                        className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-lg"
                      >
                        Candidatos
                      </button>
                      <button
                        onClick={() => handleOpenEditForm(j)}
                        className="p-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* JOB DETAILS MODAL */}
      {detailsJob && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-4">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-800 mb-1 inline-block">
                  {detailsJob.origin === 'headhunter' ? 'Módulo Headhunter' : detailsJob.origin === 'recrutamento_cliente' ? 'Cliente' : 'Vaga Interna'}
                </span>
                <h3 className="text-xl font-bold text-slate-900">{detailsJob.title}</h3>
                <p className="text-xs text-slate-500">ID: {detailsJob.id} | {detailsJob.department || detailsJob.area}</p>
              </div>
              <button
                onClick={() => setDetailsJob(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕ Fechar
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Localização:</span>
                <span className="font-bold text-slate-900">{detailsJob.city}/{detailsJob.state} ({detailsJob.workMode})</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Contrato:</span>
                <span className="font-bold text-slate-900">{detailsJob.contractType}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Quantidade Vagas:</span>
                <span className="font-bold text-slate-900">{detailsJob.openingsCount} posições</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Remuneração:</span>
                <span className="font-bold text-emerald-700">{detailsJob.salaryRange || 'A combinar'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">SLA / Prazo:</span>
                <span className="font-bold text-amber-700">{detailsJob.deadline ? new Date(detailsJob.deadline).toLocaleDateString('pt-BR') : 'Sem prazo'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Recrutador Responsável:</span>
                <span className="font-bold text-slate-900">{detailsJob.recruiterName || 'Equipe RH'}</span>
              </div>
            </div>

            {/* Commercial Info if authorized */}
            {(detailsJob.origin === 'recrutamento_cliente' || detailsJob.origin === 'headhunter') && canViewCommercial && (
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl space-y-2 text-xs">
                <h4 className="font-bold text-indigo-900 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-indigo-600" /> Informações Comerciais do Projeto
                </h4>
                <div className="grid grid-cols-2 gap-2 text-indigo-950">
                  <p><strong>Cliente:</strong> {detailsJob.clientName || 'Não informado'}</p>
                  <p><strong>Regra Cobrança:</strong> {detailsJob.billingRule || 'Padrão'}</p>
                  <p><strong>Fee / Percentual:</strong> {detailsJob.feePercent ? `${detailsJob.feePercent}%` : 'N/A'}</p>
                  <p><strong>Valor Negociado:</strong> R$ {detailsJob.negotiatedValue?.toLocaleString('pt-BR') || '0,00'}</p>
                  <p><strong>Status Pagamento:</strong> <span className="font-bold">{detailsJob.paymentStatus}</span></p>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="space-y-1 text-xs">
              <h4 className="font-bold text-slate-900">Descrição da Vaga:</h4>
              <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                {detailsJob.description}
              </p>
            </div>

            {/* Requirements */}
            <div className="space-y-1 text-xs">
              <h4 className="font-bold text-slate-900">Requisitos Obrigatórios:</h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-700">
                {detailsJob.requirements?.map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => {
                  const j = detailsJob;
                  setDetailsJob(null);
                  setManagingJob(j);
                  fetchJobApplications(j.id);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition"
              >
                Gerenciar Candidatos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OFFICIAL SINGLE JOB FORM MODAL */}
      {showJobModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveJob}
            className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl space-y-5"
          >
            <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingJob ? 'Editar Vaga Corporativa' : 'Cadastrar Nova Vaga Corporativa'}
                </h3>
                <p className="text-xs text-slate-500">
                  Preencha o formulário unificado de criação de vagas para Recrutamento e Headhunter.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowJobModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Section 1: Informações da Posição */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider">1. Informações da Posição</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cargo / Título da Vaga *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Desenvolvedor Full Stack, Analista Financeiro..."
                    value={jobForm.title}
                    onChange={e => setJobForm({ ...jobForm, title: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Departamento / Área</label>
                  <input
                    type="text"
                    placeholder="Ex: Tecnologia, Recursos Humanos, Vendas..."
                    value={jobForm.department}
                    onChange={e => setJobForm({ ...jobForm, department: e.target.value, area: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cidade - Estado</label>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Cidade"
                      value={jobForm.city}
                      onChange={e => setJobForm({ ...jobForm, city: e.target.value })}
                      className="col-span-2 p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                    <input
                      type="text"
                      placeholder="UF"
                      maxLength={2}
                      value={jobForm.state}
                      onChange={e => setJobForm({ ...jobForm, state: e.target.value.toUpperCase() })}
                      className="p-2.5 bg-slate-50 border border-slate-300 rounded-xl uppercase text-center"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Modalidade de Trabalho</label>
                  <select
                    value={jobForm.workMode}
                    onChange={e => setJobForm({ ...jobForm, workMode: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="Presencial">Presencial</option>
                    <option value="Híbrido">Híbrido</option>
                    <option value="Remoto">Remoto</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipo de Contratação</label>
                  <select
                    value={jobForm.contractType}
                    onChange={e => setJobForm({ ...jobForm, contractType: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="CLT">CLT</option>
                    <option value="PJ">PJ</option>
                    <option value="Temporário">Temporário</option>
                    <option value="Estágio">Estágio</option>
                    <option value="Jovem Aprendiz">Jovem Aprendiz</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status da Vaga</label>
                  <select
                    value={jobForm.status}
                    onChange={e => setJobForm({ ...jobForm, status: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-blue-700"
                  >
                    <option value="aberta">Aberta</option>
                    <option value="em_andamento">Em Andamento</option>
                    <option value="concluida">Concluída</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quantidade de Vagas</label>
                  <input
                    type="number"
                    min={1}
                    value={jobForm.openingsCount}
                    onChange={e => setJobForm({ ...jobForm, openingsCount: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Prazo SLA / Encerramento</label>
                  <input
                    type="date"
                    value={jobForm.deadline}
                    onChange={e => setJobForm({ ...jobForm, deadline: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Remuneração, Responsáveis & Origem */}
            <div className="space-y-3 pt-2 border-t border-slate-200">
              <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider">2. Remuneração, Origem e Responsáveis</h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Faixa Salarial / Remuneração</label>
                  <input
                    type="text"
                    placeholder="Ex: R$ 4.000 - R$ 5.500"
                    value={jobForm.salaryRange}
                    onChange={e => setJobForm({ ...jobForm, salaryRange: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Origem do Processo *</label>
                  <select
                    value={jobForm.origin}
                    onChange={e => setJobForm({ ...jobForm, origin: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                  >
                    <option value="vaga_interna">Vaga Interna (Propriedade RL RH)</option>
                    <option value="recrutamento_cliente">Recrutamento para Cliente</option>
                    <option value="headhunter">Módulo Headhunter (Busca Ativa)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Centro de Custo</label>
                  <input
                    type="text"
                    placeholder="Ex: CC-RH-101"
                    value={jobForm.centerCostCode}
                    onChange={e => setJobForm({ ...jobForm, centerCostCode: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Recrutador Responsável</label>
                  <input
                    type="text"
                    placeholder="Nome do especialista RH"
                    value={jobForm.recruiterName}
                    onChange={e => setJobForm({ ...jobForm, recruiterName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gestor Solicitante</label>
                  <input
                    type="text"
                    placeholder="Nome do líder/gestor da vaga"
                    value={jobForm.managerName}
                    onChange={e => setJobForm({ ...jobForm, managerName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Seção Comercial (quando Origem = cliente ou headhunter) */}
            {(jobForm.origin === 'recrutamento_cliente' || jobForm.origin === 'headhunter') && canViewCommercial && (
              <div className="space-y-3 p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs">
                <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-indigo-600" /> Informações Comerciais (Cliente / Headhunter)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-indigo-900 mb-1">Cliente Contratante *</label>
                    <input
                      type="text"
                      required
                      placeholder="Nome da empresa cliente"
                      value={jobForm.clientName}
                      onChange={e => setJobForm({ ...jobForm, clientName: e.target.value })}
                      className="w-full p-2.5 bg-white border border-indigo-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-indigo-900 mb-1">Regra de Cobrança</label>
                    <input
                      type="text"
                      placeholder="Ex: 15% do salário bruto anual"
                      value={jobForm.billingRule}
                      onChange={e => setJobForm({ ...jobForm, billingRule: e.target.value })}
                      className="w-full p-2.5 bg-white border border-indigo-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-indigo-900 mb-1">Percentual / Fee (%)</label>
                    <input
                      type="number"
                      placeholder="Ex: 15"
                      value={jobForm.feePercent}
                      onChange={e => setJobForm({ ...jobForm, feePercent: e.target.value })}
                      className="w-full p-2.5 bg-white border border-indigo-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-indigo-900 mb-1">Valor Negociado (R$)</label>
                    <input
                      type="number"
                      placeholder="Ex: 8500"
                      value={jobForm.negotiatedValue}
                      onChange={e => setJobForm({ ...jobForm, negotiatedValue: e.target.value })}
                      className="w-full p-2.5 bg-white border border-indigo-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-indigo-900 mb-1">Situação do Pagamento</label>
                    <select
                      value={jobForm.paymentStatus}
                      onChange={e => setJobForm({ ...jobForm, paymentStatus: e.target.value as any })}
                      className="w-full p-2.5 bg-white border border-indigo-200 rounded-xl font-bold"
                    >
                      <option value="Aguardando contratação">Aguardando contratação</option>
                      <option value="A faturar">A faturar</option>
                      <option value="Faturado">Faturado</option>
                      <option value="Recebido">Recebido</option>
                      <option value="Vencido">Vencido</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-indigo-900 mb-1">Responsável Comercial</label>
                    <input
                      type="text"
                      placeholder="Executivo de vendas"
                      value={jobForm.commercialResponsible}
                      onChange={e => setJobForm({ ...jobForm, commercialResponsible: e.target.value })}
                      className="w-full p-2.5 bg-white border border-indigo-200 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Section 4: Descrição & Requisitos */}
            <div className="space-y-3 pt-2 border-t border-slate-200 text-xs">
              <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider">3. Descrição e Requisitos da Posição</h4>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Descrição Detalhada *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Descreva as principais responsabilidades, objetivo do cargo e ambiente de trabalho..."
                  value={jobForm.description}
                  onChange={e => setJobForm({ ...jobForm, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Requisitos Obrigatórios (Mínimo 1) *</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Digite um requisito e clique em Adicionar..."
                    value={reqInput}
                    onChange={e => setReqInput(e.target.value)}
                    className="flex-1 p-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={handleAddRequirement}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl"
                  >
                    Adicionar
                  </button>
                </div>

                {jobForm.requirements.length === 0 ? (
                  <p className="text-red-500 font-semibold text-[11px]">Nenhum requisito adicionado ainda.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {jobForm.requirements.map((req, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-slate-100 border border-slate-200 text-slate-800 rounded-xl flex items-center gap-1.5 font-medium"
                      >
                        <span>{req}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveRequirement(idx)}
                          className="text-slate-400 hover:text-red-600 font-bold"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Publication Toggle */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={jobForm.published}
                  onChange={e => setJobForm({ ...jobForm, published: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Publicar Vaga no Portal Público de Vagas</span>
              </label>
            </div>

            {/* Form Action Buttons */}
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowJobModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                {editingJob ? 'Salvar Alterações' : 'Cadastrar Vaga Corporativa'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

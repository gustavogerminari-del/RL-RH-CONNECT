import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Users,
  Search,
  Filter,
  RefreshCw,
  Plus,
  ChevronRight,
  Eye,
  CheckCircle2,
  Clock,
  UserCheck,
  MapPin,
  Mail,
  Phone,
  MessageSquare,
  FileText,
  Building2,
  Sparkles
} from 'lucide-react';
import { Job } from '../../types';
import { TalentBankModal } from '../TalentBankModal';

interface CandidateEnriched {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  cpf?: string;
  currentRole?: string;
  salaryExpectation?: string;
  jobTitle?: string;
  stage?: string;
  applicationId?: string;
  resumeUrl?: string;
  createdAt: string;
  skills?: string[];
}

interface Props {
  companyId: string;
  onSelectJob?: (job: Job) => void;
  onOpenCreateJob?: () => void;
  onOpenDrawer?: (appId: string) => void;
}

export const CandidatosPorVagaView: React.FC<Props> = ({
  companyId,
  onSelectJob,
  onOpenCreateJob,
  onOpenDrawer
}) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<CandidateEnriched[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [candidatesLoading, setCandidatesLoading] = useState(true);
  const [viewType, setViewType] = useState<'todos_candidatos' | 'por_vaga'>('todos_candidatos');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todas');
  const [stageFilter, setStageFilter] = useState<string>('todos');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCandidateModal, setSelectedCandidateModal] = useState<CandidateEnriched | null>(null);

  const fetchJobs = async () => {
    setJobsLoading(true);
    try {
      const res = await fetch(`/api/company/jobs?companyId=${companyId}`);
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
      }
    } catch (e) {
      console.error('Erro ao buscar vagas:', e);
    } finally {
      setJobsLoading(false);
    }
  };

  const fetchCandidates = async () => {
    setCandidatesLoading(true);
    try {
      const res = await fetch(`/api/company/candidates?companyId=${companyId}`);
      if (res.ok) {
        const data = await res.json();
        setCandidates(data.candidates || []);
      }
    } catch (e) {
      console.error('Erro ao buscar candidatos:', e);
    } finally {
      setCandidatesLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchCandidates();
  }, [companyId]);

  const handleRefresh = () => {
    fetchJobs();
    fetchCandidates();
  };

  // Jobs filtering
  const filteredJobs = jobs.filter(j => {
    if (statusFilter !== 'todas' && j.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        j.title.toLowerCase().includes(q) ||
        (j.department && j.department.toLowerCase().includes(q)) ||
        (j.code && j.code.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Candidates filtering
  const filteredCandidates = candidates.filter(c => {
    if (stageFilter !== 'todos') {
      const s = String(c.stage || '').toLowerCase();
      if (stageFilter === 'contratado' && !s.includes('contratad')) return false;
      if (stageFilter === 'entrevista' && !s.includes('entrevista')) return false;
      if (stageFilter === 'triagem' && !s.includes('triagem')) return false;
      if (stageFilter === 'banco' && !s.includes('banco')) return false;
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        (c.jobTitle && c.jobTitle.toLowerCase().includes(q)) ||
        (c.city && c.city.toLowerCase().includes(q)) ||
        (c.currentRole && c.currentRole.toLowerCase().includes(q)) ||
        (c.skills && c.skills.some(sk => sk.toLowerCase().includes(q)))
      );
    }
    return true;
  });

  const abertasCount = jobs.filter(j => j.status === 'aberta').length;
  const emAndamentoCount = jobs.filter(j => j.status === 'em_andamento').length;
  const pausadasCount = jobs.filter(j => j.status === 'pausada').length;
  const preenchidasCount = jobs.filter(j => j.status === 'conclued' || j.status === 'concluida' || j.status === 'preenchida').length;
  const canceladasCount = jobs.filter(j => j.status === 'cancelada').length;

  const activeJobs = filteredJobs.filter(j => j.status === 'aberta' || j.status === 'em_andamento');
  const finalizadasJobs = filteredJobs.filter(j => j.status === 'conclued' || j.status === 'concluida' || j.status === 'preenchida' || j.status === 'cancelada');

  const getStageBadge = (stage?: string) => {
    const s = String(stage || '').toLowerCase();
    if (s.includes('contratad')) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Contratado
        </span>
      );
    }
    if (s.includes('entrevista')) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 border border-purple-300 flex items-center gap-1">
          <Clock className="w-3 h-3 text-purple-600" /> Entrevista Agendada
        </span>
      );
    }
    if (s.includes('triagem')) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1">
          <UserCheck className="w-3 h-3 text-blue-600" /> Em Triagem
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-50 text-teal-700 border border-teal-200 flex items-center gap-1">
        <Users className="w-3 h-3 text-teal-600" /> Banco de Talentos
      </span>
    );
  };

  return (
    <div className="space-y-6 select-none font-sans">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-blue-600" />
            Central de Candidatos
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gerencie e visualize todos os candidatos cadastrados nas vagas e no banco de dados da empresa
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Toggle Pill Group */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center space-x-1 border border-slate-200">
            <button
              onClick={() => setViewType('todos_candidatos')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                viewType === 'todos_candidatos'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Todos os Candidatos ({candidates.length})</span>
            </button>
            <button
              onClick={() => setViewType('por_vaga')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                viewType === 'por_vaga'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Por Vaga ({jobs.length})</span>
            </button>
          </div>

          <button
            onClick={handleRefresh}
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition"
            title="Atualizar dados"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Cadastrar Currículo</span>
          </button>
        </div>
      </div>

      {showAddModal && (
        <TalentBankModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            fetchCandidates();
            setShowAddModal(false);
          }}
        />
      )}

      {/* VIEW 1: TODOS OS CANDIDATOS */}
      {viewType === 'todos_candidatos' && (
        <div className="space-y-5">
          {/* Search & Stage Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Buscar candidato por nome, cargo, vaga, cidade ou habilidade..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div className="text-xs text-slate-500 font-bold shrink-0">
                Exibindo {filteredCandidates.length} de {candidates.length} candidatos
              </div>
            </div>

            {/* Stage Filter Badges */}
            <div className="flex items-center space-x-2 overflow-x-auto text-xs font-bold pt-1 border-t border-slate-100">
              <span className="text-[11px] text-slate-400 uppercase font-extrabold mr-1">Etapa:</span>
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'triagem', label: 'Triagem' },
                { id: 'entrevista', label: 'Entrevistas' },
                { id: 'contratado', label: 'Contratados' },
                { id: 'banco', label: 'Banco de Talentos' }
              ].map(badge => (
                <button
                  key={badge.id}
                  onClick={() => setStageFilter(badge.id)}
                  className={`px-3 py-1 rounded-full whitespace-nowrap transition text-xs ${
                    stageFilter === badge.id
                      ? 'bg-blue-600 text-white font-extrabold shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {badge.label}
                </button>
              ))}
            </div>
          </div>

          {/* Candidate Grid */}
          {candidatesLoading ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 font-medium text-xs">
              Carregando candidatos...
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 font-medium text-xs space-y-2">
              <Users className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-bold text-slate-700 text-sm">Nenhum candidato encontrado com os filtros selecionados.</p>
              <p className="text-slate-400">Tente buscar por outro termo ou limpar os filtros de etapa.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCandidates.map(c => (
                <div
                  key={c.id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-blue-400 p-5 transition shadow-2xs hover:shadow-md flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-base flex items-center justify-center shadow-xs">
                          {c.name ? c.name.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-sm leading-snug">{c.name}</h3>
                          <p className="text-xs font-semibold text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {c.city ? `${c.city}/${c.state || 'SP'}` : 'São Paulo, SP'}
                          </p>
                        </div>
                      </div>

                      {getStageBadge(c.stage)}
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs text-slate-700 font-medium">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase">Vaga / Vínculo</span>
                        <span className="font-bold text-slate-900 truncate max-w-[170px]">{c.jobTitle}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase">Cargo Pretendido</span>
                        <span className="font-bold text-slate-800">{c.currentRole || 'Motorista / Analista'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase">Pretensão</span>
                        <span className="font-bold text-slate-800">{c.salaryExpectation || 'A combinar'}</span>
                      </div>
                    </div>

                    {c.skills && c.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {c.skills.slice(0, 3).map((sk, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md">
                            {sk}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-1.5">
                      {c.phone && (
                        <a
                          href={`https://wa.me/55${c.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl transition"
                          title="Contato WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {c.email && (
                        <a
                          href={`mailto:${c.email}`}
                          className="p-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl transition"
                          title="Enviar E-mail"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        if (onOpenDrawer) {
                          onOpenDrawer(c.applicationId || c.id);
                        } else {
                          setSelectedCandidateModal(c);
                        }
                      }}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-400" />
                      <span>Ver Processo & Perfil</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: POR VAGA */}
      {viewType === 'por_vaga' && (
        <div className="space-y-6">
          {/* Search & Filters */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Buscar vaga por título, código ou área..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <button className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl flex items-center space-x-2 shrink-0">
                <Filter className="w-4 h-4 text-slate-500" />
                <span>Filtros</span>
              </button>
            </div>

            {/* Status Badges */}
            <div className="flex items-center space-x-2 overflow-x-auto text-xs font-bold pt-1">
              {[
                { id: 'todas', label: 'Todas', count: jobs.length },
                { id: 'aberta', label: 'Abertas', count: abertasCount },
                { id: 'em_andamento', label: 'Em andamento', count: emAndamentoCount },
                { id: 'pausada', label: 'Pausadas', count: pausadasCount },
                { id: 'concluida', label: 'Preenchidas', count: preenchidasCount },
                { id: 'cancelada', label: 'Canceladas', count: canceladasCount }
              ].map(badge => (
                <button
                  key={badge.id}
                  onClick={() => setStatusFilter(badge.id)}
                  className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition flex items-center space-x-1.5 ${
                    statusFilter === badge.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{badge.label}</span>
                  <span className={`px-1.5 py-0.2 text-[10px] rounded-full ${
                    statusFilter === badge.id ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {badge.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 5 KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                TOTAL DE VAGAS
              </span>
              <span className="text-2xl font-black text-slate-900 block">{jobs.length}</span>
              <span className="text-[11px] text-slate-500 block">Cadastradas no sistema</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
                ABERTAS
              </span>
              <span className="text-2xl font-black text-emerald-600 block">{abertasCount}</span>
              <span className="text-[11px] text-slate-500 block">Recebendo candidaturas</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">
                EM ANDAMENTO
              </span>
              <span className="text-2xl font-black text-amber-600 block">{emAndamentoCount}</span>
              <span className="text-[11px] text-slate-500 block">Fase de seleção</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider block">
                PREENCHIDAS
              </span>
              <span className="text-2xl font-black text-teal-600 block">{preenchidasCount}</span>
              <span className="text-[11px] text-slate-500 block">Posições concluídas</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block">
                TOTAL DE CONTRATADOS
              </span>
              <span className="text-2xl font-black text-purple-600 block">{preenchidasCount || 0}</span>
              <span className="text-[11px] text-slate-500 block">Candidatos aprovados</span>
            </div>
          </div>

          {/* VAGAS ATIVAS SECTION */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Vagas Ativas ({activeJobs.length})
              </h2>
            </div>

            {activeJobs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-2">
                <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-600">
                  Nenhuma vaga ativa encontrada com os filtros selecionados.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeJobs.map(j => (
                  <div
                    key={j.id}
                    onClick={() => onSelectJob && onSelectJob(j)}
                    className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-500 hover:shadow-md transition cursor-pointer space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase">
                          {j.department || j.area || 'Geral'}
                        </span>
                        <h3 className="font-bold text-slate-900 text-sm mt-1">{j.title}</h3>
                      </div>
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full uppercase">
                        {j.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <span className="font-semibold text-slate-700">
                        👥 {j.applicationsCount || 0} candidatos
                      </span>
                      <span className="text-blue-600 font-bold flex items-center">
                        Gerenciar <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* VAGAS FINALIZADAS SECTION */}
          <div className="space-y-3 pt-4">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block"></span>
              <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Vagas Finalizadas ({finalizadasJobs.length})
              </h2>
            </div>

            {finalizadasJobs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-xs text-slate-400">
                Nenhuma vaga finalizada no histórico.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {finalizadasJobs.map(j => (
                  <div
                    key={j.id}
                    onClick={() => onSelectJob && onSelectJob(j)}
                    className="bg-slate-50 opacity-80 rounded-2xl border border-slate-200 p-5 hover:opacity-100 transition cursor-pointer space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-md uppercase">
                          {j.department || j.area || 'Geral'}
                        </span>
                        <h3 className="font-bold text-slate-800 text-sm mt-1">{j.title}</h3>
                      </div>
                      <span className="px-2.5 py-0.5 bg-slate-200 text-slate-700 font-bold text-[10px] rounded-full uppercase">
                        {j.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fallback candidate detail modal if onOpenDrawer is not active */}
      {selectedCandidateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-lg text-slate-900">{selectedCandidateModal.name}</h3>
              <button
                onClick={() => setSelectedCandidateModal(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <p><strong>E-mail:</strong> {selectedCandidateModal.email}</p>
              <p><strong>Telefone:</strong> {selectedCandidateModal.phone}</p>
              <p><strong>Cidade:</strong> {selectedCandidateModal.city}/{selectedCandidateModal.state}</p>
              <p><strong>Vaga:</strong> {selectedCandidateModal.jobTitle}</p>
              <p><strong>Status:</strong> {selectedCandidateModal.stage}</p>
            </div>
            <div className="pt-3 border-t flex justify-end">
              <button
                onClick={() => setSelectedCandidateModal(null)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

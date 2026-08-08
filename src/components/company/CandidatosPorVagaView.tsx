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
  UserCheck
} from 'lucide-react';
import { Job } from '../../types';

interface Props {
  companyId: string;
  onSelectJob?: (job: Job) => void;
  onOpenCreateJob?: () => void;
}

export const CandidatosPorVagaView: React.FC<Props> = ({ companyId, onSelectJob, onOpenCreateJob }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<'por_vaga' | 'todos_candidatos'>('por_vaga');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todas');

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

  const abertasCount = jobs.filter(j => j.status === 'aberta').length;
  const emAndamentoCount = jobs.filter(j => j.status === 'em_andamento').length;
  const pausadasCount = jobs.filter(j => j.status === 'pausada').length;
  const preenchidasCount = jobs.filter(j => j.status === 'conclued' || j.status === 'concluida' || j.status === 'preenchida').length;
  const canceladasCount = jobs.filter(j => j.status === 'cancelada').length;

  const activeJobs = filteredJobs.filter(j => j.status === 'aberta' || j.status === 'em_andamento');
  const finalizadasJobs = filteredJobs.filter(j => j.status === 'conclued' || j.status === 'concluida' || j.status === 'preenchida' || j.status === 'cancelada');

  return (
    <div className="space-y-6 select-none font-sans">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Candidatos por Vaga</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gerencie todos os candidatos das suas vagas de forma centralizada e organizada
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Toggle Pill Group */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center space-x-1 border border-slate-200">
            <button
              onClick={() => setViewType('por_vaga')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                viewType === 'por_vaga'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-blue-600" />
              <span>Por Vaga</span>
            </button>
            <button
              onClick={() => setViewType('todos_candidatos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                viewType === 'todos_candidatos'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span>Todos os Candidatos</span>
            </button>
          </div>

          <button
            onClick={fetchJobs}
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition"
            title="Atualizar"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenCreateJob}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Vaga</span>
          </button>
        </div>
      </div>

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
  );
};

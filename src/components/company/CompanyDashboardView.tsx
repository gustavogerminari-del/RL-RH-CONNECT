import React, { useEffect, useState } from 'react';
import {
  Users,
  Briefcase,
  UserCheck,
  Calendar,
  Clock,
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
  Building2,
  Sun
} from 'lucide-react';
import { hasModule } from '../../utils/modules';

interface Props {
  companyId: string;
  companyName: string;
  onNavigate: (menu: string) => void;
}

export const CompanyDashboardView: React.FC<Props> = ({ companyId, companyName, onNavigate }) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/company/dashboard?companyId=${companyId}`).then(r => r.json()),
      fetch(`/api/company/details?companyId=${companyId}`).then(r => r.json())
    ])
      .then(([dashData, compData]) => {
        if (dashData.metrics) setMetrics(dashData.metrics);
        if (compData.company) setCompany(compData.company);
      })
      .catch(e => console.error('Erro ao carregar indicadores do dashboard:', e))
      .finally(() => setLoading(false));
  }, [companyId]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-medium text-xs">Carregando indicadores da empresa...</div>;
  }

  const m = metrics || {};
  const hasRecruitment = hasModule(company, 'recrutamento');
  const hasHeadhunter = hasModule(company, 'headhunter');
  const hasDP = hasModule(company, 'dp');

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-2 border border-blue-400/20">
              <Building2 className="w-3.5 h-3.5" /> {companyName}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Visão Geral Empresarial RL RH Connect
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl font-medium">
              Painel com indicadores unificados e ações rápidas dos módulos ativos da sua empresa.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {hasRecruitment && (
              <button
                onClick={() => onNavigate('vagas')}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition shadow-md flex items-center gap-1.5"
              >
                <Briefcase className="w-3.5 h-3.5" /> Recrutamento
              </button>
            )}
            {hasHeadhunter && (
              <button
                onClick={() => onNavigate('headhunter')}
                className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition shadow-md flex items-center gap-1.5"
              >
                <DollarSign className="w-3.5 h-3.5" /> Headhunter
              </button>
            )}
            {hasDP && (
              <button
                onClick={() => onNavigate('funcionarios')}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-md flex items-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5" /> Colaboradores DP
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 1: RECRUTAMENTO INTERNO (ATS) */}
      {hasRecruitment && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              Recrutamento Interno & Seleção (ATS)
            </h2>
            <button
              onClick={() => onNavigate('vagas')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Acessar Vagas <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              onClick={() => onNavigate('vagas')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition cursor-pointer group"
            >
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold uppercase text-slate-500">Vagas Internas Abertas</span>
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-black text-slate-900">{m.internalOpenJobs || m.openJobs || 0}</span>
                <span className="text-xs text-blue-600 font-bold">Em andamento</span>
              </div>
            </div>

            <div
              onClick={() => onNavigate('candidatos')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition cursor-pointer group"
            >
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold uppercase text-slate-500">Candidatos / Inscrições</span>
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-black text-slate-900">{m.totalCandidates || 0}</span>
                <span className="text-xs text-indigo-600 font-bold">Triagem Ativa</span>
              </div>
            </div>

            <div
              onClick={() => onNavigate('agenda-entrevistas')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition cursor-pointer group"
            >
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold uppercase text-slate-500">Entrevistas Agendadas</span>
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-black text-slate-900">{m.pendingInterviews || 0}</span>
                <span className="text-xs text-teal-600 font-bold">Na Agenda</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: MÓDULO HEADHUNTER */}
      {hasHeadhunter && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
              Módulo Executive Search & Headhunter
            </h2>
            <button
              onClick={() => onNavigate('headhunter')}
              className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1"
            >
              Acessar Headhunter <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              onClick={() => onNavigate('headhunter')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition cursor-pointer"
            >
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold uppercase text-slate-500">Clientes Corporativos</span>
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-black text-slate-900">{m.activeClients || 0}</span>
                <span className="text-xs text-purple-600 font-bold">Clientes Ativos</span>
              </div>
            </div>

            <div
              onClick={() => onNavigate('headhunter')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition cursor-pointer"
            >
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold uppercase text-slate-500">Vagas de Clientes</span>
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-black text-slate-900">{m.clientJobsCount || 0}</span>
                <span className="text-xs text-purple-600 font-bold">Recrutamento Cliente</span>
              </div>
            </div>

            <div
              onClick={() => onNavigate('headhunter')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition cursor-pointer"
            >
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold uppercase text-slate-500">Honorários a Faturar</span>
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-xl font-black text-slate-900">
                  R$ {(m.toInvoiceAmount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-xs text-amber-600 font-bold">A Faturar</span>
              </div>
            </div>

            <div
              onClick={() => onNavigate('headhunter')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition cursor-pointer"
            >
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold uppercase text-slate-500">Honorários Faturados</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-xl font-black text-slate-900">
                  R$ {(m.toReceiveAmount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-xs text-emerald-600 font-bold">A Receber</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: DEPARTAMENTO PESSOAL & COLABORADORES */}
      {hasDP && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              Departamento Pessoal, Ponto & Folha
            </h2>
            <button
              onClick={() => onNavigate('funcionarios')}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
            >
              Acessar DP <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              onClick={() => onNavigate('funcionarios')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition cursor-pointer"
            >
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold uppercase text-slate-500">Colaboradores Ativos</span>
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-black text-slate-900">{m.activeEmployees || 0}</span>
                <span className="text-xs text-blue-600 font-bold">Quadro DP</span>
              </div>
            </div>

            <div
              onClick={() => onNavigate('ponto-digital')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition cursor-pointer"
            >
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold uppercase text-slate-500">Pontos Registrados Hoje</span>
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-black text-slate-900">{m.pointEntriesToday || 0}</span>
                <span className="text-xs text-amber-600 font-bold">Ponto Digital</span>
              </div>
            </div>

            <div
              onClick={() => onNavigate('folha-de-pagamento')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition cursor-pointer"
            >
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold uppercase text-slate-500">Folha de Pagamento</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-xl font-black text-slate-900">
                  R$ {(m.totalPayrollAmount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-xs text-emerald-600 font-bold">Líquido Estimado</span>
              </div>
            </div>

            <div
              onClick={() => onNavigate('departamento-pessoal')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition cursor-pointer"
            >
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold uppercase text-slate-500">Férias no Mês</span>
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Sun className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-black text-slate-900">{m.scheduledVacations || 0}</span>
                <span className="text-xs text-rose-600 font-bold">Programadas</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ALERTS & NOTIFICATIONS */}
      {m.alerts && m.alerts.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Alertas Ativos da Empresa
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {m.alerts.map((alertText: string, idx: number) => (
              <div key={idx} className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-xs font-semibold text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{alertText}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

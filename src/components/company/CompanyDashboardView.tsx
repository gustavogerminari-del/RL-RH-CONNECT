import React, { useEffect, useState } from 'react';
import {
  Users,
  Briefcase,
  UserCheck,
  Calendar,
  Clock,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  FileCheck,
  Award,
  ArrowUpRight
} from 'lucide-react';

interface Props {
  companyId: string;
  companyName: string;
  onNavigate: (menu: string) => void;
}

export const CompanyDashboardView: React.FC<Props> = ({ companyId, companyName, onNavigate }) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/company/dashboard?companyId=${companyId}`)
      .then(r => r.json())
      .then(d => {
        setMetrics(d.metrics);
        setLoading(false);
      })
      .catch(e => {
        console.error('Error fetching dashboard:', e);
        setLoading(false);
      });
  }, [companyId]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Carregando indicadores empresariais...</div>;
  }

  const m = metrics || {
    activeEmployees: 0,
    openJobs: 0,
    totalCandidates: 0,
    pendingInterviews: 0,
    scheduledVacations: 0,
    pointEntriesToday: 0,
    totalPayrollAmount: 0,
    totalBenefitsCount: 0,
    alerts: []
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-2 border border-blue-400/20">
              <Building2Icon /> {companyName}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Painel Integrado de Gestão de RH
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Visão consolidada de Recrutamento (ATS), Headhunting, Cadastro de Colaboradores, Ponto Digital, Folha de Pagamento e Departamento Pessoal.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => onNavigate('recrutamento')}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-xl transition shadow-lg flex items-center gap-2"
            >
              <Briefcase className="w-4 h-4" /> Ver Vagas Abertas
            </button>
            <button
              onClick={() => onNavigate('funcionarios')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium text-sm rounded-xl transition border border-white/20 flex items-center gap-2"
            >
              <Users className="w-4 h-4" /> Colaboradores
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigate('funcionarios')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Funcionários Ativos</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900">{m.activeEmployees}</span>
            <span className="text-xs text-blue-600 font-medium flex items-center">
              Acessar DP <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </span>
          </div>
        </div>

        <div
          onClick={() => onNavigate('vagas')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Vagas em Aberto</span>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-105 transition">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900">{m.openJobs}</span>
            <span className="text-xs text-teal-600 font-medium flex items-center">
              Recrutamento <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </span>
          </div>
        </div>

        <div
          onClick={() => onNavigate('banco-de-talentos')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Candidatos / Talentos</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900">{m.totalCandidates}</span>
            <span className="text-xs text-indigo-600 font-medium flex items-center">
              Banco Central <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </span>
          </div>
        </div>

        <div
          onClick={() => onNavigate('ponto-digital')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pontos Hoje</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900">{m.pointEntriesToday}</span>
            <span className="text-xs text-amber-600 font-medium flex items-center">
              Ponto Digital <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </span>
          </div>
        </div>
      </div>

      {/* Financial & DP Overview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Operations & Payroll */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Resumo Operacional de Departamento Pessoal & Folha
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
                  <DollarSign className="w-4 h-4 text-emerald-600" /> Folha de Pagamento Estimada
                </div>
                <div className="text-xl font-bold text-slate-900">
                  R$ {m.totalPayrollAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Salário líquido + encargos + horas extras</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
                  <Award className="w-4 h-4 text-purple-600" /> Benefícios Ativos
                </div>
                <div className="text-xl font-bold text-slate-900">{m.totalBenefitsCount} Tipos</div>
                <p className="text-[11px] text-slate-500 mt-1">VR, VT, Saúde, Combustível, Assiduidade</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
                  <Calendar className="w-4 h-4 text-amber-600" /> Férias no Mês
                </div>
                <div className="text-xl font-bold text-slate-900">{m.scheduledVacations} Programadas</div>
                <p className="text-[11px] text-slate-500 mt-1">Escala de descanso e períodos aquisitivos</p>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Acesso Rápido aos Módulos Oficiais</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => onNavigate('headhunter')}
                className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-left transition"
              >
                <div className="text-xs font-bold text-slate-900">Módulo Headhunter</div>
                <div className="text-[11px] text-slate-500">Busca executiva e sourcing</div>
              </button>

              <button
                onClick={() => onNavigate('departamento-pessoal')}
                className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-left transition"
              >
                <div className="text-xs font-bold text-slate-900">Dep. Pessoal (DP)</div>
                <div className="text-[11px] text-slate-500">Admissão, férias e rescisão</div>
              </button>

              <button
                onClick={() => onNavigate('folha-de-pagamento')}
                className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-left transition"
              >
                <div className="text-xs font-bold text-slate-900">Folha de Pagamento</div>
                <div className="text-[11px] text-slate-500">INSS, IRRF e holerites</div>
              </button>

              <button
                onClick={() => onNavigate('ia-rh')}
                className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-left transition"
              >
                <div className="text-xs font-bold text-slate-900">Assistente IA RH</div>
                <div className="text-[11px] text-slate-500">Triagem e match de currículos</div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Alerts & Notifications */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Alertas & Notificações Ativas
            </h3>

            {m.alerts && m.alerts.length > 0 ? (
              <div className="space-y-3">
                {m.alerts.map((alert: string, idx: number) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-amber-50/80 border border-amber-200/60 rounded-xl text-xs text-amber-900 font-medium flex items-start gap-2.5"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{alert}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-500 py-4 text-center border border-dashed border-slate-200 rounded-xl">
                Nenhum alerta pendente no momento. Todos os processos em dia.
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white p-6 rounded-2xl shadow-md">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-300 uppercase tracking-wider mb-2">
              <FileCheck className="w-4 h-4" /> Integração Multiempresa
            </div>
            <h4 className="text-base font-bold">Base de Dados Unificada</h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Candidatos contratados no módulo de Recrutamento/Headhunter são promovidos diretamente ao módulo de Funcionários no Departamento Pessoal mantendo o mesmo histórico centralizado.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Building2Icon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0V8m0 3h4m-4 0H9m4-3H9m4 0V5" />
  </svg>
);

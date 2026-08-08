import React, { useState, useEffect } from 'react';
import {
  Search,
  UserCheck,
  Briefcase,
  Sparkles,
  Award,
  Filter,
  Eye,
  FileText,
  Building2,
  Calendar,
  Send,
  Star,
  Plus,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  ShieldAlert,
  Users,
  ShieldCheck,
  RefreshCw,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Job, Candidate, Application } from '../../types';

interface Props {
  companyId: string;
  onOpenDrawer: (appId: string) => void;
  initialSubTab?: 'visão_geral' | 'projetos' | 'clientes' | 'financeiro' | 'portal_cliente';
}

export const HeadhunterView: React.FC<Props> = ({ companyId, onOpenDrawer, initialSubTab = 'visão_geral' }) => {
  const [subTab, setSubTab] = useState<'visão_geral' | 'projetos' | 'clientes' | 'financeiro' | 'portal_cliente'>(initialSubTab);

  useEffect(() => {
    if (initialSubTab) {
      setSubTab(initialSubTab);
    }
  }, [initialSubTab]);
  const [finSubTab, setFinSubTab] = useState<'indicadores' | 'receitas' | 'despesas' | 'comissoes' | 'garantias' | 'relatorios'>('indicadores');

  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [applications, setApplications] = useState<any[]>([]);
  const [talents, setTalents] = useState<Candidate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Filters for Projetos
  const [origemFilter, setOrigemFilter] = useState('todas');
  const [statusProjFilter, setStatusProjFilter] = useState('todas');

  // Filters for Clientes
  const [clienteFilter, setClienteFilter] = useState('todos');

  const fetchData = async () => {
    try {
      setLoading(true);
      const jobsRes = await fetch(`/api/company/jobs?companyId=${companyId}`);
      if (jobsRes.ok) {
        const jData = await jobsRes.json();
        setJobs(jData.jobs || []);
        if (jData.jobs?.length > 0 && !selectedJobId) {
          setSelectedJobId(jData.jobs[0].id);
        }
      }

      const poolRes = await fetch(`/api/company/candidates/pool?companyId=${companyId}`);
      if (poolRes.ok) {
        const pData = await poolRes.json();
        setTalents(pData.candidates || []);
      }
    } catch (e) {
      console.error('Error loading headhunter data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [companyId]);

  return (
    <div className="space-y-6 select-none font-sans">
      {/* Headhunter Sub-Navigation Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 rounded-2xl shadow-2xs flex items-center space-x-2 overflow-x-auto">
        {[
          { id: 'visão_geral', label: 'Visão Geral' },
          { id: 'projetos', label: 'Projetos' },
          { id: 'clientes', label: 'Clientes' },
          { id: 'financeiro', label: 'Financeiro' },
          { id: 'portal_cliente', label: 'Portal do Cliente' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              subTab === tab.id
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SUB-TAB: VISÃO GERAL */}
      {subTab === 'visão_geral' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold mb-2 border border-purple-400/20">
                <Award className="w-3.5 h-3.5" /> Módulo Headhunting Especializado
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Executive Search & Talent Sourcing</h1>
              <p className="text-purple-200 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                Busca ativa de talentos de alto nível. Os dados de candidatos e vagas são compartilhados nativamente com o ATS Recrutamento e Seleção.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Pipeline de Mapeamento Ativo
            </h2>
            <p className="text-xs text-slate-500">
              Selecione uma vaga para visualizar e mapear talentos diretamente do Banco de Talentos.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {jobs.map(j => (
                <div
                  key={j.id}
                  onClick={() => setSelectedJobId(j.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition ${
                    selectedJobId === j.id
                      ? 'border-purple-600 bg-purple-50/50 shadow-2xs'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-[10px] font-bold text-purple-600 uppercase block">{j.department || 'Executive'}</span>
                  <h3 className="font-bold text-slate-900 text-sm mt-0.5">{j.title}</h3>
                  <span className="text-xs text-slate-500 block mt-2">👥 {j.applicationsCount || 0} candidatos em seleção</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: PROJETOS */}
      {subTab === 'projetos' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Projetos de Executive Search & Vagas
                </h1>
                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-full">
                  {jobs.length} registros
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Visão completa unificada de vagas internas, contratações para clientes e projetos de busca ativa.
              </p>
            </div>

            <button className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-1.5 self-start md:self-auto">
              <Plus className="w-4 h-4" />
              <span>Cadastrar Nova Vaga / Projeto</span>
            </button>
          </div>

          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Buscar por cargo, empresa cliente ou responsável..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-bold pt-2 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-slate-400 text-[11px] uppercase tracking-wider">ORIGEM:</span>
                {['Todas', 'Vagas internas', 'Recrutamento para clientes', 'Headhunter / Busca ativa'].map((o, idx) => (
                  <button
                    key={idx}
                    className={`px-3 py-1.5 rounded-full transition ${
                      idx === 0 ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {o}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-slate-400 text-[11px] uppercase tracking-wider">STATUS:</span>
                {['Todas', 'Em andamento', 'Próximas do prazo', 'Concluídas', 'Canceladas'].map((s, idx) => (
                  <button
                    key={idx}
                    className={`px-3 py-1.5 rounded-full transition ${
                      idx === 0 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4">CARGO / PROJETO</th>
                    <th className="p-4">EMPRESA / CLIENTE</th>
                    <th className="p-4">ORIGEM</th>
                    <th className="p-4">RESPONSÁVEL</th>
                    <th className="p-4">PRAZO SLA</th>
                    <th className="p-4">CANDIDATOS</th>
                    <th className="p-4">STATUS</th>
                    <th className="p-4">HONORÁRIOS</th>
                    <th className="p-4 text-right">AÇÕES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {jobs.map(j => (
                    <tr key={j.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-4 font-bold text-slate-900">{j.title}</td>
                      <td className="p-4 text-slate-600">{j.department || 'InovaTech Software'}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 font-bold text-[10px] rounded-full uppercase">
                          Headhunter
                        </span>
                      </td>
                      <td className="p-4 text-slate-600">Mariana Lima</td>
                      <td className="p-4 text-slate-600">15 dias</td>
                      <td className="p-4 font-bold text-blue-600">{j.applicationsCount || 0}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full uppercase">
                          {j.status}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-slate-900">R$ 15.000,00</td>
                      <td className="p-4 text-right">
                        <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition">
                          Gerenciar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: CLIENTES */}
      {subTab === 'clientes' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Carteira de Clientes Headhunter
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Gestão cadastral, condições comerciais negociadas, acordos contratuais e histórico de relacionamento.
              </p>
            </div>

            <button className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-1.5 self-start md:self-auto">
              <Plus className="w-4 h-4" />
              <span>Novo Cliente Corporativo</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Buscar por razão social, nome fantasia, CNPJ..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
              />
            </div>

            <div className="flex items-center space-x-2 text-xs font-bold shrink-0">
              <span className="text-slate-400 uppercase text-[10px]">FILTRAR:</span>
              <button className="px-3 py-1.5 bg-purple-600 text-white rounded-lg">Todos</button>
              <button className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg">Ativo</button>
              <button className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg">Inativo</button>
            </div>
          </div>

          {/* Master Detail Split */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-xs space-y-2">
              <Building2 className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-bold text-slate-700">Nenhum cliente cadastrado.</p>
              <p className="text-[11px] text-slate-400">Clique em "Novo Cliente Corporativo" para cadastrar o primeiro cliente.</p>
            </div>

            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-400 text-xs space-y-2">
              <FileText className="w-10 h-10 text-slate-200 mx-auto" />
              <p className="font-bold text-slate-600">Selecione um cliente para visualizar os detalhes.</p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: FINANCEIRO */}
      {subTab === 'financeiro' && (
        <div className="space-y-6">
          {/* Financeiro Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl">💲</span>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Gestão Comercial & Financeiro Headhunter
                </h1>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 font-extrabold text-[10px] rounded-full uppercase">
                  INTEGRADO AO RECRUTAMENTO
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Controle unificado de faturamento de vagas, contas a receber, comissões de consultores, despesas operacionais e garantias contratuais.
              </p>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-1.5">
                <Plus className="w-4 h-4" />
                <span>Lançar Receita</span>
              </button>
              <button className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-1.5">
                <Plus className="w-4 h-4" />
                <span>Lançar Despesa</span>
              </button>
            </div>
          </div>

          {/* Financeiro Inner Subtabs */}
          <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold">
            {[
              { id: 'indicadores', label: '⏱ Visão Geral & Indicadores' },
              { id: 'receitas', label: '📈 Receitas & Faturamento' },
              { id: 'despesas', label: '📉 Despesas (Vaga & Gerais)' },
              { id: 'comissoes', label: '👥 Comissões de Consultores' },
              { id: 'garantias', label: '🛡 Garantias Contratuais' },
              { id: 'relatorios', label: '📋 Relatórios' }
            ].map(fTab => (
              <button
                key={fTab.id}
                onClick={() => setFinSubTab(fTab.id as any)}
                className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
                  finSubTab === fTab.id
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {fTab.label}
              </button>
            ))}
          </div>

          {/* 4 Financeiro KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                RECEITAS FATURADAS
              </span>
              <span className="text-2xl font-black text-slate-900 block">R$ 0,00</span>
              <span className="text-[11px] font-bold text-emerald-600 block">Recebido: R$ 0,00</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider block">
                CONTAS A RECEBER (AGUARDANDO)
              </span>
              <span className="text-2xl font-black text-amber-600 block">R$ 0,00</span>
              <span className="text-[11px] text-slate-500 block">Previsto em contrato</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-extrabold text-rose-600 uppercase tracking-wider block">
                DESPESAS OPERACIONAIS
              </span>
              <span className="text-2xl font-black text-rose-600 block">R$ 0,00</span>
              <span className="text-[11px] text-slate-500 block">Vagas: R$ 0,00 • Geral: R$ 0,00</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-extrabold text-purple-600 uppercase tracking-wider block">
                LUCRO LÍQUIDO ESTIMADO
              </span>
              <span className="text-2xl font-black text-purple-600 block">R$ 0,00</span>
              <span className="text-[11px] text-slate-500 block">Margem Média: 0.0%</span>
            </div>
          </div>

          {/* Lower Financial Widgets */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Comissões Widget */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span>👥 Resumo de Comissões</span>
                </h3>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">0 Registros</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl font-medium">
                  <span className="text-slate-600">Total Comissões Previstas</span>
                  <span className="font-bold text-slate-900">R$ 0,00</span>
                </div>
                <div className="flex justify-between p-2.5 bg-emerald-50 rounded-xl text-emerald-900 font-bold">
                  <span>Comissões Pagas</span>
                  <span>R$ 0,00</span>
                </div>
                <div className="flex justify-between p-2.5 bg-amber-50 rounded-xl text-amber-900 font-bold">
                  <span>Pendente de Pagamento</span>
                  <span>R$ 0,00</span>
                </div>
              </div>
            </div>

            {/* Garantias Widget */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>🛡 Status de Garantias</span>
                </h3>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">0 Total</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2.5 bg-emerald-50 rounded-xl text-emerald-900 font-bold">
                  <span>Garantias Ativas</span>
                  <span>0</span>
                </div>
                <div className="flex justify-between p-2.5 bg-amber-50 rounded-xl text-amber-900 font-bold">
                  <span>Próximas do Vencimento</span>
                  <span>0</span>
                </div>
                <div className="flex justify-between p-2.5 bg-slate-100 rounded-xl text-slate-700 font-bold">
                  <span>Encerradas com Sucesso</span>
                  <span>0</span>
                </div>
              </div>
            </div>

            {/* Top Clientes Widget */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <span>📈 Top Clientes por Faturamento</span>
              </h3>
              <p className="text-xs text-slate-400">Sem dados de faturamento cadastrados.</p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: PORTAL DO CLIENTE */}
      {subTab === 'portal_cliente' && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-center">
          <Building2 className="w-12 h-12 text-purple-600 mx-auto" />
          <h2 className="text-xl font-black text-slate-900">Portal do Cliente Headhunter</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Compartilhe links seguros e relatórios de acompanhamento em tempo real para os clientes acompanharem os processos de seleção sem necessidade de login complexo.
          </p>
          <button className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition">
            Gerar Link de Compartilhamento do Cliente
          </button>
        </div>
      )}
    </div>
  );
};

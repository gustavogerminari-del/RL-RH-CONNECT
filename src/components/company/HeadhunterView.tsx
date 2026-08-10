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
  ArrowDownRight,
  X,
  Phone,
  Mail,
  MapPin,
  Globe,
  Trash2,
  Edit,
  Check,
  AlertTriangle,
  Download
} from 'lucide-react';
import { Job, Candidate, HeadhunterClient, HeadhunterFinancial, HeadhunterFinancialStatus } from '../../types';

interface Props {
  companyId: string;
  onOpenDrawer: (appId: string) => void;
  initialSubTab?: 'visão_geral' | 'projetos' | 'clientes' | 'financeiro' | 'portal_cliente';
}

export const HeadhunterView: React.FC<Props> = ({ companyId, onOpenDrawer, initialSubTab = 'visão_geral' }) => {
  const [subTab, setSubTab] = useState<'visão_geral' | 'projetos' | 'clientes' | 'financeiro' | 'portal_cliente'>(
    initialSubTab
  );

  useEffect(() => {
    if (initialSubTab) {
      setSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [clients, setClients] = useState<HeadhunterClient[]>([]);
  const [selectedClient, setSelectedClient] = useState<HeadhunterClient | null>(null);
  const [clientTab, setClientTab] = useState<'resumo' | 'vagas' | 'candidatos' | 'contratacoes' | 'financeiro' | 'historico'>('resumo');
  const [financials, setFinancials] = useState<HeadhunterFinancial[]>([]);
  const [selectedFinancial, setSelectedFinancial] = useState<HeadhunterFinancial | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters for Clientes
  const [clientSearch, setClientSearch] = useState('');
  const [clientStatusFilter, setClientStatusFilter] = useState<'todos' | 'ativo' | 'inativo' | 'em_negociacao'>('todos');

  // New Client Modal State
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [clientForm, setClientForm] = useState<{
    corporateName: string;
    tradeName: string;
    cnpj: string;
    email: string;
    phone: string;
    whatsapp: string;
    website: string;
    zipCode: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    contactName: string;
    contactRole: string;
    contactEmail: string;
    contactPhone: string;
    contactWhatsapp: string;
    commercialResponsible: string;
    billingType: 'percentual_salario' | 'valor_fixo' | 'percentual_anual' | 'manual';
    feePercent: number;
    fixedFee: number;
    paymentDeadline: string;
    commercialNotes: string;
    startDate: string;
    endDate: string;
    status: 'ativo' | 'inativo' | 'em_negociacao';
    contractNotes: string;
  }>({
    corporateName: '',
    tradeName: '',
    cnpj: '',
    email: '',
    phone: '',
    whatsapp: '',
    website: '',
    zipCode: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    contactName: '',
    contactRole: '',
    contactEmail: '',
    contactPhone: '',
    contactWhatsapp: '',
    commercialResponsible: 'Gestor Comercial',
    billingType: 'percentual_salario',
    feePercent: 15,
    fixedFee: 3500,
    paymentDeadline: '30 dias',
    commercialNotes: '',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: '',
    status: 'ativo',
    contractNotes: ''
  });

  // Filters for Financeiro
  const [finStatusFilter, setFinStatusFilter] = useState<string>('todos');
  const [finClientFilter, setFinClientFilter] = useState<string>('todos');
  const [finSearch, setFinSearch] = useState<string>('');

  // Status Action Modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusTargetFin, setStatusTargetFin] = useState<HeadhunterFinancial | null>(null);
  const [newStatusValue, setNewStatusValue] = useState<HeadhunterFinancialStatus>('Cobrança gerada');
  const [statusNotes, setStatusNotes] = useState('');
  const [newDueDate, setNewDueDate] = useState('');

  // Portal do Cliente selection
  const [portalClientId, setPortalClientId] = useState<string>('');

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch Jobs
      const jobsRes = await fetch(`/api/company/jobs?companyId=${companyId}`);
      if (jobsRes.ok) {
        const jData = await jobsRes.json();
        setJobs(jData.jobs || []);
        if (jData.jobs?.length > 0 && !selectedJobId) {
          setSelectedJobId(jData.jobs[0].id);
        }
      }

      // Fetch Clients
      const clientsRes = await fetch(`/api/company/headhunter/clients?companyId=${companyId}`);
      if (clientsRes.ok) {
        const cData = await clientsRes.json();
        setClients(cData.clients || []);
        if (cData.clients?.length > 0 && !selectedClient) {
          setSelectedClient(cData.clients[0]);
        }
      }

      // Fetch Financials
      const finRes = await fetch(`/api/company/headhunter/financial?companyId=${companyId}`);
      if (finRes.ok) {
        const fData = await finRes.json();
        setFinancials(fData.financials || []);
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

  // Handle Save New Client
  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/company/headhunter/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...clientForm,
          companyId
        })
      });
      if (res.ok) {
        const data = await res.json();
        setClients([data.client, ...clients]);
        setSelectedClient(data.client);
        setShowNewClientModal(false);
        // Reset form
        setClientForm({
          corporateName: '',
          tradeName: '',
          cnpj: '',
          email: '',
          phone: '',
          whatsapp: '',
          website: '',
          zipCode: '',
          street: '',
          number: '',
          complement: '',
          neighborhood: '',
          city: '',
          state: '',
          contactName: '',
          contactRole: '',
          contactEmail: '',
          contactPhone: '',
          contactWhatsapp: '',
          commercialResponsible: 'Gestor Comercial',
          billingType: 'percentual_salario',
          feePercent: 15,
          fixedFee: 3500,
          paymentDeadline: '30 dias',
          commercialNotes: '',
          startDate: new Date().toISOString().slice(0, 10),
          endDate: '',
          status: 'ativo',
          contractNotes: ''
        });
      }
    } catch (err) {
      console.error('Error saving client:', err);
    }
  };

  // Handle Status Update for Financial Record
  const handleUpdateFinancialStatus = async () => {
    if (!statusTargetFin) return;
    try {
      const res = await fetch(`/api/company/headhunter/financial/${statusTargetFin.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatusValue,
          notes: statusNotes,
          dueDate: newDueDate || statusTargetFin.dueDate,
          user: 'Gestor Financeiro RH'
        })
      });
      if (res.ok) {
        const data = await res.json();
        setFinancials(financials.map(f => (f.id === data.financial.id ? data.financial : f)));
        if (selectedFinancial?.id === data.financial.id) {
          setSelectedFinancial(data.financial);
        }
        setShowStatusModal(false);
        setStatusTargetFin(null);
        setStatusNotes('');
      }
    } catch (err) {
      console.error('Error updating financial status:', err);
    }
  };

  // Filtered Clients
  const filteredClients = clients.filter(c => {
    if (clientStatusFilter !== 'todos' && c.status !== clientStatusFilter) return false;
    if (clientSearch.trim()) {
      const q = clientSearch.toLowerCase();
      const name = (c.tradeName || c.corporateName || '').toLowerCase();
      const cnpj = (c.cnpj || '').toLowerCase();
      return name.includes(q) || cnpj.includes(q);
    }
    return true;
  });

  // Filtered Financials
  const filteredFinancials = financials.filter(f => {
    if (finStatusFilter !== 'todos' && f.status !== finStatusFilter) return false;
    if (finClientFilter !== 'todos' && f.clientId !== finClientFilter) return false;
    if (finSearch.trim()) {
      const q = finSearch.toLowerCase();
      return (
        f.candidateName.toLowerCase().includes(q) ||
        f.jobTitle.toLowerCase().includes(q) ||
        f.clientName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // KPI Calculations
  const aFaturarItems = financials.filter(f => f.status === 'A faturar');
  const aFaturarTotal = aFaturarItems.reduce((sum, f) => sum + (f.feeAmount || 0), 0);

  const aReceberItems = financials.filter(f => f.status === 'Cobrança gerada' || f.status === 'Aguardando pagamento');
  const aReceberTotal = aReceberItems.reduce((sum, f) => sum + (f.feeAmount || 0), 0);

  const pagoItems = financials.filter(f => f.status === 'Pago');
  const pagoTotal = pagoItems.reduce((sum, f) => sum + (f.feeAmount || 0), 0);

  const vencidoItems = financials.filter(f => f.status === 'Vencido');
  const vencidoTotal = vencidoItems.reduce((sum, f) => sum + (f.feeAmount || 0), 0);

  const currentClientJobs = selectedClient
    ? jobs.filter(j => j.clientId === selectedClient.id || j.clientName?.toLowerCase() === (selectedClient.tradeName || '').toLowerCase())
    : [];

  const currentClientFinancials = selectedClient
    ? financials.filter(f => f.clientId === selectedClient.id)
    : [];

  return (
    <div className="space-y-6 select-none font-sans">
      {/* Sub-Navigation Bar */}
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
                Busca ativa e gestão de contratações corporativas com faturamento integrado.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">CLIENTES CORPORATIVOS</span>
              <span className="text-3xl font-black text-slate-900 block">{clients.length}</span>
              <span className="text-xs text-slate-500 block">Ativos: {clients.filter(c => c.status === 'ativo').length}</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <span className="text-[10px] font-extrabold text-purple-600 uppercase tracking-wider block">A FATURAR / EM COBRANÇA</span>
              <span className="text-3xl font-black text-purple-600 block">
                R$ {(aFaturarTotal + aReceberTotal).toLocaleString('pt-BR')}
              </span>
              <span className="text-xs text-slate-500 block">{aFaturarItems.length + aReceberItems.length} contratações registradas</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider block">HONORÁRIOS RECEBIDOS</span>
              <span className="text-3xl font-black text-emerald-600 block">
                R$ {pagoTotal.toLocaleString('pt-BR')}
              </span>
              <span className="text-xs text-slate-500 block">{pagoItems.length} faturamentos liquidados</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Projetos Ativos de Headhunter
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {jobs
                .filter(j => j.origin === 'headhunter' || j.origin === 'recrutamento_cliente')
                .map(j => (
                  <div
                    key={j.id}
                    onClick={() => setSelectedJobId(j.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition ${
                      selectedJobId === j.id
                        ? 'border-purple-600 bg-purple-50/50 shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-purple-600 uppercase block">{j.clientName || 'Cliente Headhunter'}</span>
                    <h3 className="font-bold text-slate-900 text-sm mt-0.5">{j.title}</h3>
                    <div className="flex items-center justify-between text-xs text-slate-500 mt-3 pt-2 border-t border-slate-100">
                      <span>R$ {j.salaryMin ? j.salaryMin.toLocaleString('pt-BR') : '5.000'}</span>
                      <span className="font-bold text-purple-700">{j.applicationsCount || 0} candidatos</span>
                    </div>
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
                  {jobs.length} vagas
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Visão completa unificada de vagas internas e projetos de headhunting.
              </p>
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
                    <th className="p-4">REMUNERAÇÃO</th>
                    <th className="p-4">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {jobs.map(j => (
                    <tr key={j.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-4 font-bold text-slate-900">{j.title}</td>
                      <td className="p-4 text-slate-600">{j.clientName || 'Interna (RL Connect)'}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 font-bold text-[10px] rounded-full uppercase">
                          {j.origin === 'headhunter' ? 'Headhunter' : j.origin === 'recrutamento_cliente' ? 'Cliente' : 'Interna'}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-slate-900">
                        {j.salaryMin ? `R$ ${j.salaryMin.toLocaleString('pt-BR')}` : 'A combinar'}
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full uppercase">
                          {j.status}
                        </span>
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
                Gestão cadastral, condições comerciais negociadas e acordos contratuais.
              </p>
            </div>

            <button
              onClick={() => setShowNewClientModal(true)}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-1.5 self-start md:self-auto"
            >
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
                value={clientSearch}
                onChange={e => setClientSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
              />
            </div>

            <div className="flex items-center space-x-2 text-xs font-bold shrink-0">
              <span className="text-slate-400 uppercase text-[10px]">FILTRAR:</span>
              <button
                onClick={() => setClientStatusFilter('todos')}
                className={`px-3 py-1.5 rounded-lg transition ${clientStatusFilter === 'todos' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                Todos
              </button>
              <button
                onClick={() => setClientStatusFilter('ativo')}
                className={`px-3 py-1.5 rounded-lg transition ${clientStatusFilter === 'ativo' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                Ativo
              </button>
              <button
                onClick={() => setClientStatusFilter('inativo')}
                className={`px-3 py-1.5 rounded-lg transition ${clientStatusFilter === 'inativo' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                Inativo
              </button>
            </div>
          </div>

          {/* Master Detail Split */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Client List */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider px-2">
                Empresas Cadastradas ({filteredClients.length})
              </h3>

              {filteredClients.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs space-y-2">
                  <Building2 className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="font-bold text-slate-700">Nenhum cliente encontrado.</p>
                  <p className="text-[11px] text-slate-400">Clique em "Novo Cliente Corporativo" para cadastrar.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {filteredClients.map(c => (
                    <div
                      key={c.id}
                      onClick={() => {
                        setSelectedClient(c);
                        setClientTab('resumo');
                      }}
                      className={`p-3.5 rounded-xl border cursor-pointer transition ${
                        selectedClient?.id === c.id
                          ? 'border-purple-600 bg-purple-50/60 shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900 text-xs">{c.tradeName || c.corporateName}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            c.status === 'ativo' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 font-medium">
                        CNPJ: {c.cnpj || 'Não informado'} • {c.city || 'São Paulo'}, {c.state || 'SP'}
                      </p>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10px] font-bold text-purple-700">
                        <span>Regra: {c.billingType}</span>
                        <span>{c.feePercent ? `${c.feePercent}%` : `R$ ${c.fixedFee}`}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Selected Client Detail Panel */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
              {!selectedClient ? (
                <div className="p-12 text-center text-slate-400 text-xs space-y-2">
                  <FileText className="w-10 h-10 text-slate-200 mx-auto" />
                  <p className="font-bold text-slate-600">Selecione um cliente para visualizar os detalhes.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Client Header Info */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h2 className="text-xl font-black text-slate-900">{selectedClient.tradeName || selectedClient.corporateName}</h2>
                        <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 font-extrabold text-[10px] rounded-full uppercase">
                          {selectedClient.status}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-500 mt-1">
                        {selectedClient.corporateName} • CNPJ: {selectedClient.cnpj || 'Inexistente'}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 text-xs font-bold">
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg">
                        ID: {selectedClient.id}
                      </span>
                    </div>
                  </div>

                  {/* Sub-tabs inside Client Panel */}
                  <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 text-xs font-bold overflow-x-auto">
                    {[
                      { id: 'resumo', label: 'Resumo' },
                      { id: 'vagas', label: `Vagas / Projetos (${currentClientJobs.length})` },
                      { id: 'contratacoes', label: `Contratações (${currentClientFinancials.length})` },
                      { id: 'financeiro', label: 'Financeiro' },
                      { id: 'historico', label: 'Histórico' }
                    ].map(ct => (
                      <button
                        key={ct.id}
                        onClick={() => setClientTab(ct.id as any)}
                        className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                          clientTab === ct.id
                            ? 'bg-purple-600 text-white font-black'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {ct.label}
                      </button>
                    ))}
                  </div>

                  {/* Client Tab Contents */}
                  {clientTab === 'resumo' && (
                    <div className="space-y-5 text-xs">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                          <h4 className="font-extrabold text-slate-800 uppercase tracking-wider text-[10px]">CONTATO PRINCIPAL</h4>
                          <p className="font-bold text-slate-900">{selectedClient.contactName || 'Não cadastrado'}</p>
                          <p className="text-slate-600">{selectedClient.contactRole || 'Responsável'}</p>
                          <p className="text-slate-600">✉️ {selectedClient.contactEmail || 'Sem email'}</p>
                          <p className="text-slate-600">📞 {selectedClient.contactPhone || 'Sem telefone'}</p>
                        </div>

                        <div className="bg-purple-50 p-4 rounded-xl border border-purple-200 space-y-2">
                          <h4 className="font-extrabold text-purple-900 uppercase tracking-wider text-[10px]">CONDIÇÕES COMERCIAIS</h4>
                          <p className="font-bold text-purple-900">
                            Tipo de Cobrança: <span className="uppercase">{selectedClient.billingType}</span>
                          </p>
                          <p className="text-purple-800">
                            Honorários: {selectedClient.feePercent ? `${selectedClient.feePercent}% sobre contratação` : `R$ ${selectedClient.fixedFee}`}
                          </p>
                          <p className="text-purple-800">Prazo de Pagamento: {selectedClient.paymentDeadline || '30 dias'}</p>
                          <p className="text-purple-800">Responsável Comercial: {selectedClient.commercialResponsible || 'RH'}</p>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                        <h4 className="font-extrabold text-slate-800 uppercase tracking-wider text-[10px]">ENDEREÇO EMPRESARIAL</h4>
                        <p className="text-slate-700 font-medium">
                          {selectedClient.street || 'Rua não informada'}, {selectedClient.number || 'S/N'} {selectedClient.complement ? `- ${selectedClient.complement}` : ''}
                        </p>
                        <p className="text-slate-600 font-medium">
                          {selectedClient.neighborhood || ''} • {selectedClient.city || 'Cidade'} / {selectedClient.state || 'UF'} • CEP: {selectedClient.zipCode || 'N/A'}
                        </p>
                      </div>
                    </div>
                  )}

                  {clientTab === 'vagas' && (
                    <div className="space-y-3 text-xs">
                      {currentClientJobs.length === 0 ? (
                        <p className="text-slate-400 py-6 text-center">Nenhuma vaga associada a este cliente.</p>
                      ) : (
                        currentClientJobs.map(j => (
                          <div key={j.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                            <div>
                              <span className="font-bold text-slate-900 block">{j.title}</span>
                              <span className="text-[11px] text-slate-500">Salário: R$ {j.salaryMin ? j.salaryMin.toLocaleString('pt-BR') : 'A combinar'}</span>
                            </div>
                            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full uppercase">
                              {j.status}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {clientTab === 'contratacoes' && (
                    <div className="space-y-3 text-xs">
                      {currentClientFinancials.length === 0 ? (
                        <p className="text-slate-400 py-6 text-center">Nenhuma contratação faturada para este cliente.</p>
                      ) : (
                        currentClientFinancials.map(f => (
                          <div key={f.id} className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl flex items-center justify-between">
                            <div>
                              <span className="font-bold text-slate-900 block">{f.candidateName}</span>
                              <span className="text-[11px] text-slate-600">Vaga: {f.jobTitle} • Data: {f.contractDate}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-black text-slate-900 block">R$ {f.feeAmount.toLocaleString('pt-BR')}</span>
                              <span className="text-[10px] font-bold text-purple-700">{f.status}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {clientTab === 'financeiro' && (
                    <div className="space-y-3 text-xs">
                      <div className="bg-purple-50 p-4 rounded-xl border border-purple-200 flex justify-between items-center">
                        <div>
                          <span className="text-[10px] font-bold text-purple-700 uppercase block">TOTAL FATURADO</span>
                          <span className="text-xl font-black text-purple-900">
                            R$ {currentClientFinancials.reduce((sum, f) => sum + f.feeAmount, 0).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-purple-800">{currentClientFinancials.length} Faturamentos</span>
                      </div>
                    </div>
                  )}

                  {clientTab === 'historico' && (
                    <div className="space-y-2 text-xs">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600">
                        <span className="font-bold text-slate-900 block">Cliente Cadastrado no RL Connect</span>
                        <span className="text-[10px] text-slate-400">{selectedClient.createdAt ? new Date(selectedClient.createdAt).toLocaleDateString('pt-BR') : 'Data recente'}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: FINANCEIRO */}
      {subTab === 'financeiro' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl">💲</span>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Gestão Comercial & Financeiro Headhunter
                </h1>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 font-extrabold text-[10px] rounded-full uppercase">
                  FLUXO COMPLETO
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Acompanhamento real de honorários de contratações, faturamento e baixas de pagamentos.
              </p>
            </div>
          </div>

          {/* 5 Real KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider block">
                A FATURAR
              </span>
              <span className="text-xl font-black text-amber-600 block">R$ {aFaturarTotal.toLocaleString('pt-BR')}</span>
              <span className="text-[11px] text-slate-500 block">{aFaturarItems.length} contratações</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider block">
                A RECEBER
              </span>
              <span className="text-xl font-black text-blue-600 block">R$ {aReceberTotal.toLocaleString('pt-BR')}</span>
              <span className="text-[11px] text-slate-500 block">{aReceberItems.length} cobranças</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider block">
                RECEBIDO NO MÊS
              </span>
              <span className="text-xl font-black text-emerald-600 block">R$ {pagoTotal.toLocaleString('pt-BR')}</span>
              <span className="text-[11px] text-slate-500 block">{pagoItems.length} pagos</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-extrabold text-rose-600 uppercase tracking-wider block">
                VENCIDO
              </span>
              <span className="text-xl font-black text-rose-600 block">R$ {vencidoTotal.toLocaleString('pt-BR')}</span>
              <span className="text-[11px] text-slate-500 block">{vencidoItems.length} pendentes</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-extrabold text-purple-600 uppercase tracking-wider block">
                CONTRATAÇÕES TOTAL
              </span>
              <span className="text-xl font-black text-purple-600 block">{financials.length}</span>
              <span className="text-[11px] text-slate-500 block">Módulo Headhunter</span>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar candidato, vaga ou cliente..."
                value={finSearch}
                onChange={e => setFinSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex items-center space-x-2 text-xs font-bold">
              <span className="text-slate-400 text-[10px] uppercase">STATUS:</span>
              <select
                value={finStatusFilter}
                onChange={e => setFinStatusFilter(e.target.value)}
                className="p-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
              >
                <option value="todos">Todos os Status</option>
                <option value="Aguardando contratação">Aguardando contratação</option>
                <option value="A faturar">A faturar</option>
                <option value="Cobrança gerada">Cobrança gerada</option>
                <option value="Aguardando pagamento">Aguardando pagamento</option>
                <option value="Pago">Pago</option>
                <option value="Vencido">Vencido</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 text-xs font-bold">
              <span className="text-slate-400 text-[10px] uppercase">CLIENTE:</span>
              <select
                value={finClientFilter}
                onChange={e => setFinClientFilter(e.target.value)}
                className="p-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
              >
                <option value="todos">Todos os Clientes</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.tradeName || c.corporateName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Financial Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4">CANDIDATO CONTRATADO</th>
                    <th className="p-4">VAGA</th>
                    <th className="p-4">CLIENTE CONTRATANTE</th>
                    <th className="p-4">CÁLCULO HONORÁRIO</th>
                    <th className="p-4">VALOR COBRANÇA</th>
                    <th className="p-4">VENCIMENTO</th>
                    <th className="p-4">STATUS</th>
                    <th className="p-4 text-right">AÇÕES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {filteredFinancials.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        Nenhum lançamento financeiro registrado.
                      </td>
                    </tr>
                  ) : (
                    filteredFinancials.map(f => (
                      <tr key={f.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-4 font-bold text-slate-900">{f.candidateName}</td>
                        <td className="p-4 text-slate-600">{f.jobTitle}</td>
                        <td className="p-4 font-bold text-slate-800">{f.clientName}</td>
                        <td className="p-4 text-slate-500 text-[11px]">{f.calculationFormula || f.billingType}</td>
                        <td className="p-4 font-black text-slate-900 text-sm">
                          R$ {f.feeAmount.toLocaleString('pt-BR')}
                        </td>
                        <td className="p-4 text-slate-600">{f.dueDate ? new Date(f.dueDate).toLocaleDateString('pt-BR') : 'A definir'}</td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                              f.status === 'Pago'
                                ? 'bg-emerald-100 text-emerald-800'
                                : f.status === 'A faturar'
                                ? 'bg-amber-100 text-amber-800'
                                : f.status === 'Vencido'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {f.status}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-1">
                          <button
                            onClick={() => setSelectedFinancial(f)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition"
                          >
                            Detalhes
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: PORTAL DO CLIENTE */}
      {subTab === 'portal_cliente' && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <Building2 className="w-12 h-12 text-purple-600 mx-auto" />
            <h2 className="text-xl font-black text-slate-900">Portal do Cliente Headhunter</h2>
            <p className="text-xs text-slate-500">
              Selecione uma empresa cliente para simular a visualização dedicada do portal com acompanhamento de vagas e contratações em tempo real.
            </p>

            <div className="pt-2">
              <select
                value={portalClientId}
                onChange={e => setPortalClientId(e.target.value)}
                className="p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 w-full max-w-sm"
              >
                <option value="">-- Selecione o Cliente --</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.tradeName || c.corporateName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {portalClientId && (
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-6 animate-in fade-in">
              {(() => {
                const cObj = clients.find(c => c.id === portalClientId);
                const pJobs = jobs.filter(j => j.clientId === portalClientId || j.clientName?.toLowerCase() === (cObj?.tradeName || '').toLowerCase());
                const pFins = financials.filter(f => f.clientId === portalClientId);

                return (
                  <div className="space-y-5">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                      <div>
                        <h3 className="text-lg font-extrabold text-slate-900">{cObj?.tradeName || cObj?.corporateName}</h3>
                        <p className="text-xs text-slate-500">Portal de Acompanhamento do Cliente</p>
                      </div>
                      <span className="px-3 py-1 bg-purple-600 text-white font-bold text-xs rounded-lg">
                        Link Ativo
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                        <h4 className="font-bold text-slate-800">Projetos & Vagas em Andamento ({pJobs.length})</h4>
                        {pJobs.map(j => (
                          <div key={j.id} className="p-2.5 bg-slate-50 rounded-lg flex justify-between font-medium">
                            <span>{j.title}</span>
                            <span className="font-bold text-purple-700">{j.status}</span>
                          </div>
                        ))}
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                        <h4 className="font-bold text-slate-800">Candidatos Contratados ({pFins.length})</h4>
                        {pFins.map(f => (
                          <div key={f.id} className="p-2.5 bg-emerald-50 rounded-lg flex justify-between font-medium">
                            <span>{f.candidateName}</span>
                            <span className="font-bold text-emerald-800">Admitido</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* NEW CLIENT MODAL */}
      {showNewClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto font-sans">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center sticky top-0 z-10">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-400" /> Cadastro de Novo Cliente Corporativo
              </h3>
              <button onClick={() => setShowNewClientModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="p-6 space-y-5 text-xs">
              {/* Section 1: Empresa */}
              <div className="space-y-3">
                <h4 className="font-black text-slate-800 uppercase tracking-wider text-[11px]">1. DADOS DA EMPRESA</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Razão Social *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Empresa Soluções LTDA"
                      value={clientForm.corporateName}
                      onChange={e => setClientForm({ ...clientForm, corporateName: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nome Fantasia *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Soluções Tech"
                      value={clientForm.tradeName}
                      onChange={e => setClientForm({ ...clientForm, tradeName: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">CNPJ *</label>
                    <input
                      type="text"
                      required
                      placeholder="00.000.000/0001-00"
                      value={clientForm.cnpj}
                      onChange={e => setClientForm({ ...clientForm, cnpj: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">E-mail Corporativo</label>
                    <input
                      type="email"
                      placeholder="contato@empresa.com"
                      value={clientForm.email}
                      onChange={e => setClientForm({ ...clientForm, email: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Contato */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h4 className="font-black text-slate-800 uppercase tracking-wider text-[11px]">2. CONTATO RESPONSÁVEL</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nome do Responsável *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Carlos Silva"
                      value={clientForm.contactName}
                      onChange={e => setClientForm({ ...clientForm, contactName: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Cargo</label>
                    <input
                      type="text"
                      placeholder="Ex: Gerente de RH"
                      value={clientForm.contactRole}
                      onChange={e => setClientForm({ ...clientForm, contactRole: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Comercial */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h4 className="font-black text-slate-800 uppercase tracking-wider text-[11px]">3. CONDIÇÕES COMERCIAIS</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tipo de Cobrança</label>
                    <select
                      value={clientForm.billingType}
                      onChange={e => setClientForm({ ...clientForm, billingType: e.target.value as any })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl font-bold"
                    >
                      <option value="percentual_salario">Percentual do Salário</option>
                      <option value="valor_fixo">Valor Fixo</option>
                      <option value="percentual_anual">Percentual Anual</option>
                      <option value="manual">Manual / Negociado</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Percentual (%)</label>
                    <input
                      type="number"
                      value={clientForm.feePercent}
                      onChange={e => setClientForm({ ...clientForm, feePercent: Number(e.target.value) })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Valor Fixo (R$)</label>
                    <input
                      type="number"
                      value={clientForm.fixedFee}
                      onChange={e => setClientForm({ ...clientForm, fixedFee: Number(e.target.value) })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowNewClientModal(false)}
                  className="px-4 py-2 border border-slate-300 font-bold rounded-xl text-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-xl shadow-md"
                >
                  Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SELECTED FINANCIAL DETAILS MODAL */}
      {selectedFinancial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full font-sans overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-base">Faturamento Headhunter #{selectedFinancial.id}</h3>
                <p className="text-xs text-slate-400">Detalhamento comercial e status do lançamento</p>
              </div>
              <button onClick={() => setSelectedFinancial(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="font-bold text-slate-500">Candidato:</span>
                  <span className="font-extrabold text-slate-900">{selectedFinancial.candidateName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-slate-500">Vaga:</span>
                  <span className="font-bold text-slate-800">{selectedFinancial.jobTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-slate-500">Cliente:</span>
                  <span className="font-bold text-slate-800">{selectedFinancial.clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-slate-500">Valor Cobrança:</span>
                  <span className="font-black text-purple-700 text-sm">
                    R$ {selectedFinancial.feeAmount.toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-slate-500">Status Atual:</span>
                  <span className="font-bold text-emerald-700 uppercase">{selectedFinancial.status}</span>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="space-y-2 pt-2">
                <span className="block font-bold text-slate-700 text-[11px] uppercase">Alterar Status da Cobrança:</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setStatusTargetFin(selectedFinancial);
                      setNewStatusValue('Cobrança gerada');
                      setShowStatusModal(true);
                    }}
                    className="p-2.5 bg-blue-50 border border-blue-200 text-blue-800 font-bold rounded-xl text-center hover:bg-blue-100"
                  >
                    Gerar Cobrança
                  </button>

                  <button
                    onClick={() => {
                      setStatusTargetFin(selectedFinancial);
                      setNewStatusValue('Pago');
                      setShowStatusModal(true);
                    }}
                    className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold rounded-xl text-center hover:bg-emerald-100"
                  >
                    Marcar como PAGO
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedFinancial(null)}
                className="px-4 py-2 bg-slate-200 font-bold rounded-xl text-slate-700"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATUS CHANGE CONFIRMATION MODAL */}
      {showStatusModal && statusTargetFin && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full font-sans p-6 space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base">Atualizar Status Financeiro</h3>
            <p className="text-xs text-slate-500">
              Alterar status de <strong>{statusTargetFin.candidateName}</strong> para:
            </p>

            <select
              value={newStatusValue}
              onChange={e => setNewStatusValue(e.target.value as any)}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
            >
              <option value="A faturar">A faturar</option>
              <option value="Cobrança gerada">Cobrança gerada</option>
              <option value="Aguardando pagamento">Aguardando pagamento</option>
              <option value="Pago">Pago</option>
              <option value="Vencido">Vencido</option>
              <option value="Cancelado">Cancelado</option>
            </select>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Observações de Faturamento</label>
              <textarea
                rows={3}
                placeholder="Ex: Fatura emitida via e-Notas, enviada para financeiro do cliente."
                value={statusNotes}
                onChange={e => setStatusNotes(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 border border-slate-300 font-bold rounded-xl text-xs text-slate-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateFinancialStatus}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-xl text-xs shadow-md"
              >
                Confirmar Alteração
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

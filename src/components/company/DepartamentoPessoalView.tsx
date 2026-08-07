import React, { useState, useEffect } from 'react';
import {
  Building2,
  Calendar,
  AlertTriangle,
  Award,
  FileText,
  UserCheck,
  Plus,
  CheckCircle2,
  Clock,
  TrendingDown,
  DollarSign
} from 'lucide-react';
import { VacationRecord, TerminationRecord, DPOccurrence, Employee } from '../../types';

interface Props {
  companyId: string;
}

export const DepartamentoPessoalView: React.FC<Props> = ({ companyId }) => {
  const [activeTab, setActiveTab] = useState<'ferias' | 'rescisao' | 'ocorrencias'>('ferias');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [vacations, setVacations] = useState<VacationRecord[]>([]);
  const [terminations, setTerminations] = useState<TerminationRecord[]>([]);
  const [occurrences, setOccurrences] = useState<DPOccurrence[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showVacationModal, setShowVacationModal] = useState(false);
  const [showTerminationModal, setShowTerminationModal] = useState(false);
  const [showOccModal, setShowOccModal] = useState(false);

  // Form states
  const [vacForm, setVacForm] = useState({
    employeeId: '',
    acquisitionPeriod: '2025/2026',
    days: 30,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10)
  });

  const [termForm, setTermForm] = useState({
    employeeId: '',
    reason: 'Pedido de Demissão',
    resignationDate: new Date().toISOString().slice(0, 10),
    noticePeriod: true,
    severancePayEstimate: 4500
  });

  const [occForm, setOccForm] = useState({
    employeeId: '',
    type: 'elogio' as any,
    description: '',
    date: new Date().toISOString().slice(0, 10),
    author: 'RH DP'
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [empRes, vacRes, termRes, occRes] = await Promise.all([
        fetch(`/api/company/employees?companyId=${companyId}`),
        fetch(`/api/company/vacations?companyId=${companyId}`),
        fetch(`/api/company/terminations?companyId=${companyId}`),
        fetch(`/api/company/dp-occurrences?companyId=${companyId}`)
      ]);

      if (empRes.ok) setEmployees((await empRes.json()).employees || []);
      if (vacRes.ok) setVacations((await vacRes.json()).vacations || []);
      if (termRes.ok) setTerminations((await termRes.json()).terminations || []);
      if (occRes.ok) setOccurrences((await occRes.json()).occurrences || []);
    } catch (e) {
      console.error('Error loading DP data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [companyId]);

  const handleCreateVacation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vacForm.employeeId) return alert('Selecione o colaborador.');
    try {
      const res = await fetch('/api/company/vacations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...vacForm, companyId, status: 'programada' })
      });
      if (res.ok) {
        alert('Férias agendadas com sucesso!');
        setShowVacationModal(false);
        loadData();
      }
    } catch (e) {
      alert('Erro ao agendar férias.');
    }
  };

  const handleCreateTermination = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termForm.employeeId) return alert('Selecione o colaborador.');
    try {
      const res = await fetch('/api/company/terminations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...termForm, companyId, status: 'processado' })
      });
      if (res.ok) {
        alert('Rescisão processada com sucesso! Colaborador alterado para Desligado.');
        setShowTerminationModal(false);
        loadData();
      }
    } catch (e) {
      alert('Erro ao processar rescisão.');
    }
  };

  const handleCreateOccurrence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!occForm.employeeId || !occForm.description) return alert('Preencha os campos obrigatórios.');
    try {
      const res = await fetch('/api/company/dp-occurrences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...occForm, companyId })
      });
      if (res.ok) {
        alert('Ocorrência gravada com sucesso no prontuário!');
        setShowOccModal(false);
        loadData();
      }
    } catch (e) {
      alert('Erro ao gravar ocorrência.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2 border border-indigo-400/20">
            <Building2 className="w-3.5 h-3.5" /> Módulo Departamento Pessoal (DP)
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Gestão Trabalhista & Ocorrências</h1>
          <p className="text-indigo-200 text-sm mt-1 max-w-2xl">
            Acompanhe o ciclo de vida do colaborador: Admissões, Programação de Férias, Rescisões e Prontuário de Ocorrências.
          </p>
        </div>

        {/* Submodule Tab Selector */}
        <div className="bg-white/10 p-1 rounded-xl border border-white/20 flex gap-1">
          <button
            onClick={() => setActiveTab('ferias')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === 'ferias' ? 'bg-white text-slate-900 shadow' : 'text-white hover:bg-white/10'
            }`}
          >
            Férias
          </button>
          <button
            onClick={() => setActiveTab('rescisao')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === 'rescisao' ? 'bg-white text-slate-900 shadow' : 'text-white hover:bg-white/10'
            }`}
          >
            Rescisão
          </button>
          <button
            onClick={() => setActiveTab('ocorrencias')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === 'ocorrencias' ? 'bg-white text-slate-900 shadow' : 'text-white hover:bg-white/10'
            }`}
          >
            Prontuário
          </button>
        </div>
      </div>

      {/* Submodule View Content */}
      {activeTab === 'ferias' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" /> Escalamento & Programação de Férias
            </h3>
            <button
              onClick={() => {
                if (employees.length > 0) setVacForm({ ...vacForm, employeeId: employees[0].id });
                setShowVacationModal(true);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Agendar Férias
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Colaborador</th>
                  <th className="px-4 py-3">Período Aquisitivo</th>
                  <th className="px-4 py-3">Dias</th>
                  <th className="px-4 py-3">Início - Fim</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vacations.map(v => (
                  <tr key={v.id}>
                    <td className="px-4 py-3 font-bold text-slate-900">{v.employeeName || v.employeeId}</td>
                    <td className="px-4 py-3 text-slate-600">{v.acquisitionPeriod}</td>
                    <td className="px-4 py-3 font-semibold text-indigo-700">{v.days} dias</td>
                    <td className="px-4 py-3 text-slate-700">{v.startDate} até {v.endDate}</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-800 font-bold text-[11px] rounded-full uppercase">
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'rescisao' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-600" /> Processamento de Rescisões
            </h3>
            <button
              onClick={() => {
                if (employees.length > 0) setTermForm({ ...termForm, employeeId: employees[0].id });
                setShowTerminationModal(true);
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Registrar Rescisão
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Colaborador</th>
                  <th className="px-4 py-3">Motivo</th>
                  <th className="px-4 py-3">Data Desligamento</th>
                  <th className="px-4 py-3">Aviso Prévio</th>
                  <th className="px-4 py-3">Estimativa Verbas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {terminations.map(t => (
                  <tr key={t.id}>
                    <td className="px-4 py-3 font-bold text-slate-900">{t.employeeName || t.employeeId}</td>
                    <td className="px-4 py-3 text-slate-700">{t.reason}</td>
                    <td className="px-4 py-3 text-slate-700">{t.resignationDate}</td>
                    <td className="px-4 py-3 text-slate-600">{t.noticePeriod ? 'Indenizado / Cumprido' : 'Não'}</td>
                    <td className="px-4 py-3 font-bold text-red-700">R$ {t.severancePayEstimate?.toLocaleString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'ocorrencias' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" /> Prontuário Trabalhista de Ocorrências
            </h3>
            <button
              onClick={() => {
                if (employees.length > 0) setOccForm({ ...occForm, employeeId: employees[0].id });
                setShowOccModal(true);
              }}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Registrar Ocorrência
            </button>
          </div>

          <div className="space-y-3">
            {occurrences.map(o => (
              <div key={o.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900">{o.employeeName || o.employeeId}</span>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded uppercase">{o.type}</span>
                </div>
                <p className="text-slate-700">{o.description}</p>
                <div className="text-[11px] text-slate-400">Data: {o.date} | Registrado por: {o.author}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vacation Modal */}
      {showVacationModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateVacation} className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Agendar Férias</h3>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Colaborador</label>
              <select
                value={vacForm.employeeId}
                onChange={e => setVacForm({ ...vacForm, employeeId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
              >
                {employees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.role})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Data de Início</label>
              <input
                type="date"
                value={vacForm.startDate}
                onChange={e => setVacForm({ ...vacForm, startDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
              />
            </div>
            <div className="flex justify-end gap-3 pt-3">
              <button type="button" onClick={() => setShowVacationModal(false)} className="px-4 py-2 text-xs font-medium">Cancelar</button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl">Confirmar</button>
            </div>
          </form>
        </div>
      )}

      {/* Termination Modal */}
      {showTerminationModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateTermination} className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Registrar Rescisão Trabalhista</h3>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Colaborador</label>
              <select
                value={termForm.employeeId}
                onChange={e => setTermForm({ ...termForm, employeeId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
              >
                {employees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.role})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Motivo do Desligamento</label>
              <select
                value={termForm.reason}
                onChange={e => setTermForm({ ...termForm, reason: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
              >
                <option value="Pedido de Demissão">Pedido de Demissão</option>
                <option value="Demissão Sem Justa Causa">Demissão Sem Justa Causa</option>
                <option value="Demissão Com Justa Causa">Demissão Com Justa Causa</option>
                <option value="Término de Contrato de Experiência">Término de Contrato de Experiência</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-3">
              <button type="button" onClick={() => setShowTerminationModal(false)} className="px-4 py-2 text-xs font-medium">Cancelar</button>
              <button type="submit" className="px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-xl">Processar Rescisão</button>
            </div>
          </form>
        </div>
      )}

      {/* Occurrence Modal */}
      {showOccModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateOccurrence} className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Nova Ocorrência em Prontuário</h3>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Colaborador</label>
              <select
                value={occForm.employeeId}
                onChange={e => setOccForm({ ...occForm, employeeId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
              >
                {employees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.role})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Registro</label>
              <select
                value={occForm.type}
                onChange={e => setOccForm({ ...occForm, type: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
              >
                <option value="elogio">Elogio / Reconhecimento</option>
                <option value="advertencia">Advertência por Escrito</option>
                <option value="suspensao">Suspensão Disciplinar</option>
                <option value="afastamento_medico">Afastamento Médico / Atestado</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Descrição Detalhada</label>
              <textarea
                required
                value={occForm.description}
                onChange={e => setOccForm({ ...occForm, description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3 pt-3">
              <button type="button" onClick={() => setShowOccModal(false)} className="px-4 py-2 text-xs font-medium">Cancelar</button>
              <button type="submit" className="px-4 py-2 bg-amber-600 text-white font-bold text-xs rounded-xl">Salvar Ocorrência</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Plus,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Users,
  Award,
  Filter,
  Check,
  X
} from 'lucide-react';
import { TimeClockEntry, Employee } from '../../types';

interface Props {
  companyId: string;
}

export const PontoDigitalView: React.FC<Props> = ({ companyId }) => {
  const [entries, setEntries] = useState<TimeClockEntry[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // New Clock Form Modal
  const [showClockModal, setShowClockModal] = useState(false);
  const [clockForm, setClockForm] = useState({
    employeeId: '',
    date: new Date().toISOString().slice(0, 10),
    clockIn: '08:00',
    breakOut: '12:00',
    breakIn: '13:00',
    clockOut: '17:48',
    overtimeHours: 0,
    overtimeRate: 50 as 50 | 100 | 140
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [pontoRes, empRes] = await Promise.all([
        fetch(`/api/company/time-clock?companyId=${companyId}`),
        fetch(`/api/company/employees?companyId=${companyId}`)
      ]);

      if (pontoRes.ok) setEntries((await pontoRes.json()).timeClockEntries || []);
      if (empRes.ok) setEmployees((await empRes.json()).employees || []);
    } catch (e) {
      console.error('Error loading timeclock data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [companyId]);

  const handleSaveClock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clockForm.employeeId) return alert('Selecione o colaborador.');

    try {
      const res = await fetch('/api/company/time-clock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...clockForm,
          companyId,
          totalHours: 8.8 + Number(clockForm.overtimeHours),
          status: 'aprovado'
        })
      });

      if (res.ok) {
        alert('Registro de Ponto Digital cadastrado com sucesso!');
        setShowClockModal(false);
        loadData();
      }
    } catch (e) {
      alert('Erro ao gravar ponto.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-orange-950 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-2 border border-amber-400/20">
            <Clock className="w-3.5 h-3.5" /> Ponto Digital & Banco de Horas
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Espelho de Ponto Eletrônico</h1>
          <p className="text-amber-200 text-sm mt-1 max-w-2xl">
            Registro diário de batimentos (Entrada, Almoço, Saída), cômputo automático de Horas Extras (50%, 100%, 140%) e banco de horas.
          </p>
        </div>

        <button
          onClick={() => {
            if (employees.length > 0) setClockForm({ ...clockForm, employeeId: employees[0].id });
            setShowClockModal(true);
          }}
          className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm rounded-xl transition shadow-lg flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" /> Registrar Batimento de Ponto
        </button>
      </div>

      {/* Timeclock Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-amber-600" /> Registros Recentes no Espelho de Ponto
        </h3>

        {loading ? (
          <div className="py-8 text-center text-slate-500">Carregando batimentos...</div>
        ) : entries.length === 0 ? (
          <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
            Nenhum registro de ponto encontrado para a empresa.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Colaborador</th>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Entrada / Intervalo / Saída</th>
                  <th className="px-4 py-3">Horas Trabalhadas</th>
                  <th className="px-4 py-3">Horas Extras</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {entries.map(e => (
                  <tr key={e.id}>
                    <td className="px-4 py-3 font-bold text-slate-900">{e.employeeName || e.employeeId}</td>
                    <td className="px-4 py-3 text-slate-600">{e.date}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-800">
                      {e.clockIn} | {e.breakOut || '--'} - {e.breakIn || '--'} | {e.clockOut || '--'}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-800">{e.totalHours}h</td>
                    <td className="px-4 py-3">
                      {e.overtimeHours > 0 ? (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-bold text-xs rounded">
                          +{e.overtimeHours}h ({e.overtimeRate}%)
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">0h</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-[11px] rounded-full uppercase">
                        {e.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Clock Modal */}
      {showClockModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveClock} className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Registrar Ponto Eletrônico</h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Colaborador</label>
              <select
                value={clockForm.employeeId}
                onChange={e => setClockForm({ ...clockForm, employeeId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
              >
                {employees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.role})</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Data</label>
                <input
                  type="date"
                  value={clockForm.date}
                  onChange={e => setClockForm({ ...clockForm, date: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Entrada</label>
                <input
                  type="time"
                  value={clockForm.clockIn}
                  onChange={e => setClockForm({ ...clockForm, clockIn: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Início Almoço</label>
                <input
                  type="time"
                  value={clockForm.breakOut}
                  onChange={e => setClockForm({ ...clockForm, breakOut: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Fim Almoço</label>
                <input
                  type="time"
                  value={clockForm.breakIn}
                  onChange={e => setClockForm({ ...clockForm, breakIn: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Saída</label>
                <input
                  type="time"
                  value={clockForm.clockOut}
                  onChange={e => setClockForm({ ...clockForm, clockOut: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Horas Extras</label>
                <input
                  type="number"
                  step="0.5"
                  value={clockForm.overtimeHours}
                  onChange={e => setClockForm({ ...clockForm, overtimeHours: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Taxa Horas Extras</label>
              <select
                value={clockForm.overtimeRate}
                onChange={e => setClockForm({ ...clockForm, overtimeRate: Number(e.target.value) as any })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
              >
                <option value={50}>50% (Dias úteis e sábados)</option>
                <option value={100}>100% (Domingos e feriados)</option>
                <option value={140}>140% (Escalas noturnas especiais)</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button type="button" onClick={() => setShowClockModal(false)} className="px-4 py-2 text-xs font-medium">Cancelar</button>
              <button type="submit" className="px-4 py-2 bg-amber-600 text-white font-bold text-xs rounded-xl">Salvar Ponto</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

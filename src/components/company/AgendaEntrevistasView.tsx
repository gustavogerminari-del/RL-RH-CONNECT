import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  User,
  Plus,
  Video,
  Phone,
  Building,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Edit2,
  Star,
  FileText
} from 'lucide-react';

interface Props {
  companyId: string;
}

interface InterviewEnriched {
  id: string;
  applicationId: string;
  candidateId: string;
  jobId: string;
  companyId: string;
  candidateName: string;
  candidateEmail?: string;
  candidatePhone?: string;
  jobTitle: string;
  date: string;
  time: string;
  responsible: string;
  type: 'Presencial' | 'Google Meet' | 'Microsoft Teams' | 'Telefone' | 'Outro';
  link?: string;
  notes?: string;
  outcomeNotes?: string;
  rating?: number;
  status: 'agendada' | 'realizada' | 'cancelada' | 'reagendada';
  createdAt: string;
}

export const AgendaEntrevistasView: React.FC<Props> = ({ companyId }) => {
  const [interviews, setInterviews] = useState<InterviewEnriched[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterView, setFilterView] = useState<'hoje' | 'semana' | 'mes' | 'proximas' | 'todas'>('hoje');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected interview for details / recording outcome / rescheduling
  const [selectedInterview, setSelectedInterview] = useState<InterviewEnriched | null>(null);

  // Edit / Outcome Form state
  const [outcomeForm, setOutcomeForm] = useState({
    status: 'realizada' as 'agendada' | 'realizada' | 'cancelada' | 'reagendada',
    date: '',
    time: '',
    responsible: '',
    type: 'Google Meet' as 'Presencial' | 'Google Meet' | 'Microsoft Teams' | 'Telefone' | 'Outro',
    link: '',
    notes: '',
    outcomeNotes: '',
    rating: 5
  });

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/company/interviews?companyId=${companyId}`);
      if (res.ok) {
        const data = await res.json();
        setInterviews(data.interviews || []);
      }
    } catch (e) {
      console.error('Error fetching interviews:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, [companyId]);

  const handleOpenEdit = (i: InterviewEnriched) => {
    setSelectedInterview(i);
    setOutcomeForm({
      status: i.status,
      date: i.date,
      time: i.time,
      responsible: i.responsible || 'Recrutador RH',
      type: i.type || 'Google Meet',
      link: i.link || '',
      notes: i.notes || '',
      outcomeNotes: i.outcomeNotes || '',
      rating: i.rating || 5
    });
  };

  const handleSaveInterviewUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInterview) return;

    try {
      const res = await fetch(`/api/company/interviews/${selectedInterview.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(outcomeForm)
      });

      if (res.ok) {
        alert('Entrevista atualizada com sucesso!');
        setSelectedInterview(null);
        fetchInterviews();
      } else {
        alert('Erro ao atualizar entrevista.');
      }
    } catch (e) {
      alert('Erro na comunicação com o servidor.');
    }
  };

  const todayStr = new Date().toISOString().slice(0, 10);

  // Filter Logic
  const filteredInterviews = interviews.filter(i => {
    // Status Filter
    if (statusFilter !== 'todos' && i.status !== statusFilter) return false;

    // Search
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchCandidate = i.candidateName.toLowerCase().includes(q);
      const matchJob = i.jobTitle.toLowerCase().includes(q);
      const matchResp = i.responsible.toLowerCase().includes(q);
      if (!matchCandidate && !matchJob && !matchResp) return false;
    }

    // View Period Filter
    if (filterView === 'hoje') {
      return i.date === todayStr;
    } else if (filterView === 'semana') {
      const d = new Date(i.date);
      const now = new Date();
      const diffTime = Math.abs(d.getTime() - now.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    } else if (filterView === 'mes') {
      return i.date.startsWith(todayStr.slice(0, 7));
    } else if (filterView === 'proximas') {
      return i.date >= todayStr && i.status === 'agendada';
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-2 border border-blue-400/20">
            <Calendar className="w-3.5 h-3.5" /> Agenda de Entrevistas & Avaliações
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Agenda Integrada RH</h1>
          <p className="text-blue-200 text-sm mt-1 max-w-2xl">
            Acompanhamento, reagendamento, cancelamento e registro de parecer/resultado das entrevistas com candidatos.
          </p>
        </div>
      </div>

      {/* Period Tabs & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
            {[
              { id: 'hoje', label: 'Hoje' },
              { id: 'semana', label: 'Esta Semana' },
              { id: 'mes', label: 'Este Mês' },
              { id: 'proximas', label: 'Próximas Agendadas' },
              { id: 'todas', label: 'Todas as Entrevistas' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterView(tab.id as any)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  filterView === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 font-semibold text-slate-700 text-xs rounded-xl px-3 py-2"
            >
              <option value="todos">Todos os Status</option>
              <option value="agendada">Agendadas</option>
              <option value="realizada">Realizadas</option>
              <option value="reagendada">Reagendadas</option>
              <option value="cancelada">Canceladas</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar candidato, vaga ou recrutador responsável..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Interviews Grid / List */}
      {loading ? (
        <div className="bg-white p-12 text-center text-slate-500 rounded-2xl border">
          Carregando agenda de entrevistas...
        </div>
      ) : filteredInterviews.length === 0 ? (
        <div className="bg-white p-12 text-center text-slate-500 rounded-2xl border space-y-2">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="font-bold text-slate-800 text-sm">Nenhuma entrevista encontrada para o período selecionado.</p>
          <p className="text-xs text-slate-500">Agende entrevistas através da Ficha do Candidato no módulo de Recrutamento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInterviews.map(i => {
            const isToday = i.date === todayStr;
            return (
              <div
                key={i.id}
                className={`bg-white rounded-2xl p-5 border shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4 ${
                  isToday ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200'
                }`}
              >
                <div className="space-y-3">
                  {/* Status Badge & Date */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        i.status === 'agendada'
                          ? 'bg-blue-100 text-blue-800'
                          : i.status === 'realizada'
                          ? 'bg-emerald-100 text-emerald-800'
                          : i.status === 'reagendada'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {i.status}
                    </span>

                    {isToday && (
                      <span className="bg-blue-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                        HOJE
                      </span>
                    )}
                  </div>

                  {/* Candidate & Job */}
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug">{i.candidateName}</h3>
                    <p className="text-xs font-medium text-blue-600 truncate">{i.jobTitle}</p>
                  </div>

                  {/* Date & Time & Type */}
                  <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-700">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span>{new Date(i.date).toLocaleDateString('pt-BR')} às {i.time}</span>
                    </div>
                    <div className="flex items-center gap-2 font-medium">
                      {i.type === 'Google Meet' || i.type === 'Microsoft Teams' ? (
                        <Video className="w-3.5 h-3.5 text-indigo-600" />
                      ) : i.type === 'Telefone' ? (
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Building className="w-3.5 h-3.5 text-slate-600" />
                      )}
                      <span>{i.type} • Resp: {i.responsible}</span>
                    </div>

                    {i.link && (
                      <a
                        href={i.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline font-semibold text-[11px] block truncate pt-1"
                      >
                        {i.link}
                      </a>
                    )}
                  </div>

                  {/* Outcome notes if recorded */}
                  {i.outcomeNotes && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
                      <span className="font-bold text-emerald-900 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Resultado / Parecer:
                      </span>
                      <p className="text-emerald-800 text-[11px] leading-relaxed">{i.outcomeNotes}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => handleOpenEdit(i)}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Atualizar / Parecer
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit / Outcome Modal */}
      {selectedInterview && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveInterviewUpdate}
            className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-4"
          >
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Gerenciar Entrevista: {selectedInterview.candidateName}
              </h3>
              <p className="text-xs text-slate-500">Vaga: {selectedInterview.jobTitle}</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Status da Entrevista</label>
                <select
                  value={outcomeForm.status}
                  onChange={e => setOutcomeForm({ ...outcomeForm, status: e.target.value as any })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-blue-700"
                >
                  <option value="agendada">Agendada</option>
                  <option value="realizada">Realizada (Concluída)</option>
                  <option value="reagendada">Reagendada</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Data</label>
                  <input
                    type="date"
                    value={outcomeForm.date}
                    onChange={e => setOutcomeForm({ ...outcomeForm, date: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Horário</label>
                  <input
                    type="time"
                    value={outcomeForm.time}
                    onChange={e => setOutcomeForm({ ...outcomeForm, time: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Responsável pela Entrevista</label>
                <input
                  type="text"
                  value={outcomeForm.responsible}
                  onChange={e => setOutcomeForm({ ...outcomeForm, responsible: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tipo de Reunião</label>
                <select
                  value={outcomeForm.type}
                  onChange={e => setOutcomeForm({ ...outcomeForm, type: e.target.value as any })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  <option value="Google Meet">Google Meet</option>
                  <option value="Microsoft Teams">Microsoft Teams</option>
                  <option value="Presencial">Presencial</option>
                  <option value="Telefone">Telefone</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Link da Reunião (Online)</label>
                <input
                  type="text"
                  value={outcomeForm.link}
                  onChange={e => setOutcomeForm({ ...outcomeForm, link: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-2 border-t border-slate-200">
                <label className="block font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" /> Registro de Parecer e Resultado
                </label>
                <textarea
                  rows={3}
                  value={outcomeForm.outcomeNotes}
                  onChange={e => setOutcomeForm({ ...outcomeForm, outcomeNotes: e.target.value })}
                  placeholder="Descreva o desempenho do candidato, pontos fortes, perfil comportamental e recomendação..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedInterview(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition"
              >
                Salvar Alterações
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

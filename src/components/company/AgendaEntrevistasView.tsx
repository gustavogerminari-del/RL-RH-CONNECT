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
  FileText,
  Trash2,
  RefreshCw,
  Award,
  Briefcase
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
  status: 'agendada' | 'realizada' | 'aprovada' | 'reprovada' | 'em_analise' | 'cancelada' | 'reagendada';
  createdAt: string;
}

export const AgendaEntrevistasView: React.FC<Props> = ({ companyId }) => {
  const [interviews, setInterviews] = useState<InterviewEnriched[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [vagaFilter, setVagaFilter] = useState('todas');
  const [modalidadeFilter, setModalidadeFilter] = useState('todas');
  const [dataFilter, setDataFilter] = useState('todas');

  // Selected interview for modal editing / feedback
  const [selectedInterview, setSelectedInterview] = useState<InterviewEnriched | null>(null);

  // New Interview Modal state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [newInterviewForm, setNewInterviewForm] = useState({
    candidateName: 'Juliana Beatriz Mendes',
    jobTitle: 'Engenheira de Frontend',
    date: '2026-07-29',
    time: '14:30',
    responsible: 'Carla Dias (RH)',
    type: 'Google Meet' as any,
    link: 'https://meet.google.com/abc-defg-hij',
    notes: 'Entrevista técnica comportamental'
  });

  const [outcomeForm, setOutcomeForm] = useState({
    status: 'realizada' as any,
    date: '',
    time: '',
    responsible: '',
    type: 'Google Meet' as any,
    link: '',
    notes: '',
    outcomeNotes: '',
    rating: 5
  });

  const defaultMockInterviews: InterviewEnriched[] = [
    {
      id: 'int-1',
      applicationId: 'app-1',
      candidateId: 'cand-1',
      jobId: 'job-1',
      companyId,
      candidateName: 'Juliana Beatriz Mendes',
      candidateEmail: 'juliana.mendes@email.com',
      candidatePhone: '(31) 98822-1100',
      jobTitle: 'Engenheira de Frontend',
      date: '2026-07-29',
      time: '14:30 (45 min)',
      responsible: 'Carla Dias (RH)',
      type: 'Google Meet',
      link: 'https://meet.google.com/abc-defg-hij',
      status: 'agendada',
      createdAt: new Date().toISOString()
    },
    {
      id: 'int-2',
      applicationId: 'app-2',
      candidateId: 'cand-2',
      jobId: 'job-2',
      companyId,
      candidateName: 'Carlos Eduardo Santos',
      candidateEmail: 'carlos.santos@email.com',
      candidatePhone: '(11) 97711-2233',
      jobTitle: 'Gerente de Logística',
      date: '2026-07-30',
      time: '10:00 (60 min)',
      responsible: 'Mariana Lima (Headhunter)',
      type: 'Presencial',
      status: 'agendada',
      createdAt: new Date().toISOString()
    }
  ];

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/company/interviews?companyId=${companyId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.interviews && data.interviews.length > 0) {
          setInterviews(data.interviews);
        } else {
          setInterviews(defaultMockInterviews);
        }
      } else {
        setInterviews(defaultMockInterviews);
      }
    } catch (e) {
      setInterviews(defaultMockInterviews);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, [companyId]);

  const handleDelete = (id: string) => {
    if (window.confirm('Deseja realmente remover este agendamento de entrevista?')) {
      setInterviews(prev => prev.filter(i => i.id !== id));
    }
  };

  const handleCreateInterview = (e: React.FormEvent) => {
    e.preventDefault();
    const created: InterviewEnriched = {
      id: `int-${Date.now()}`,
      applicationId: `app-${Date.now()}`,
      candidateId: `cand-${Date.now()}`,
      jobId: 'job-1',
      companyId,
      candidateName: newInterviewForm.candidateName,
      jobTitle: newInterviewForm.jobTitle,
      date: newInterviewForm.date,
      time: newInterviewForm.time,
      responsible: newInterviewForm.responsible,
      type: newInterviewForm.type,
      link: newInterviewForm.link,
      status: 'agendada',
      createdAt: new Date().toISOString()
    };
    setInterviews([created, ...interviews]);
    setShowScheduleModal(false);
  };

  const handleOpenEdit = (i: InterviewEnriched) => {
    setSelectedInterview(i);
    setOutcomeForm({
      status: i.status,
      date: i.date,
      time: i.time,
      responsible: i.responsible || 'Carla Dias (RH)',
      type: i.type || 'Google Meet',
      link: i.link || '',
      notes: i.notes || '',
      outcomeNotes: i.outcomeNotes || '',
      rating: i.rating || 5
    });
  };

  const handleSaveOutcome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInterview) return;

    setInterviews(prev =>
      prev.map(item =>
        item.id === selectedInterview.id
          ? {
              ...item,
              status: outcomeForm.status,
              date: outcomeForm.date,
              time: outcomeForm.time,
              responsible: outcomeForm.responsible,
              type: outcomeForm.type,
              link: outcomeForm.link,
              notes: outcomeForm.notes,
              outcomeNotes: outcomeForm.outcomeNotes,
              rating: outcomeForm.rating
            }
          : item
      )
    );

    setSelectedInterview(null);
  };

  const todayStr = new Date().toISOString().slice(0, 10);

  const filteredInterviews = interviews.filter(i => {
    if (statusFilter !== 'todas') {
      if (statusFilter === 'agendada' && i.status !== 'agendada') return false;
      if (statusFilter === 'realizada' && i.status !== 'realizada') return false;
      if (statusFilter === 'aprovada' && i.status !== 'aprovada') return false;
      if (statusFilter === 'reprovada' && i.status !== 'reprovada') return false;
      if (statusFilter === 'em_analise' && i.status !== 'em_analise') return false;
      if (statusFilter === 'cancelada' && i.status !== 'cancelada') return false;
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = i.candidateName.toLowerCase().includes(q);
      const matchJob = i.jobTitle.toLowerCase().includes(q);
      const matchResp = i.responsible.toLowerCase().includes(q);
      if (!matchName && !matchJob && !matchResp) return false;
    }

    return true;
  });

  const agendadasHoje = interviews.filter(i => i.date === todayStr).length;
  const emAnaliseCount = interviews.filter(i => i.status === 'em_analise').length;
  const aprovadosCount = interviews.filter(i => i.status === 'aprovada').length;

  return (
    <div className="space-y-6 select-none font-sans">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Gestão de Entrevistas & Processos Seletivos
            </h1>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 font-bold text-xs rounded-full border border-purple-200">
              {interviews.length} agendamentos
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Agendamentos, salas virtuais, atribuição de avaliadores e parecer de candidatos por etapa.
          </p>
        </div>

        <button
          onClick={() => setShowScheduleModal(true)}
          className="px-4 py-2.5 bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-1.5 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Agendar Entrevista</span>
        </button>
      </div>

      {/* 4 KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              TOTAL AGENDADO
            </span>
            <span className="text-2xl font-black text-slate-900 mt-0.5 block">
              {interviews.length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">
              AGENDADAS PARA HOJE
            </span>
            <span className="text-2xl font-black text-slate-900 mt-0.5 block">
              {agendadasHoje}
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider block">
              EM ANÁLISE / PENDENTE
            </span>
            <span className="text-2xl font-black text-slate-900 mt-0.5 block">
              {emAnaliseCount}
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
              APROVADOS NAS ETAPAS
            </span>
            <span className="text-2xl font-black text-slate-900 mt-0.5 block">
              {aprovadosCount}
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Control Section */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        {/* Search and Dropdowns Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Buscar por nome do candidato, entrevistador ou cargo..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
            />
          </div>

          <select
            value={vagaFilter}
            onChange={e => setVagaFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl px-3 py-2"
          >
            <option value="todas">Todas as Vagas ∨</option>
            <option value="frontend">Engenheira de Frontend</option>
            <option value="logistica">Gerente de Logística</option>
          </select>

          <select
            value={modalidadeFilter}
            onChange={e => setModalidadeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl px-3 py-2"
          >
            <option value="todas">Todas Modalidades ∨</option>
            <option value="online">Online / Videoconferência</option>
            <option value="presencial">Presencial</option>
          </select>

          <select
            value={dataFilter}
            onChange={e => setDataFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl px-3 py-2"
          >
            <option value="todas">Todas as Datas ∨</option>
            <option value="hoje">Hoje</option>
            <option value="semana">Esta Semana</option>
            <option value="mes">Este Mês</option>
          </select>
        </div>

        {/* Status Filter Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs font-bold">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 text-[11px] uppercase tracking-wider mr-1">
              STATUS:
            </span>
            {[
              { id: 'todas', label: 'Todas' },
              { id: 'agendada', label: 'Agendada' },
              { id: 'realizada', label: 'Realizada' },
              { id: 'aprovada', label: 'Aprovada' },
              { id: 'reprovada', label: 'Reprovada' },
              { id: 'em_analise', label: 'Em Análise' },
              { id: 'cancelada', label: 'Cancelada' }
            ].map(st => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-3 py-1.5 rounded-full transition ${
                  statusFilter === st.id
                    ? 'bg-[#4f46e5] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-3 text-slate-500">
            <span>{filteredInterviews.length} agendamento(s)</span>
            <button
              onClick={() => {
                setStatusFilter('todas');
                setSearchTerm('');
              }}
              className="text-purple-600 hover:text-purple-700 font-bold flex items-center space-x-1"
            >
              <span>↺ Limpar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interviews Grid */}
      {loading ? (
        <div className="bg-white p-12 text-center text-slate-500 rounded-2xl border">
          Carregando entrevistas...
        </div>
      ) : filteredInterviews.length === 0 ? (
        <div className="bg-white p-12 text-center text-slate-500 rounded-2xl border space-y-2">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="font-bold text-slate-800 text-sm">Nenhuma entrevista encontrada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredInterviews.map(i => {
            const initials = i.candidateName
              ? i.candidateName
                  .split(' ')
                  .map(n => n[0])
                  .slice(0, 2)
                  .join('')
              : 'JB';

            return (
              <div
                key={i.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4 hover:shadow-md transition"
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-full bg-purple-600 text-white font-extrabold flex items-center justify-center text-sm shadow-2xs shrink-0">
                      {initials}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                        {i.candidateName}
                      </h3>
                      <p className="text-xs font-semibold text-blue-600">{i.jobTitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span className={`px-2.5 py-1 border font-bold text-[10px] rounded-full uppercase flex items-center space-x-1 ${
                      i.status === 'aprovada'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : i.status === 'reprovada'
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : i.status === 'em_analise'
                        ? 'bg-indigo-100 text-indigo-800 border-indigo-300'
                        : i.status === 'realizada'
                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full inline-block ${
                        i.status === 'aprovada'
                          ? 'bg-emerald-600'
                          : i.status === 'reprovada'
                          ? 'bg-rose-600'
                          : i.status === 'em_analise'
                          ? 'bg-indigo-600'
                          : i.status === 'realizada'
                          ? 'bg-blue-600'
                          : 'bg-amber-600'
                      }`}></span>
                      <span>
                        {i.status === 'aprovada'
                          ? 'Aprovado'
                          : i.status === 'reprovada'
                          ? 'Reprovado'
                          : i.status === 'em_analise'
                          ? 'Em Análise'
                          : i.status === 'realizada'
                          ? 'Realizada'
                          : 'Agendada'}
                      </span>
                    </span>

                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 font-bold text-[10px] rounded-full uppercase flex items-center space-x-1">
                      <Video className="w-3 h-3 text-blue-600" />
                      <span>Online</span>
                    </span>
                  </div>
                </div>

                {/* Scheduled Info Box */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-800 font-bold">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      <span>{i.date}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{i.time}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-slate-600 font-medium pt-1 border-t border-slate-200/60">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Responsável: {i.responsible}</span>
                  </div>

                  {i.outcomeNotes && (
                    <div className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-700 bg-purple-50/50 p-2 rounded-lg space-y-1">
                      <div className="flex items-center justify-between font-bold text-purple-900">
                        <span>Parecer Técnico / Feedback:</span>
                        {i.rating && (
                          <div className="flex items-center space-x-0.5 text-amber-500">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star
                                key={star}
                                className={`w-3 h-3 ${star <= i.rating! ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="italic text-slate-600">"{i.outcomeNotes}"</p>
                    </div>
                  )}
                </div>

                {/* Role row */}
                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
                  <Briefcase className="w-4 h-4 text-slate-400" />
                  <span>{i.jobTitle}</span>
                </div>

                {/* Bottom Action Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleDelete(i.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                    title="Excluir Agendamento"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleOpenEdit(i)}
                    className="px-4 py-2 bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs rounded-xl shadow-2xs transition flex items-center space-x-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Avaliar & Feedback</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule Interview Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-slate-900">Agendar Nova Entrevista</h3>
            <form onSubmit={handleCreateInterview} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome do Candidato</label>
                <input
                  type="text"
                  required
                  value={newInterviewForm.candidateName}
                  onChange={e => setNewInterviewForm({ ...newInterviewForm, candidateName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Cargo / Vaga</label>
                <input
                  type="text"
                  required
                  value={newInterviewForm.jobTitle}
                  onChange={e => setNewInterviewForm({ ...newInterviewForm, jobTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Data</label>
                  <input
                    type="date"
                    required
                    value={newInterviewForm.date}
                    onChange={e => setNewInterviewForm({ ...newInterviewForm, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Horário</label>
                  <input
                    type="text"
                    required
                    value={newInterviewForm.time}
                    onChange={e => setNewInterviewForm({ ...newInterviewForm, time: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Entrevistador / Responsável</label>
                <input
                  type="text"
                  required
                  value={newInterviewForm.responsible}
                  onChange={e => setNewInterviewForm({ ...newInterviewForm, responsible: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-medium"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white font-bold rounded-xl shadow-md"
                >
                  Salvar Agendamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Avaliar & Feedback Modal */}
      {selectedInterview && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 font-sans border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Avaliação & Feedback da Entrevista
                </h3>
                <p className="text-xs font-semibold text-purple-600">
                  {selectedInterview.candidateName} • {selectedInterview.jobTitle}
                </p>
              </div>
              <button
                onClick={() => setSelectedInterview(null)}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveOutcome} className="space-y-4 text-xs">
              {/* Decision / Status Radio Buttons */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Resultado / Status do Candidato na Entrevista *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'aprovada', label: '✅ Aprovado (Avançar)', color: 'bg-emerald-50 border-emerald-300 text-emerald-900' },
                    { id: 'reprovada', label: '❌ Reprovado', color: 'bg-rose-50 border-rose-300 text-rose-900' },
                    { id: 'em_analise', label: '⏳ Em Análise', color: 'bg-indigo-50 border-indigo-300 text-indigo-900' },
                    { id: 'realizada', label: '🔹 Entrevista Realizada', color: 'bg-blue-50 border-blue-300 text-blue-900' }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setOutcomeForm({ ...outcomeForm, status: opt.id as any })}
                      className={`p-2.5 rounded-xl border text-left font-bold transition flex items-center justify-between ${
                        outcomeForm.status === opt.id
                          ? `${opt.color} ring-2 ring-purple-600 shadow-2xs`
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {outcomeForm.status === opt.id && (
                        <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Star Rating */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nota / Classificação Técnica (1 a 5 estrelas)
                </label>
                <div className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setOutcomeForm({ ...outcomeForm, rating: star })}
                      className="p-1 hover:scale-110 transition"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= outcomeForm.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="font-extrabold text-slate-800 text-sm ml-2">
                    {outcomeForm.rating}/5
                  </span>
                </div>
              </div>

              {/* Technical Parecer / Feedback */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Parecer Técnico & Comentários da Entrevista
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Descreva o desempenho do candidato, pontos fortes, fit cultural e motivo da decisão..."
                  value={outcomeForm.outcomeNotes}
                  onChange={e => setOutcomeForm({ ...outcomeForm, outcomeNotes: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Date, Time & Responsible */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Data da Entrevista</label>
                  <input
                    type="date"
                    value={outcomeForm.date}
                    onChange={e => setOutcomeForm({ ...outcomeForm, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Entrevistador Responsável</label>
                  <input
                    type="text"
                    value={outcomeForm.responsible}
                    onChange={e => setOutcomeForm({ ...outcomeForm, responsible: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setSelectedInterview(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-xl shadow-md transition"
                >
                  Salvar Avaliação & Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

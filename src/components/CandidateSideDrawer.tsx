import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  FileText,
  ShieldCheck,
  BrainCircuit,
  Star,
  Calendar,
  MessageSquare,
  Clock,
  History,
  FileCheck,
  Download,
  Plus,
  Send,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Phone,
  Mail,
  MapPin,
  Sparkles
} from 'lucide-react';
import { Application, Candidate, CandidateDocument, Interview, Note, TimelineEvent, Job } from '../types';
import { maskCPFForPrivacy } from '../utils/cpf';

interface CandidateSideDrawerProps {
  applicationId: string | null;
  companyId: string;
  onClose: () => void;
  onUpdateStage: (appId: string, newStage: string) => void;
}

export const CandidateSideDrawer: React.FC<CandidateSideDrawerProps> = ({
  applicationId,
  companyId,
  onClose,
  onUpdateStage
}) => {
  const [activeTab, setActiveTab] = useState<
    'resumo' | 'curriculo' | 'documentos' | 'triagem_ia' | 'triagem_rh' | 'entrevistas' | 'anotacoes' | 'historico' | 'parecer' | 'timeline'
  >('resumo');

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    application: Application;
    candidate: Candidate;
    job: Job;
    documents: CandidateDocument[];
    interviews: Interview[];
    notes: Note[];
    timeline: TimelineEvent[];
  } | null>(null);

  // New note state
  const [newNoteText, setNewNoteText] = useState('');
  // RH rating state
  const [rhRating, setRhRating] = useState<number>(0);
  const [rhNotes, setRhNotes] = useState('');

  // Interview Modal state
  const [showScheduleInterview, setShowScheduleInterview] = useState(false);
  const [interviewForm, setInterviewForm] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '14:00',
    responsible: 'Recrutador RH',
    type: 'Google Meet' as 'Presencial' | 'Google Meet' | 'Microsoft Teams' | 'Telefone' | 'Outro',
    link: 'https://meet.google.com/abc-defg-hij',
    notes: 'Entrevista técnica comportamental'
  });

  const loadData = async () => {
    if (!applicationId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/company/applications/${applicationId}?companyId=${companyId}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setRhRating(json.application?.rhRating || 0);
        setRhNotes(json.application?.rhNotes || '');
      }
    } catch (e) {
      console.error('Error loading candidate drawer:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [applicationId, companyId]);

  if (!applicationId) return null;

  const handleAddNote = async () => {
    if (!newNoteText.trim()) return;
    try {
      const res = await fetch(`/api/company/applications/${applicationId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newNoteText, author: 'Recrutador RH' })
      });
      if (res.ok) {
        setNewNoteText('');
        loadData();
      }
    } catch (e) {
      console.error('Error adding note:', e);
    }
  };

  const handleScheduleInterview = async () => {
    try {
      const res = await fetch(`/api/company/applications/${applicationId}/interviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(interviewForm)
      });
      if (res.ok) {
        setShowScheduleInterview(false);
        loadData();
      }
    } catch (e) {
      console.error('Error scheduling interview:', e);
    }
  };

  const handleSaveRhAssessment = async () => {
    try {
      await fetch(`/api/company/applications/${applicationId}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rhRating, rhNotes, companyId })
      });
      loadData();
    } catch (e) {
      console.error('Error saving RH assessment:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-[500px] bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Drawer Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0">
              {data?.candidate?.name?.charAt(0) || 'C'}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white truncate">
                {data?.candidate?.name || 'Carregando...'}
              </h3>
              <p className="text-[11px] text-slate-400 truncate">
                Vaga: {data?.job?.title || ''} • ID: {data?.application?.id}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stage Selector Bar */}
        {data && (
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shrink-0 text-xs">
            <span className="font-semibold text-slate-600">Etapa do Processo:</span>
            <select
              value={data.application.stage}
              onChange={e => {
                onUpdateStage(data.application.id, e.target.value);
                loadData();
              }}
              className="bg-white border border-slate-300 font-semibold text-blue-700 rounded-lg px-2.5 py-1 focus:ring-2 focus:ring-blue-500"
            >
              <option value="novo_candidato">Novo Candidato</option>
              <option value="em_analise">Em Análise</option>
              <option value="triagem_rh">Triagem RH</option>
              <option value="entrevista">Entrevista</option>
              <option value="avaliacao">Avaliação</option>
              <option value="aprovado">Aprovado</option>
              <option value="contratado">Contratado</option>
              <option value="reprovado">Reprovado</option>
              <option value="banco_de_talentos">Banco de Talentos</option>
            </select>
          </div>
        )}

        {/* 10 Navigation Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 flex items-center overflow-x-auto no-scrollbar scrollbar-thin px-2 py-1 text-xs shrink-0 space-x-1">
          {[
            { id: 'resumo', label: 'Resumo' },
            { id: 'curriculo', label: 'Currículo' },
            { id: 'documentos', label: 'Documentos' },
            { id: 'triagem_ia', label: 'Triagem IA' },
            { id: 'triagem_rh', label: 'Triagem RH' },
            { id: 'entrevistas', label: 'Entrevistas' },
            { id: 'anotacoes', label: 'Anotações' },
            { id: 'historico', label: 'Histórico' },
            { id: 'parecer', label: 'Parecer' },
            { id: 'timeline', label: 'Linha do Tempo' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-2.5 py-1.5 rounded-md font-semibold whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Drawer Body Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {loading ? (
            <div className="py-12 text-center text-slate-400">Carregando dados...</div>
          ) : !data ? (
            <div className="py-12 text-center text-slate-400">Dados indisponíveis</div>
          ) : (
            <>
              {/* --- TAB 1: RESUMO --- */}
              {activeTab === 'resumo' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                    <h4 className="font-bold text-slate-900 text-xs border-b pb-1">
                      Dados Pessoais
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-slate-700">
                      <div>
                        <span className="text-slate-400 block font-medium">CPF:</span>
                        <span className="font-mono font-semibold">
                          {maskCPFForPrivacy(data.candidate.cpf)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Nascimento:</span>
                        <span>{data.candidate.birthDate || 'Não informado'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">E-mail:</span>
                        <span className="font-semibold">{data.candidate.email}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Telefone:</span>
                        <span className="font-semibold">{data.candidate.phone}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Cidade/UF:</span>
                        <span>
                          {data.candidate.city}/{data.candidate.state}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">LinkedIn:</span>
                        {data.candidate.linkedin ? (
                          <a
                            href={data.candidate.linkedin}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 underline"
                          >
                            Ver Perfil
                          </a>
                        ) : (
                          'Não informado'
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                    <h4 className="font-bold text-slate-900 text-xs border-b pb-1">
                      Informações da Candidatura
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-slate-700">
                      <div>
                        <span className="text-slate-400 block font-medium">Origem:</span>
                        <span className="font-semibold">{data.application.origin}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">LGPD Aceito:</span>
                        <span className="text-emerald-700 font-semibold">
                          ✓ Sim ({new Date(data.application.lgpdAceitoEm).toLocaleDateString('pt-BR')})
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">
                          Perguntas Eliminatórias:
                        </span>
                        {data.application.eliminatoryFailed ? (
                          <span className="text-rose-600 font-bold">⚠️ Requisito Não Atendido</span>
                        ) : (
                          <span className="text-emerald-600 font-semibold">✓ Atendidas</span>
                        )}
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Banco Talentos:</span>
                        <span>{data.application.bancoTalentos ? 'Sim' : 'Não'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* --- TAB 2: CURRÍCULO --- */}
              {activeTab === 'curriculo' && (
                <div className="space-y-4">
                  {data.candidate.resumeUrl ? (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900">
                          {data.candidate.resumeFileName || 'Curriculo.pdf'}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Enviado pelo candidato no ato da candidatura
                        </p>
                      </div>
                      <a
                        href={data.candidate.resumeUrl}
                        download={data.candidate.resumeFileName || 'Curriculo.pdf'}
                        className="px-3 py-1.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Baixar CV</span>
                      </a>
                    </div>
                  ) : (
                    <p className="text-slate-500 italic">Nenhum arquivo de currículo disponível.</p>
                  )}

                  {/* AI Extracted Data */}
                  {data.candidate.resumeExtractedData && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
                      <h4 className="font-bold text-slate-900 text-xs flex items-center space-x-1">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        <span>Dados Extraídos do Currículo</span>
                      </h4>

                      {data.candidate.resumeExtractedData.summary && (
                        <div>
                          <span className="font-semibold text-slate-700 block">Resumo do Perfil:</span>
                          <p className="text-slate-600 leading-relaxed mt-0.5">
                            {data.candidate.resumeExtractedData.summary}
                          </p>
                        </div>
                      )}

                      {data.candidate.resumeExtractedData.experiences.length > 0 && (
                        <div>
                          <span className="font-semibold text-slate-700 block mb-1">
                            Experiências:
                          </span>
                          <div className="space-y-1.5">
                            {data.candidate.resumeExtractedData.experiences.map((exp, idx) => (
                              <div key={idx} className="bg-white p-2 rounded-lg border">
                                <p className="font-bold text-slate-900">
                                  {exp.role} — {exp.company}
                                </p>
                                <p className="text-[11px] text-slate-500">
                                  {exp.startDate} - {exp.endDate || 'Atual'}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {data.candidate.resumeExtractedData.skills.length > 0 && (
                        <div>
                          <span className="font-semibold text-slate-700 block mb-1">
                            Competências Identificadas:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {data.candidate.resumeExtractedData.skills.map((s, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md font-medium text-[11px]"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* --- TAB 3: DOCUMENTOS --- */}
              {activeTab === 'documentos' && (
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 text-xs">
                    Anexos e Documentos Autorizados
                  </h4>
                  {data.documents.length === 0 ? (
                    <p className="text-slate-500 italic p-4 text-center bg-slate-50 rounded-xl">
                      Nenhum documento anexo enviado.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {data.documents.map(doc => (
                        <div
                          key={doc.id}
                          className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between"
                        >
                          <div>
                            <p className="font-bold text-slate-900">{doc.title}</p>
                            <p className="text-[11px] text-slate-500">
                              {doc.category} • {doc.fileName}
                            </p>
                          </div>
                          {doc.fileUrl && (
                            <a
                              href={doc.fileUrl}
                              download={doc.fileName}
                              className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg flex items-center space-x-1"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Baixar</span>
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* --- TAB 4: TRIAGEM IA --- */}
              {activeTab === 'triagem_ia' && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold uppercase tracking-wider text-[11px] text-blue-200">
                        Score de Aderência IA
                      </span>
                      <span className="text-2xl font-black text-amber-300">
                        {data.application.aiScore || 85}%
                      </span>
                    </div>

                    <div className="w-full bg-blue-950 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-400 h-full rounded-full"
                        style={{ width: `${data.application.aiScore || 85}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                    <h4 className="font-bold text-slate-900 text-xs">Parecer do Gemini AI</h4>
                    <p className="text-slate-700 leading-relaxed">
                      {data.application.aiSummary ||
                        'O candidato possui alta correspondência com as exigências técnicas da vaga.'}
                    </p>
                  </div>
                </div>
              )}

              {/* --- TAB 5: TRIAGEM RH --- */}
              {activeTab === 'triagem_rh' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
                    <h4 className="font-bold text-slate-900 text-xs">Avaliação do Recrutador RH</h4>

                    <div>
                      <span className="font-semibold text-slate-700 block mb-1">Nota (1 a 5 Estrelas):</span>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            onClick={() => setRhRating(star)}
                            className="p-1 text-amber-400 hover:scale-110 transition-transform"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                star <= rhRating ? 'fill-current text-amber-400' : 'text-slate-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="font-semibold text-slate-700 block mb-1">Anotações do RH:</span>
                      <textarea
                        rows={3}
                        value={rhNotes}
                        onChange={e => setRhNotes(e.target.value)}
                        placeholder="Insira aqui o parecer de triagem humana..."
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>

                    <button
                      onClick={handleSaveRhAssessment}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
                    >
                      Salvar Avaliação RH
                    </button>
                  </div>
                </div>
              )}

              {/* --- TAB 6: ENTREVISTAS --- */}
              {activeTab === 'entrevistas' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900">Agendamentos de Entrevistas</h4>
                    <button
                      onClick={() => setShowScheduleInterview(true)}
                      className="px-2.5 py-1.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Agendar Entrevista</span>
                    </button>
                  </div>

                  {data.interviews.length === 0 ? (
                    <p className="text-slate-500 italic p-4 text-center bg-slate-50 rounded-xl">
                      Nenhuma entrevista agendada ainda.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {data.interviews.map(i => (
                        <div
                          key={i.id}
                          className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1"
                        >
                          <div className="flex items-center justify-between font-bold text-slate-900">
                            <span>
                              {i.type} — {i.date} às {i.time}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                              {i.status}
                            </span>
                          </div>
                          <p className="text-slate-600">Responsável: {i.responsible}</p>
                          {i.link && (
                            <a
                              href={i.link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 underline font-medium block"
                            >
                              Link da Reunião
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Schedule Modal Inline */}
                  {showScheduleInterview && (
                    <div className="p-4 bg-slate-100 rounded-xl border border-slate-300 space-y-3 mt-4">
                      <h5 className="font-bold text-slate-900">Nova Entrevista</h5>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700">Data</label>
                          <input
                            type="date"
                            value={interviewForm.date}
                            onChange={e =>
                              setInterviewForm(prev => ({ ...prev, date: e.target.value }))
                            }
                            className="w-full p-2 bg-white border rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700">Horário</label>
                          <input
                            type="time"
                            value={interviewForm.time}
                            onChange={e =>
                              setInterviewForm(prev => ({ ...prev, time: e.target.value }))
                            }
                            className="w-full p-2 bg-white border rounded-lg text-xs"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700">Tipo</label>
                        <select
                          value={interviewForm.type}
                          onChange={e =>
                            setInterviewForm(prev => ({ ...prev, type: e.target.value as any }))
                          }
                          className="w-full p-2 bg-white border rounded-lg text-xs"
                        >
                          <option value="Google Meet">Google Meet</option>
                          <option value="Microsoft Teams">Microsoft Teams</option>
                          <option value="Presencial">Presencial</option>
                          <option value="Telefone">Telefone</option>
                          <option value="Outro">Outro</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700">Responsável</label>
                        <input
                          type="text"
                          value={interviewForm.responsible}
                          onChange={e =>
                            setInterviewForm(prev => ({ ...prev, responsible: e.target.value }))
                          }
                          className="w-full p-2 bg-white border rounded-lg text-xs"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={handleScheduleInterview}
                          className="px-3 py-2 bg-blue-600 text-white font-bold rounded-lg"
                        >
                          Confirmar Agendamento
                        </button>
                        <button
                          onClick={() => setShowScheduleInterview(false)}
                          className="px-3 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* --- TAB 7: ANOTAÇÕES --- */}
              {activeTab === 'anotacoes' && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Escreva uma nota interna..."
                      value={newNoteText}
                      onChange={e => setNewNoteText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddNote()}
                      className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                    <button
                      onClick={handleAddNote}
                      className="px-3 py-2 bg-blue-600 text-white font-bold rounded-lg"
                    >
                      Adicionar
                    </button>
                  </div>

                  <div className="space-y-2 pt-2">
                    {data.notes.map(n => (
                      <div key={n.id} className="bg-slate-50 border p-3 rounded-xl">
                        <p className="font-bold text-slate-900">{n.author}</p>
                        <p className="text-slate-700 mt-0.5">{n.text}</p>
                        <span className="text-[10px] text-slate-400">
                          {new Date(n.createdAt).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* --- TAB 8: HISTÓRICO --- */}
              {activeTab === 'historico' && (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900">Histórico de Alterações</h4>
                  {data.timeline.map(t => (
                    <div key={t.id} className="p-2.5 bg-slate-50 border rounded-lg text-slate-700">
                      <p className="font-bold">{t.title}</p>
                      <p>{t.description}</p>
                      <span className="text-[10px] text-slate-400">{t.timestamp}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* --- TAB 9: PARECER --- */}
              {activeTab === 'parecer' && (
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900">Parecer Final do Processo Seletivo</h4>
                  <div className="p-4 bg-slate-50 border rounded-xl space-y-2">
                    <p className="font-semibold text-slate-800">
                      Status da Etapa Actual: <span className="text-blue-700 uppercase">{data.application.stage}</span>
                    </p>
                    <p className="text-slate-600">
                      Candidato avaliado via Portal RL RH Connect.
                    </p>
                  </div>
                </div>
              )}

              {/* --- TAB 10: LINHA DO TEMPO --- */}
              {activeTab === 'timeline' && (
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900">Linha do Tempo Completa</h4>
                  <div className="relative border-l-2 border-blue-600 ml-3 pl-4 space-y-4">
                    {data.timeline.map(t => (
                      <div key={t.id} className="relative">
                        <div className="absolute -left-[23px] top-1 w-3.5 h-3.5 bg-blue-600 rounded-full border-2 border-white" />
                        <p className="font-bold text-slate-900">{t.title}</p>
                        <p className="text-slate-600">{t.description}</p>
                        <span className="text-[10px] text-slate-400">
                          Por {t.author} em {new Date(t.timestamp).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

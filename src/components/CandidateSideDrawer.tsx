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
  Sparkles,
  Award,
  Briefcase,
  GraduationCap
} from 'lucide-react';
import { Application, Candidate, CandidateDocument, Interview, Note, TimelineEvent, Job } from '../types';
import { FinalizarCandidatoModal } from './FinalizarCandidatoModal';

interface CandidateSideDrawerProps {
  applicationId: string | null;
  companyId: string;
  onClose: () => void;
  onUpdateStage?: (appId: string, newStage: string) => void;
  onNavigateMenu?: (menuId: string) => void;
}

export const CandidateSideDrawer: React.FC<CandidateSideDrawerProps> = ({
  applicationId,
  companyId,
  onClose,
  onUpdateStage,
  onNavigateMenu
}) => {
  const [activeTab, setActiveTab] = useState<
    'perfil' | 'curriculo' | 'analise_ia' | 'entrevistas' | 'avaliacoes' | 'historico'
  >('perfil');

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

  const [stageOverride, setStageOverride] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Finalizar Modal State
  const [showFinalizarModal, setShowFinalizarModal] = useState(false);

  // Evaluation Modal State
  const [showEvalModal, setShowEvalModal] = useState(false);
  const [evalForm, setEvalForm] = useState({
    decision: 'aprovada' as 'aprovada' | 'reprovada' | 'em_analise',
    rating: 5,
    notes: 'Excelente desempenho técnico no teste e boa sinergia com a cultura do time.'
  });

  // Edit Interview Modal State
  const [showEditInterviewModal, setShowEditInterviewModal] = useState(false);
  const [interviewForm, setInterviewForm] = useState({
    date: '2026-08-08',
    time: '14:00',
    type: 'Google Meet',
    link: 'https://meet.google.com/abc-defg-hij',
    responsible: 'Recrutador RH'
  });

  // Local state for assessments list
  const [evaluationsList, setEvaluationsList] = useState<
    Array<{ id: string; date: string; decision: string; rating: number; notes: string; evaluator: string }>
  >([
    {
      id: 'eval-1',
      date: '08/08/2026',
      decision: 'Aprovado na Entrevista',
      rating: 5,
      notes: 'Demonstrou forte domínio técnico e excelente comunicação interpessoal.',
      evaluator: 'Recrutador RH'
    }
  ]);

  const loadData = async () => {
    if (!applicationId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/company/applications/${applicationId}?companyId=${companyId}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error('Error loading candidate drawer:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    setStageOverride(null);
    setFeedbackMessage(null);
  }, [applicationId, companyId]);

  if (!applicationId) return null;

  const candidate = data?.candidate || {
    id: 'c-1',
    name: 'João Antonio da Silva',
    email: 'joao.silva@email.com',
    phone: '(11) 99887-6655',
    city: 'São Paulo',
    state: 'SP',
    cpf: '38291048502',
    salaryExpectation: 'R$ 5.200',
    availability: 'Imediata',
    education: 'Superior Completo',
    experienceTime: '5 anos na área',
    pcd: 'Não',
    bio: 'Atuar no desenvolvimento e arquitetura de sistemas web corporativos de alto desempenho.',
    experiences: [
      {
        role: 'Motorista Carreteiro - Rodoviário',
        company: 'Logística Brasil Express',
        period: '2021 - 2026',
        description: 'Transporte rodoviário de cargas pesadas, rotas interestaduais, rastreamento e manutenção preventiva.'
      },
      {
        role: 'Motorista de Carga',
        company: 'TransSantos Ltda',
        period: '2018 - 2021',
        description: 'Distribuição urbana e regional de mercadorias com CNH Categoria E.'
      }
    ],
    academic: [
      {
        degree: 'Ensino Médio Completo / Curso MOPP',
        institution: 'SEST SENAT',
        period: '2017'
      }
    ]
  };

  const jobTitle = data?.job?.title || 'Motorista Carreteiro - Rodoviário';
  const stageName = stageOverride || data?.application?.stage || 'Entrevista Agendada';

  // Action handlers
  const handleEditInterviewClick = () => {
    setActiveTab('entrevistas');
    setShowEditInterviewModal(true);
  };

  const handleHire = () => {
    setShowFinalizarModal(true);
  };

  const handleReject = async () => {
    const newStage = 'banco_de_talentos';
    setStageOverride(newStage);
    if (applicationId) {
      try {
        await fetch(`/api/company/applications/${applicationId}/stage`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stage: newStage,
            companyId,
            authorName: 'Gestor de RH'
          })
        });
      } catch (e) {
        console.error('Erro ao reprovar candidato:', e);
      }
      if (onUpdateStage) {
        onUpdateStage(applicationId, newStage);
      }
    }
    setFeedbackMessage('Candidato reprovado e direcionado para o Banco de Talentos com sucesso.');
  };

  const handleSaveEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    let newStage = 'Aprovado na Entrevista';
    if (evalForm.decision === 'reprovada') newStage = 'Reprovado';
    if (evalForm.decision === 'em_analise') newStage = 'Em Análise';

    setStageOverride(newStage);
    if (onUpdateStage && applicationId) {
      onUpdateStage(applicationId, newStage);
    }

    setEvaluationsList([
      {
        id: `eval-${Date.now()}`,
        date: new Date().toLocaleDateString('pt-BR'),
        decision:
          evalForm.decision === 'aprovada'
            ? 'Aprovado'
            : evalForm.decision === 'reprovada'
            ? 'Reprovado'
            : 'Em Análise',
        rating: evalForm.rating,
        notes: evalForm.notes,
        evaluator: 'Gestor / Entrevistador'
      },
      ...evaluationsList
    ]);

    setShowEvalModal(false);
    setFeedbackMessage(`✅ Avaliação registrada com sucesso! Status do candidato atualizado para: ${newStage}`);
  };

  const handleSaveEditInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowEditInterviewModal(false);
    const newStage = 'entrevista_agendada';
    setStageOverride(newStage);

    if (applicationId) {
      try {
        await fetch(`/api/company/applications/${applicationId}/stage`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stage: newStage,
            companyId,
            authorName: 'Gestor de RH'
          })
        });
      } catch (e) {
        console.error('Erro ao salvar agendamento de entrevista:', e);
      }
      if (onUpdateStage) {
        onUpdateStage(applicationId, newStage);
      }
    }

    setActiveTab('entrevistas');
    setFeedbackMessage('📅 Agendamento de entrevista salvo com sucesso! Registrado na área de Entrevistas.');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-4xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 select-none font-sans">
        {/* Drawer Header */}
        <div className="bg-white p-6 border-b border-slate-200 shrink-0 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-full bg-purple-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md">
                {candidate.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    {candidate.name}
                  </h2>
                  <span className="px-3 py-0.5 bg-purple-100 text-purple-700 font-bold text-xs rounded-full">
                    {stageName}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">
                  {jobTitle} • 📍 {candidate.city}, {candidate.state}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* AI Match Badge */}
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-xl text-purple-900 text-xs font-bold">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>Compatibilidade IA: 92% Muito compatível</span>
          </div>

          {/* Feedback Banner */}
          {feedbackMessage && (
            <div className="bg-emerald-600 text-white p-3.5 rounded-xl shadow-md flex items-center justify-between text-xs font-bold animate-in fade-in gap-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
                <span>{feedbackMessage}</span>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                {onNavigateMenu && (
                  <button
                    onClick={() => {
                      if (feedbackMessage.includes('CONTRATADO')) onNavigateMenu('contratacoes');
                      else if (feedbackMessage.includes('Entrevistas')) onNavigateMenu('agenda-entrevistas');
                      else if (feedbackMessage.includes('Banco de Talentos')) onNavigateMenu('banco-de-talentos');
                      else onNavigateMenu('candidatos');
                    }}
                    className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-bold transition underline"
                  >
                    Ir para o Fluxo →
                  </button>
                )}
                <button
                  onClick={() => setFeedbackMessage(null)}
                  className="text-emerald-200 hover:text-white p-1"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Quick Action Buttons Row (6 Buttons) */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={() => window.open(`https://wa.me/55${candidate.phone.replace(/\D/g, '')}`, '_blank')}
              className="px-3.5 py-2 bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 font-bold text-xs rounded-xl transition flex items-center space-x-1.5"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={() => window.open(`mailto:${candidate.email}`, '_blank')}
              className="px-3.5 py-2 bg-blue-50 text-blue-700 border border-blue-300 hover:bg-blue-100 font-bold text-xs rounded-xl transition flex items-center space-x-1.5"
            >
              <Mail className="w-3.5 h-3.5 text-blue-600" />
              <span>E-mail</span>
            </button>

            <button
              onClick={handleEditInterviewClick}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-2xs transition flex items-center space-x-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Editar Entrevista</span>
            </button>

            <button
              onClick={() => setShowEvalModal(true)}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-2xs transition flex items-center space-x-1.5"
            >
              <Star className="w-3.5 h-3.5" />
              <span>Avaliar & Feedback</span>
            </button>

            <button
              onClick={handleHire}
              className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-2xs transition flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Contratar</span>
            </button>

            <button
              onClick={handleReject}
              className="px-3.5 py-2 bg-red-50 text-red-700 border border-red-300 hover:bg-red-100 font-bold text-xs rounded-xl transition flex items-center space-x-1.5"
            >
              <X className="w-3.5 h-3.5 text-red-600" />
              <span>Reprovar</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 flex items-center space-x-6 text-xs font-bold shrink-0 overflow-x-auto">
          {[
            { id: 'perfil', label: 'Perfil' },
            { id: 'curriculo', label: 'Currículo' },
            { id: 'analise_ia', label: 'Análise IA' },
            { id: 'entrevistas', label: 'Entrevistas' },
            { id: 'avaliacoes', label: 'Avaliações' },
            { id: 'historico', label: 'Histórico' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`py-3 transition border-b-2 whitespace-nowrap ${
                activeTab === t.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content Container */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {activeTab === 'perfil' && (
            <div className="space-y-6">
              {/* Card 1: Contact & Personal Info */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <span>DADOS DE CONTATO & INFORMAÇÕES PESSOAIS</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">E-MAIL</span>
                    <span className="font-bold text-slate-900">{candidate.email}</span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">TELEFONE / WHATSAPP</span>
                    <span className="font-bold text-slate-900">{candidate.phone}</span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">LOCALIZAÇÃO</span>
                    <span className="font-bold text-slate-900">{candidate.city}, {candidate.state}</span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">CPF</span>
                    <span className="font-bold text-slate-900">{candidate.cpf || '38291048502'}</span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">PRETENSIÃO SALARIAL</span>
                    <span className="font-bold text-slate-900">{candidate.salaryExpectation || 'R$ 5.200'}</span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">DISPONIBILIDADE</span>
                    <span className="font-bold text-slate-900">{candidate.availability || 'Imediata'}</span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">ESCOLARIDADE</span>
                    <span className="font-bold text-slate-900">{candidate.education || 'Superior Completo'}</span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">EXPERIÊNCIA</span>
                    <span className="font-bold text-slate-900">{candidate.experienceTime || '5 anos na área'}</span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">PCD (PESSOA C/ DEFICIÊNCIA)</span>
                    <span className="font-bold text-slate-900">{candidate.pcd || 'Não'}</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Professional Objective */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-2">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  <span>OBJETIVO PROFISSIONAL</span>
                </h3>
                <p className="text-xs font-medium text-slate-700 leading-relaxed">
                  {candidate.bio || 'Atuar no desenvolvimento e arquitetura de sistemas web corporativos de alto desempenho.'}
                </p>
              </div>

              {/* Card 3: Experiences */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                  <Award className="w-4 h-4 text-blue-600" />
                  <span>EXPERIÊNCIAS PROFISSIONAIS</span>
                </h3>

                <div className="space-y-3 divide-y divide-slate-100">
                  {candidate.experiences?.map((exp: any, i: number) => (
                    <div key={i} className={i > 0 ? 'pt-3 space-y-1' : 'space-y-1'}>
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900 text-xs">{exp.role}</span>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold text-[10px] rounded-md">
                          {exp.period}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-indigo-600">{exp.company}</p>
                      <p className="text-xs text-slate-600 font-medium">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 4: Education */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <span>FORMAÇÃO ACADÊMICA</span>
                </h3>

                <div className="space-y-3">
                  {candidate.academic?.map((edu: any, i: number) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900 text-xs">{edu.degree}</span>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold text-[10px] rounded-md">
                          {edu.period}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-600">{edu.institution}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: CURRICULO */}
          {activeTab === 'curriculo' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-8 h-8 text-purple-600" />
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm">Currículo Vitæ - {candidate.name}</h3>
                      <p className="text-xs text-slate-500">Documento anexado no cadastro de vaga</p>
                    </div>
                  </div>
                  <button
                    onClick={() => alert('Download do Currículo PDF iniciado.')}
                    className="px-3.5 py-2 bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>Baixar PDF</span>
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-4 space-y-3 text-xs">
                  <h4 className="font-black text-slate-800 uppercase text-[11px] tracking-wider">Principais Competências</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {['CNH Categoria E', 'Curso MOPP', 'Direção Defensiva', 'Manutenção Preventiva', 'Rastreamento de Frota', 'Logística Rodoviária'].map((skill, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-800 font-bold rounded-lg text-[11px]">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ANALISE IA */}
          {activeTab === 'analise_ia' && (
            <div className="space-y-6">
              <div className="bg-purple-900 text-white rounded-2xl p-6 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-purple-700/80 flex items-center justify-center">
                      <BrainCircuit className="w-6 h-6 text-purple-300" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base">Relatório de Análise Preditiva IA</h3>
                      <p className="text-xs text-purple-200">Cruzamento de requisitos da vaga x histórico do candidato</p>
                    </div>
                  </div>
                  <span className="text-3xl font-black text-amber-300">92%</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-2">
                  <div className="bg-purple-800/60 p-3 rounded-xl border border-purple-700">
                    <span className="block text-[10px] uppercase font-bold text-purple-300">Aderência Técnica</span>
                    <span className="font-extrabold text-white text-sm">Alta (95%)</span>
                  </div>
                  <div className="bg-purple-800/60 p-3 rounded-xl border border-purple-700">
                    <span className="block text-[10px] uppercase font-bold text-purple-300">Fit Cultural</span>
                    <span className="font-extrabold text-white text-sm">Excelente (90%)</span>
                  </div>
                  <div className="bg-purple-800/60 p-3 rounded-xl border border-purple-700">
                    <span className="block text-[10px] uppercase font-bold text-purple-300">Recomendação IA</span>
                    <span className="font-extrabold text-emerald-300 text-sm">Avançar p/ Contratação</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ENTREVISTAS */}
          {activeTab === 'entrevistas' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider">Histórico de Agendamentos</h3>
                <button
                  onClick={() => setShowEditInterviewModal(true)}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl flex items-center space-x-1"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Editar / Novo Agendamento</span>
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3 text-xs">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    <span className="font-bold text-slate-900">{interviewForm.date} às {interviewForm.time}</span>
                  </div>
                  <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 font-bold rounded-full text-[10px] uppercase">
                    Agendada
                  </span>
                </div>
                <div className="space-y-1 text-slate-600">
                  <p><strong>Tipo:</strong> {interviewForm.type}</p>
                  <p><strong>Entrevistador:</strong> {interviewForm.responsible}</p>
                  <p><strong>Link de Acesso:</strong> <a href={interviewForm.link} target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold">{interviewForm.link}</a></p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: AVALIAÇÕES */}
          {activeTab === 'avaliacoes' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider">Avaliações & Notas de Feedback</h3>
                <button
                  onClick={() => setShowEvalModal(true)}
                  className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-2xs flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nova Avaliação</span>
                </button>
              </div>

              {evaluationsList.map(ev => (
                <div key={ev.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-slate-900">{ev.evaluator}</span>
                      <span className="text-slate-400">• {ev.date}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-amber-400">
                      {[1, 2, 3, 4, 5].map(st => (
                        <Star key={st} className={`w-3.5 h-3.5 ${st <= ev.rating ? 'fill-amber-400' : 'text-slate-200'}`} />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-500">Decisão:</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold rounded-md text-[11px]">
                      {ev.decision}
                    </span>
                  </div>
                  <p className="text-slate-700 italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                    "{ev.notes}"
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* TAB: HISTORICO */}
          {activeTab === 'historico' && (
            <div className="space-y-4">
              <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider">Linha do Tempo do Candidato</h3>
              <div className="space-y-3 border-l-2 border-purple-200 pl-4 text-xs">
                <div className="relative space-y-1">
                  <span className="font-extrabold text-slate-900">Agendamento de Entrevista</span>
                  <p className="text-slate-500">Entrevista técnica agendada para 08/08/2026 às 14:00.</p>
                </div>
                <div className="relative space-y-1 pt-2">
                  <span className="font-extrabold text-slate-900">Triagem Concluída</span>
                  <p className="text-slate-500">Candidato aprovado na triagem automática por IA (92% Match).</p>
                </div>
                <div className="relative space-y-1 pt-2">
                  <span className="font-extrabold text-slate-900">Inscrição na Vaga</span>
                  <p className="text-slate-500">Inscrição recebida para a vaga de {jobTitle}.</p>
                </div>
              </div>
            </div>
          )}
        </div>

      {/* Modal: Avaliar & Feedback */}
      {showEvalModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 font-sans border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Avaliação & Feedback</h3>
                <p className="text-xs font-semibold text-purple-600">{candidate.name} • {jobTitle}</p>
              </div>
              <button onClick={() => setShowEvalModal(false)} className="p-1 text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleSaveEvaluation} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Resultado da Avaliação *</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'aprovada', label: '✅ Aprovado' },
                    { id: 'reprovada', label: '❌ Reprovado' },
                    { id: 'em_analise', label: '⏳ Em Análise' }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setEvalForm({ ...evalForm, decision: opt.id as any })}
                      className={`p-2.5 rounded-xl border text-center font-bold transition ${
                        evalForm.decision === opt.id
                          ? 'bg-purple-50 border-purple-500 text-purple-900 ring-2 ring-purple-600'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Classificação Técnica (1 a 5 estrelas)</label>
                <div className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-xl border">
                  {[1, 2, 3, 4, 5].map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setEvalForm({ ...evalForm, rating: st })}
                      className="p-1 hover:scale-110 transition"
                    >
                      <Star className={`w-6 h-6 ${st <= evalForm.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                    </button>
                  ))}
                  <span className="font-extrabold text-slate-800 text-sm ml-2">{evalForm.rating}/5</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Parecer Técnico & Observações *</label>
                <textarea
                  rows={3}
                  required
                  value={evalForm.notes}
                  onChange={e => setEvalForm({ ...evalForm, notes: e.target.value })}
                  placeholder="Escreva seus comentários sobre a entrevista e motivo do parecer..."
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowEvalModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-xl shadow-md"
                >
                  Salvar Avaliação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar Entrevista */}
      {showEditInterviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 font-sans border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-black text-slate-900">Editar Agendamento de Entrevista</h3>
              <button onClick={() => setShowEditInterviewModal(false)} className="p-1 text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleSaveEditInterview} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-extrabold text-slate-800 mb-1">Data *</label>
                  <input
                    type="date"
                    required
                    value={interviewForm.date}
                    onChange={e => setInterviewForm({ ...interviewForm, date: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-extrabold text-slate-800 mb-1">Horário *</label>
                  <input
                    type="text"
                    required
                    value={interviewForm.time}
                    onChange={e => setInterviewForm({ ...interviewForm, time: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-extrabold text-slate-800 mb-1">Tipo de Entrevista *</label>
                <select
                  value={interviewForm.type}
                  onChange={e => setInterviewForm({ ...interviewForm, type: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 text-xs"
                >
                  <option value="Google Meet">Google Meet (Online)</option>
                  <option value="Presencial">Presencial</option>
                  <option value="Telefone">Telefone</option>
                </select>
              </div>

              <div>
                <label className="block font-extrabold text-slate-800 mb-1">Link da Reunião</label>
                <input
                  type="text"
                  value={interviewForm.link}
                  onChange={e => setInterviewForm({ ...interviewForm, link: e.target.value })}
                  placeholder="https://meet.google.com/..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-800 mb-1">Responsável / Entrevistador *</label>
                <input
                  type="text"
                  required
                  value={interviewForm.responsible}
                  onChange={e => setInterviewForm({ ...interviewForm, responsible: e.target.value })}
                  placeholder="Nome do especialista RH"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500 text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowEditInterviewModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-xl shadow-md"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Finalizar Processo do Candidato Modal */}
      {showFinalizarModal && applicationId && data && (
        <FinalizarCandidatoModal
          isOpen={showFinalizarModal}
          onClose={() => setShowFinalizarModal(false)}
          applicationId={applicationId}
          candidateName={data.candidate.name}
          jobTitle={data.job.title}
          companyName="InovaTech Software"
          companyId={companyId}
          jobOrigin={data.job.origin || 'vaga_interna'}
          clientId={data.job.clientId}
          clientName={data.job.clientName}
          onSuccess={(type, message) => {
            setStageOverride('contratado');
            if (onUpdateStage) onUpdateStage(applicationId, 'contratado');
            setFeedbackMessage(message);
          }}
        />
      )}
      </div>
    </div>
  );
};

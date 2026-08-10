import React, { useState } from 'react';
import {
  X,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Trash2,
  Zap,
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  HelpCircle,
  Paperclip
} from 'lucide-react';
import { Job, DocumentRequirementConfig } from '../types';

interface EasyApplyModalProps {
  job: Job;
  onClose: () => void;
  onSuccess: () => void;
}

export const EasyApplyModal: React.FC<EasyApplyModalProps> = ({ job, onClose, onSuccess }) => {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Personal Contact Data
  const [personalData, setPersonalData] = useState({
    name: '',
    email: '',
    phone: '',
    city: job.city || '',
    state: job.state || '',
    linkedin: '',
    currentRole: '',
    birthDate: '',
    cpf: ''
  });

  // Resume File State
  const [resumeFile, setResumeFile] = useState<{
    fileName: string;
    fileContent: string;
    mimeType: string;
    fileSize: number;
    textContent?: string;
  } | null>(null);

  // Attached Extra Documents
  const [attachedDocs, setAttachedDocs] = useState<
    Record<
      string,
      {
        reqId: string;
        docType: string;
        title: string;
        category: string;
        fileContent: string;
        fileName: string;
        mimeType: string;
        fileSize: number;
      }
    >
  >({});

  // Custom Questions Answers
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, any>>({});

  // Consent Flags
  const [lgpdAccepted, setLgpdAccepted] = useState(true);
  const [bancoTalentos, setBancoTalentos] = useState(true);

  // Resume Upload Handler
  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('O arquivo excede o limite máximo permitido de 15MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setResumeFile({
        fileName: file.name,
        fileContent: result,
        mimeType: file.type || 'application/pdf',
        fileSize: file.size
      });
    };
    reader.readAsDataURL(file);
  };

  // Extra Document Upload Handler
  const handleDocUpload = (
    req: DocumentRequirementConfig,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setAttachedDocs(prev => ({
        ...prev,
        [req.id]: {
          reqId: req.id,
          docType: req.docType,
          title: req.title,
          category: req.category,
          fileContent: reader.result as string,
          fileName: file.name,
          mimeType: file.type || 'application/pdf',
          fileSize: file.size
        }
      }));
    };
    reader.readAsDataURL(file);
  };

  // Validation Check
  const isFormValid = () => {
    if (personalData.name.trim().length < 2) return false;
    if (!personalData.email.includes('@')) return false;
    if (personalData.phone.replace(/\D/g, '').length < 8) return false;
    if (!lgpdAccepted) return false;

    // Check mandatory resume requirement if job strictly mandates it
    const isResumeMandatory = job.documentRequirements?.some(
      r => r.docType.toLowerCase().includes('currículo') && r.level === 'obrigatorio'
    );
    if (isResumeMandatory && !resumeFile) return false;

    return true;
  };

  // Submit Handler
  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid() || submitting) return;

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const docsPayload = Object.values(attachedDocs);

      const res = await fetch('/api/public/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.id,
          personalData,
          resumeFile,
          documents: docsPayload,
          questionAnswers,
          lgpdAccepted,
          bancoTalentos
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao enviar candidatura.');
      }

      setSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao processar candidatura.');
    } finally {
      setSubmitting(false);
    }
  };

  const extraDocRequirements = (job.documentRequirements || []).filter(
    r => !r.docType.toLowerCase().includes('currículo')
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto relative flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/60 border border-blue-400/30 flex items-center justify-center text-amber-300 shadow-xs shrink-0">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
                Candidatura Simplificada
              </span>
              <h2 className="text-base font-bold text-white leading-tight line-clamp-1">
                {job.title} — {job.companyName}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-blue-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {submitted ? (
            /* Success View */
            <div className="text-center py-8 px-4 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <h3 className="text-xl font-bold text-slate-900">
                ✓ Candidatura Enviada com Sucesso!
              </h3>

              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                Sua candidatura para <strong>{job.title}</strong> na empresa <strong>{job.companyName}</strong> foi enviada. Os recrutadores analisarão seu perfil em breve.
              </p>

              <div className="pt-6 flex justify-center">
                <button
                  onClick={() => {
                    onSuccess();
                    onClose();
                  }}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-md"
                >
                  Concluir / Ver Outras Vagas
                </button>
              </div>
            </div>
          ) : (
            /* Form View */
            <form onSubmit={handleSubmitApplication} className="space-y-6">
              {/* Quick Callout Banner */}
              <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3 flex items-center space-x-3 text-xs text-blue-900 font-medium">
                <Zap className="w-5 h-5 text-amber-500 fill-amber-400 shrink-0" />
                <span>Preencha seus dados de contato e anexe seu currículo para se candidatar em instantes.</span>
              </div>

              {/* Error Banner */}
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-800 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* 1. SEÇÃO: DADOS PESSOAIS */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 pb-1.5 border-b border-slate-100">
                  <User className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
                    1. Seus Dados de Contato
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Maria Silva"
                      value={personalData.name}
                      onChange={e =>
                        setPersonalData(prev => ({ ...prev, name: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      E-mail Principal *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="seu.email@exemplo.com"
                      value={personalData.email}
                      onChange={e =>
                        setPersonalData(prev => ({ ...prev, email: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      WhatsApp / Celular *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="(00) 90000-0000"
                      value={personalData.phone}
                      onChange={e =>
                        setPersonalData(prev => ({ ...prev, phone: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Cidade *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Sua cidade"
                      value={personalData.city}
                      onChange={e =>
                        setPersonalData(prev => ({ ...prev, city: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Estado (UF) *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={2}
                      placeholder="SP"
                      value={personalData.state}
                      onChange={e =>
                        setPersonalData(prev => ({
                          ...prev,
                          state: e.target.value.toUpperCase()
                        }))
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Cargo Atual <span className="text-slate-400 font-normal">(Opcional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="ex: Analista / Motorista"
                      value={personalData.currentRole}
                      onChange={e =>
                        setPersonalData(prev => ({ ...prev, currentRole: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Perfil LinkedIn <span className="text-slate-400 font-normal">(Opcional)</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/perfil"
                      value={personalData.linkedin}
                      onChange={e =>
                        setPersonalData(prev => ({ ...prev, linkedin: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* 2. SEÇÃO: CURRÍCULO */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 pb-1.5 border-b border-slate-100">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
                    2. Seu Currículo
                  </h3>
                </div>

                {resumeFile ? (
                  <div className="bg-emerald-50/70 border border-emerald-300 rounded-xl p-3.5 flex items-center justify-between">
                    <div className="flex items-center space-x-3 min-w-0">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          ✓ {resumeFile.fileName}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {(resumeFile.fileSize / 1024).toFixed(1)} KB — Anexado
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setResumeFile(null)}
                      className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors text-xs font-semibold flex items-center space-x-1 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Remover</span>
                    </button>
                  </div>
                ) : (
                  <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-5 text-center hover:bg-slate-100/80 transition-colors relative">
                    <Upload className="w-8 h-8 text-blue-600 mx-auto mb-1.5" />
                    <p className="text-xs font-bold text-slate-800">
                      Clique ou arraste para anexar seu currículo
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      PDF, DOC ou DOCX (Tamanho máximo: 15MB)
                    </p>

                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleResumeUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* 3. SEÇÃO: PERGUNTAS DA VAGA (Se houver) */}
              {job.customQuestions && job.customQuestions.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 pb-1.5 border-b border-slate-100">
                    <HelpCircle className="w-4 h-4 text-blue-600" />
                    <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
                      3. Perguntas da Oportunidade
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {job.customQuestions.map(q => (
                      <div
                        key={q.id}
                        className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2"
                      >
                        <label className="block text-xs font-bold text-slate-900">
                          {q.question} {q.isEliminatory && <span className="text-rose-600">*</span>}
                        </label>

                        {q.type === 'yes_no' && (
                          <div className="flex items-center space-x-4">
                            <label className="inline-flex items-center space-x-2 text-xs font-medium text-slate-800 cursor-pointer">
                              <input
                                type="radio"
                                name={q.id}
                                value="Sim"
                                checked={questionAnswers[q.id] === 'Sim'}
                                onChange={() =>
                                  setQuestionAnswers(prev => ({ ...prev, [q.id]: 'Sim' }))
                                }
                                className="text-blue-600 focus:ring-blue-500"
                              />
                              <span>Sim</span>
                            </label>
                            <label className="inline-flex items-center space-x-2 text-xs font-medium text-slate-800 cursor-pointer">
                              <input
                                type="radio"
                                name={q.id}
                                value="Não"
                                checked={questionAnswers[q.id] === 'Não'}
                                onChange={() =>
                                  setQuestionAnswers(prev => ({ ...prev, [q.id]: 'Não' }))
                                }
                                className="text-blue-600 focus:ring-blue-500"
                              />
                              <span>Não</span>
                            </label>
                          </div>
                        )}

                        {q.type === 'text' && (
                          <input
                            type="text"
                            value={questionAnswers[q.id] || ''}
                            onChange={e =>
                              setQuestionAnswers(prev => ({ ...prev, [q.id]: e.target.value }))
                            }
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        )}

                        {q.type === 'long_text' && (
                          <textarea
                            rows={2}
                            value={questionAnswers[q.id] || ''}
                            onChange={e =>
                              setQuestionAnswers(prev => ({ ...prev, [q.id]: e.target.value }))
                            }
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        )}

                        {q.type === 'number' && (
                          <input
                            type="number"
                            value={questionAnswers[q.id] || ''}
                            onChange={e =>
                              setQuestionAnswers(prev => ({ ...prev, [q.id]: e.target.value }))
                            }
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        )}

                        {q.type === 'single_select' && q.options && (
                          <select
                            value={questionAnswers[q.id] || ''}
                            onChange={e =>
                              setQuestionAnswers(prev => ({ ...prev, [q.id]: e.target.value }))
                            }
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                          >
                            <option value="">Selecione uma opção</option>
                            {q.options.map(opt => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. SEÇÃO: DOCUMENTOS SOLICITADOS (Se houver) */}
              {extraDocRequirements.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 pb-1.5 border-b border-slate-100">
                    <Paperclip className="w-4 h-4 text-blue-600" />
                    <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
                      Anexos Adicionais Solicitados
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {extraDocRequirements.map(req => {
                      const attached = attachedDocs[req.id];
                      return (
                        <div
                          key={req.id}
                          className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-900 block">{req.title}</span>
                            <span className="text-[10px] text-slate-500 capitalize">
                              {req.level === 'obrigatorio' ? 'Obrigatório' : 'Opcional'} • {req.category}
                            </span>
                          </div>

                          {attached ? (
                            <div className="flex items-center space-x-2 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span className="truncate max-w-[130px]">{attached.fileName}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  setAttachedDocs(prev => {
                                    const copy = { ...prev };
                                    delete copy[req.id];
                                    return copy;
                                  })
                                }
                                className="text-rose-600 hover:text-rose-800"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <label className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors inline-flex items-center space-x-1 shrink-0">
                              <Upload className="w-3.5 h-3.5" />
                              <span>Anexar</span>
                              <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                onChange={e => handleDocUpload(req, e)}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 5. SEÇÃO: AUTORIZAÇÃO E ENVIO */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lgpdAccepted}
                    onChange={e => setLgpdAccepted(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-blue-600 rounded-md focus:ring-blue-500 shrink-0"
                  />
                  <span className="text-xs text-slate-700 leading-relaxed">
                    Li e concordo com o uso dos meus dados para este processo seletivo na empresa <strong>{job.companyName}</strong> conforme os termos de privacidade LGPD.
                  </span>
                </label>

                <label className="flex items-start space-x-3 cursor-pointer pt-2 border-t border-slate-200">
                  <input
                    type="checkbox"
                    checked={bancoTalentos}
                    onChange={e => setBancoTalentos(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-blue-600 rounded-md focus:ring-blue-500 shrink-0"
                  />
                  <span className="text-xs text-slate-700 leading-relaxed font-medium">
                    Autorizo manter meu perfil no Banco de Talentos para futuras oportunidades.
                  </span>
                </label>
              </div>

              {/* Botão de Envio */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!isFormValid() || submitting}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-extrabold rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2"
                >
                  {submitting ? (
                    <span>ENVIANDO CANDIDATURA...</span>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 fill-current text-amber-300" />
                      <span>CONCLUIR E ENVIAR CANDIDATURA AGORA</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

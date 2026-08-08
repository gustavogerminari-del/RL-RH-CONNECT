import React, { useState } from 'react';
import {
  X,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Trash2,
  Eye,
  Plus,
  Zap,
  ChevronRight,
  ChevronLeft,
  Lock,
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  DollarSign
} from 'lucide-react';
import { Job, DocumentRequirementConfig } from '../types';
import { formatCPF, isValidCPF, maskCPFForPrivacy } from '../utils/cpf';

interface EasyApplyModalProps {
  job: Job;
  onClose: () => void;
  onSuccess: () => void;
}

export const EasyApplyModal: React.FC<EasyApplyModalProps> = ({ job, onClose, onSuccess }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Step 1: Personal Data
  const [personalData, setPersonalData] = useState({
    name: '',
    cpf: '',
    birthDate: '',
    email: '',
    phone: '',
    city: job.city || '',
    state: job.state || '',
    linkedin: '',
    secondaryPhone: '',
    availability: 'Imediata',
    salaryExpectation: '',
    currentRole: ''
  });

  const [cpfError, setCpfError] = useState<string | null>(null);

  // Step 2: Resume
  const [resumeFile, setResumeFile] = useState<{
    fileName: string;
    fileContent: string;
    mimeType: string;
    fileSize: number;
    textContent?: string;
  } | null>(null);

  // Step 3: Job Documents & Extra Attachments
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

  const [customDocs, setCustomDocs] = useState<
    {
      id: string;
      title: string;
      description: string;
      category: string;
      fileContent: string;
      fileName: string;
      mimeType: string;
      fileSize: number;
    }[]
  >([]);

  const [newCustomDoc, setNewCustomDoc] = useState({
    title: '',
    description: '',
    category: 'profissionais'
  });
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);

  // Step 4: Custom Question Answers
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, any>>({});

  // Step 5: LGPD & Consent
  const [lgpdAccepted, setLgpdAccepted] = useState(false);
  const [bancoTalentos, setBancoTalentos] = useState(true);

  // --- HANDLERS ---

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setPersonalData(prev => ({ ...prev, cpf: formatted }));
    if (formatted.replace(/\D/g, '').length === 11) {
      if (!isValidCPF(formatted)) {
        setCpfError('CPF inválido. Por favor, verifique os números digitados.');
      } else {
        setCpfError(null);
      }
    } else {
      setCpfError(null);
    }
  };

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('Arquivo muito grande. O limite máximo é de 15MB.');
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

  const handleAddCustomDocFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !newCustomDoc.title) {
      alert('Preencha o nome do documento primeiro.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCustomDocs(prev => [
        ...prev,
        {
          id: `custom-doc-${Date.now()}`,
          title: newCustomDoc.title,
          description: newCustomDoc.description,
          category: newCustomDoc.category,
          fileContent: reader.result as string,
          fileName: file.name,
          mimeType: file.type,
          fileSize: file.size
        }
      ]);
      setNewCustomDoc({ title: '', description: '', category: 'profissionais' });
      setShowAddCustomModal(false);
    };
    reader.readAsDataURL(file);
  };

  // STEP VALIDATIONS
  const canProceedStep1 = () => {
    return (
      personalData.name.trim().length >= 3 &&
      personalData.birthDate &&
      personalData.email.includes('@') &&
      personalData.phone.replace(/\D/g, '').length >= 8 &&
      personalData.city.trim() &&
      personalData.state.trim()
    );
  };

  const isResumeMandatory = job.documentRequirements.some(
    r => r.docType.toLowerCase().includes('currículo') && r.level === 'obrigatorio'
  );

  const canProceedStep2 = () => {
    if (isResumeMandatory && !resumeFile) return false;
    return true;
  };

  const canProceedStep3 = () => {
    // Check all obligatory job document requirements
    const mandatoryReqs = job.documentRequirements.filter(
      r => r.level === 'obrigatorio' && !r.docType.toLowerCase().includes('currículo')
    );
    for (const req of mandatoryReqs) {
      if (!attachedDocs[req.id]) return false;
    }
    return true;
  };

  const handleSubmitApplication = async () => {
    if (submitting) return;
    setSubmitting(true);
    setErrorMessage(null);

    try {
      // Build document payload list
      const docsPayload = [
        ...Object.values(attachedDocs),
        ...customDocs.map(c => ({
          reqId: c.id,
          docType: c.title,
          title: c.title,
          description: c.description,
          category: c.category,
          fileContent: c.fileContent,
          fileName: c.fileName,
          mimeType: c.mimeType,
          fileSize: c.fileSize
        }))
      ];

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

      setStep(6); // Success screen
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao enviar candidatura.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto relative flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/60 border border-blue-400/30 flex items-center justify-center text-amber-300 shadow-xs">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider block">
                Candidatura Fácil (Sem Cadastro)
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

        {/* Wizard Progress Bar (Steps 1 to 5) */}
        {step <= 5 && (
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 shrink-0">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
              <span
                className={step === 1 ? 'text-blue-700 font-bold' : 'hidden sm:inline'}
              >
                1. Dados
              </span>
              <span
                className={step === 2 ? 'text-blue-700 font-bold' : 'hidden sm:inline'}
              >
                2. Currículo
              </span>
              <span
                className={step === 3 ? 'text-blue-700 font-bold' : 'hidden sm:inline'}
              >
                3. Anexos
              </span>
              <span
                className={step === 4 ? 'text-blue-700 font-bold' : 'hidden sm:inline'}
              >
                4. Perguntas
              </span>
              <span
                className={step === 5 ? 'text-blue-700 font-bold' : 'hidden sm:inline'}
              >
                5. Envio
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300"
                style={{ width: `${(step / 5) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="m-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-800 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Modal Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* --- STEP 1: DADOS PESSOAIS --- */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Etapa 1: Informações Pessoais de Contato
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Seu nome completo"
                    value={personalData.name}
                    onChange={e =>
                      setPersonalData(prev => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Data de Nascimento *
                  </label>
                  <input
                    type="date"
                    required
                    value={personalData.birthDate}
                    onChange={e =>
                      setPersonalData(prev => ({ ...prev, birthDate: e.target.value }))
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
                    Perfil no LinkedIn
                  </label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/seu-perfil"
                    value={personalData.linkedin}
                    onChange={e =>
                      setPersonalData(prev => ({ ...prev, linkedin: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cargo Atual
                  </label>
                  <input
                    type="text"
                    placeholder="ex: Motorista / Analista"
                    value={personalData.currentRole}
                    onChange={e =>
                      setPersonalData(prev => ({ ...prev, currentRole: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* --- STEP 2: CURRÍCULO --- */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Etapa 2: Envio do Currículo
                </h3>
              </div>

              <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:bg-slate-100/60 transition-colors relative">
                <Upload className="w-10 h-10 text-blue-600 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-800">
                  Arraste ou clique para selecionar seu currículo
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Formatos aceitos: PDF, DOC, DOCX (Tamanho máximo: 15MB)
                </p>

                <input
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleResumeUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>

              {resumeFile && (
                <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3 min-w-0">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        ✓ {resumeFile.fileName}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {(resumeFile.fileSize / 1024).toFixed(1)} KB — Enviado hoje
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setResumeFile(null)}
                    className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors text-xs font-semibold flex items-center space-x-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Remover</span>
                  </button>
                </div>
              )}

              {isResumeMandatory && !resumeFile && (
                <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 p-2.5 rounded-xl">
                  ⚠️ O envio do currículo é obrigatório para esta oportunidade.
                </p>
              )}
            </div>
          )}

          {/* --- STEP 3: DOCUMENTOS (CENTRAL DE ANEXOS) --- */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Etapa 3: Documentos e Certificados Solicitados
                  </h3>
                </div>

                <button
                  onClick={() => setShowAddCustomModal(true)}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Outro Documento</span>
                </button>
              </div>

              <p className="text-xs text-slate-600">
                A empresa selecionou os seguintes anexos necessários para avaliar sua candidatura:
              </p>

              {/* Job Document Requirements list */}
              {job.documentRequirements.filter(
                r => !r.docType.toLowerCase().includes('currículo')
              ).length === 0 ? (
                <p className="text-xs text-slate-500 italic p-4 bg-slate-50 rounded-xl text-center">
                  Esta vaga não exige anexos adicionais no momento da candidatura.
                </p>
              ) : (
                <div className="space-y-3">
                  {job.documentRequirements
                    .filter(r => !r.docType.toLowerCase().includes('currículo'))
                    .map(req => {
                      const attached = attachedDocs[req.id];
                      return (
                        <div
                          key={req.id}
                          className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-slate-900">
                                {req.title}
                              </span>
                              <span
                                className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                                  req.level === 'obrigatorio'
                                    ? 'bg-rose-100 text-rose-700'
                                    : 'bg-slate-200 text-slate-700'
                                }`}
                              >
                                {req.level === 'obrigatorio' ? 'Obrigatório' : 'Opcional'}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 capitalize">
                              Categoria: {req.category} ({req.docType})
                            </span>
                          </div>

                          {attached ? (
                            <div className="flex items-center space-x-2 text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                              <CheckCircle2 className="w-4 h-4" />
                              <span className="truncate max-w-[150px]">{attached.fileName}</span>
                              <button
                                onClick={() =>
                                  setAttachedDocs(prev => {
                                    const copy = { ...prev };
                                    delete copy[req.id];
                                    return copy;
                                  })
                                }
                                className="text-rose-600 hover:text-rose-800 ml-1"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <label className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors inline-flex items-center space-x-1.5 shrink-0 self-start sm:self-auto">
                              <Upload className="w-3.5 h-3.5" />
                              <span>Anexar Arquivo</span>
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
              )}

              {/* Custom Extra Documents Attached */}
              {customDocs.length > 0 && (
                <div className="pt-2">
                  <h4 className="text-xs font-bold text-slate-800 mb-2">
                    Outros Anexos Adicionados:
                  </h4>
                  <div className="space-y-2">
                    {customDocs.map(c => (
                      <div
                        key={c.id}
                        className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-3 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-900">{c.title}</p>
                          <p className="text-[11px] text-slate-500">{c.fileName}</p>
                        </div>
                        <button
                          onClick={() =>
                            setCustomDocs(prev => prev.filter(item => item.id !== c.id))
                          }
                          className="text-rose-600 hover:text-rose-800 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Custom Document Form Modal */}
              {showAddCustomModal && (
                <div className="p-4 bg-slate-100 rounded-xl border border-slate-300 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900">
                    Adicionar Outro Documento / Certificado
                  </h4>
                  <div>
                    <input
                      type="text"
                      placeholder="Nome do documento (ex: Certificado de Inglês)"
                      value={newCustomDoc.title}
                      onChange={e =>
                        setNewCustomDoc(prev => ({ ...prev, title: e.target.value }))
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg cursor-pointer text-center">
                      Selecionar Arquivo
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={handleAddCustomDocFile}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowAddCustomModal(false)}
                      className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* --- STEP 4: PERGUNTAS PERSONALIZADAS --- */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Etapa 4: Perguntas Específicas da Vaga
                </h3>
              </div>

              {!job.customQuestions || job.customQuestions.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-4 bg-slate-50 rounded-xl text-center">
                  Esta vaga não possui perguntas adicionais requeridas. Pode avançar!
                </p>
              ) : (
                <div className="space-y-4">
                  {job.customQuestions.map(q => (
                    <div
                      key={q.id}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2"
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
                          rows={3}
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
              )}
            </div>
          )}

          {/* --- STEP 5: REVISÃO E LGPD --- */}
          {step === 5 && (
            <div className="space-y-5">
              <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Etapa 5: Revisão Final & Autorização LGPD
                </h3>
              </div>

              {/* Summary Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-200">
                  <div>
                    <span className="text-slate-400 block font-medium">Candidato:</span>
                    <span className="font-bold text-slate-900">{personalData.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">CPF Parcial:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {maskCPFForPrivacy(personalData.cpf)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Contato:</span>
                    <span className="font-semibold text-slate-900">{personalData.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Local:</span>
                    <span className="font-semibold text-slate-900">
                      {personalData.city}/{personalData.state}
                    </span>
                  </div>
                </div>

                <div className="pt-1">
                  <span className="text-slate-500 font-medium">Currículo: </span>
                  <span className="font-semibold text-slate-900">
                    {resumeFile ? `✓ ${resumeFile.fileName}` : 'Nenhum anexado'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 font-medium">
                    Documentos Solicitados Anexados:{' '}
                  </span>
                  <span className="font-semibold text-slate-900">
                    {Object.keys(attachedDocs).length + customDocs.length} arquivos
                  </span>
                </div>
              </div>

              {/* Checkbox LGPD */}
              <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 space-y-3">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lgpdAccepted}
                    onChange={e => setLgpdAccepted(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-blue-600 rounded-md focus:ring-blue-500 shrink-0"
                  />
                  <span className="text-xs text-slate-700 leading-relaxed">
                    Autorizo o tratamento dos meus dados pessoais para participação neste processo seletivo, conforme a Política de Privacidade do RL RH Connect e da empresa responsável pela oportunidade ({job.companyName}).
                  </span>
                </label>

                <label className="flex items-start space-x-3 cursor-pointer pt-2 border-t border-blue-200/60">
                  <input
                    type="checkbox"
                    checked={bancoTalentos}
                    onChange={e => setBancoTalentos(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-blue-600 rounded-md focus:ring-blue-500 shrink-0"
                  />
                  <span className="text-xs text-slate-700 leading-relaxed font-medium">
                    Também quero disponibilizar meu perfil no Banco de Talentos para futuras oportunidades.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* --- STEP 6: SUCESSO --- */}
          {step === 6 && (
            <div className="text-center py-8 px-4 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <h3 className="text-xl font-bold text-slate-900">
                ✓ Candidatura enviada com sucesso!
              </h3>

              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                Sua candidatura foi recebida pela empresa <strong>{job.companyName}</strong>. A equipe de recrutamento poderá entrar em contato utilizando os dados informados.
              </p>

              <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => {
                    onSuccess();
                    onClose();
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors"
                >
                  Ver outras vagas
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        {step <= 5 && (
          <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between shrink-0">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((step - 1) as any)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl flex items-center space-x-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <button
                type="button"
                disabled={
                  (step === 1 && !canProceedStep1()) ||
                  (step === 2 && !canProceedStep2()) ||
                  (step === 3 && !canProceedStep3())
                }
                onClick={() => setStep((step + 1) as any)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1"
              >
                <span>Avançar</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={!lgpdAccepted || submitting}
                onClick={handleSubmitApplication}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-2"
              >
                {submitting ? (
                  <span>Enviando candidatura...</span>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-current text-amber-300" />
                    <span>ENVIAR CANDIDATURA</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

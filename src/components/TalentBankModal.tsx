import React, { useState } from 'react';
import {
  X,
  Upload,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  UserCheck,
  Zap,
  Trash2
} from 'lucide-react';
import { formatCPF, isValidCPF } from '../utils/cpf';

interface TalentBankModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const TalentBankModal: React.FC<TalentBankModalProps> = ({ onClose, onSuccess }) => {
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [personalData, setPersonalData] = useState({
    name: '',
    cpf: '',
    birthDate: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    linkedin: ''
  });

  const [cpfError, setCpfError] = useState<string | null>(null);

  const [resumeFile, setResumeFile] = useState<{
    fileName: string;
    fileContent: string;
    mimeType: string;
    fileSize: number;
  } | null>(null);

  const [lgpdAccepted, setLgpdAccepted] = useState(false);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setPersonalData(prev => ({ ...prev, cpf: formatted }));
    if (formatted.replace(/\D/g, '').length === 11) {
      if (!isValidCPF(formatted)) {
        setCpfError('CPF inválido.');
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

    const reader = new FileReader();
    reader.onload = () => {
      setResumeFile({
        fileName: file.name,
        fileContent: reader.result as string,
        mimeType: file.type || 'application/pdf',
        fileSize: file.size
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidCPF(personalData.cpf)) {
      setCpfError('Informe um CPF válido.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/public/talent-bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personalData,
          resumeFile,
          lgpdAccepted
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao registrar perfil.');

      setSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao registrar perfil.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto relative flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/60 flex items-center justify-center text-white">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Banco de Talentos RL RH Connect</h2>
              <p className="text-xs text-blue-200">
                Disponibilize seu perfil para centenas de empresas parceiras
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-blue-200 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-800 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {success ? (
            <div className="text-center py-8 space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-lg font-bold text-slate-900">
                ✓ Cadastro Realizado no Banco de Talentos!
              </h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Seu perfil foi registrado e estará visível para empresas recrutadoras da nossa rede.
              </p>
              <button
                onClick={() => {
                  onSuccess();
                  onClose();
                }}
                className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-xs"
              >
                Concluir
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Seu nome"
                    value={personalData.name}
                    onChange={e => setPersonalData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">CPF *</label>
                  <input
                    type="text"
                    required
                    maxLength={14}
                    placeholder="000.000.000-00"
                    value={personalData.cpf}
                    onChange={handleCpfChange}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl font-mono"
                  />
                  {cpfError && <p className="text-[11px] text-rose-600 mt-1">{cpfError}</p>}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Data de Nascimento *</label>
                  <input
                    type="date"
                    required
                    value={personalData.birthDate}
                    onChange={e =>
                      setPersonalData(prev => ({ ...prev, birthDate: e.target.value }))
                    }
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">E-mail *</label>
                  <input
                    type="email"
                    required
                    value={personalData.email}
                    onChange={e => setPersonalData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={personalData.phone}
                    onChange={e => setPersonalData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cidade *</label>
                  <input
                    type="text"
                    required
                    value={personalData.city}
                    onChange={e => setPersonalData(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estado (UF) *</label>
                  <input
                    type="text"
                    required
                    maxLength={2}
                    value={personalData.state}
                    onChange={e =>
                      setPersonalData(prev => ({
                        ...prev,
                        state: e.target.value.toUpperCase()
                      }))
                    }
                    className="w-full p-2.5 bg-slate-50 border rounded-xl uppercase"
                  />
                </div>
              </div>

              {/* Upload Currículo */}
              <div className="pt-2">
                <label className="block font-semibold text-slate-700 mb-1">Anexar Currículo (PDF/DOC)</label>
                {resumeFile ? (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                    <span className="font-bold text-slate-900 truncate">
                      ✓ {resumeFile.fileName}
                    </span>
                    <button
                      type="button"
                      onClick={() => setResumeFile(null)}
                      className="text-rose-600 font-semibold"
                    >
                      Remover
                    </button>
                  </div>
                ) : (
                  <label className="p-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center cursor-pointer hover:bg-slate-100 transition-colors">
                    <Upload className="w-6 h-6 text-blue-600 mb-1" />
                    <span className="font-bold text-slate-700">Clique para enviar currículo</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* LGPD Checkbox */}
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                <label className="flex items-start space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={lgpdAccepted}
                    onChange={e => setLgpdAccepted(e.target.checked)}
                    className="mt-0.5 rounded text-blue-600"
                  />
                  <span className="text-slate-700 leading-tight">
                    Autorizo a inclusão do meu perfil no Banco de Talentos do RL RH Connect em conformidade com a LGPD.
                  </span>
                </label>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!lgpdAccepted || submitting}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md"
                >
                  {submitting ? 'Cadastrando...' : 'Cadastrar no Banco'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

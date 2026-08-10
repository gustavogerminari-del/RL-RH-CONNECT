import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, DollarSign, Bookmark, Building2, User, Briefcase, FileText, AlertCircle } from 'lucide-react';
import { EncaminharHeadhunterModal } from './company/EncaminharHeadhunterModal';
import { hasModule } from '../utils/modules';

interface FinalizarCandidatoModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  candidateName: string;
  jobTitle: string;
  companyName: string;
  companyId: string;
  jobOrigin?: 'vaga_interna' | 'recrutamento_cliente' | 'headhunter' | string;
  clientId?: string;
  clientName?: string;
  onSuccess?: (actionType: 'dp' | 'financeiro' | 'banco', message: string) => void;
}

export const FinalizarCandidatoModal: React.FC<FinalizarCandidatoModalProps> = ({
  isOpen,
  onClose,
  applicationId,
  candidateName,
  jobTitle,
  companyName,
  companyId,
  jobOrigin = 'vaga_interna',
  clientId,
  clientName,
  onSuccess
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showHeadhunterModal, setShowHeadhunterModal] = useState(false);
  const [company, setCompany] = useState<any>(null);

  useEffect(() => {
    if (companyId) {
      fetch(`/api/company/details?companyId=${companyId}`)
        .then(r => r.json())
        .then(data => {
          if (data.company) setCompany(data.company);
        })
        .catch(err => console.error('Erro ao carregar empresa:', err));
    }
  }, [companyId]);

  if (!isOpen) return null;

  const hasHeadhunterModule = company ? hasModule(company, 'headhunter') : true;
  const hasDPModule = company ? hasModule(company, 'dp') : true;

  const showDPOption = hasDPModule;
  const showHeadhunterOption = hasHeadhunterModule;

  const originLabel =
    jobOrigin === 'headhunter'
      ? 'Headhunter'
      : jobOrigin === 'recrutamento_cliente'
      ? 'Recrutamento para Cliente'
      : 'Vaga Interna';

  const isHeadhunterOrClientJob = jobOrigin === 'headhunter' || jobOrigin === 'recrutamento_cliente';

  const handleHireDP = async () => {
    setSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/company/applications/${applicationId}/hire-dp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId })
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Erro ao enviar candidato para o DP.');
      }
      const msg = json.message || 'Candidato enviado para Departamento Pessoal com sucesso.';
      if (onSuccess) onSuccess('dp', msg);
      onClose();
    } catch (e: any) {
      setErrorMessage(e.message || 'Ocorreu um erro ao processar a contratação interna.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleHireHeadhunterClick = () => {
    setErrorMessage(null);
    setShowHeadhunterModal(true);
  };

  const handleMoveToTalentBank = async () => {
    setSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/company/applications/${applicationId}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage: 'banco_de_talentos',
          companyId,
          authorName: 'Gestor de RH'
        })
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Erro ao mover candidato para o Banco de Talentos.');
      }
      const msg = 'Candidato direcionado para o Banco de Talentos com sucesso.';
      if (onSuccess) onSuccess('banco', msg);
      onClose();
    } catch (e: any) {
      setErrorMessage(e.message || 'Ocorreu um erro ao redirecionar candidato.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col font-sans">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center font-bold text-white shadow-md">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight">Finalizar processo do candidato</h3>
              <p className="text-xs text-slate-300 font-medium">Selecione o destino e fluxo correspondente</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-2 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Candidate & Job Info Summary Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">CANDIDATO:</span>
              <span className="font-extrabold text-slate-900 text-sm">{candidateName}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <span className="block font-bold text-slate-400 text-[10px] uppercase">VAGA DE DESTINO:</span>
                <span className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <Briefcase className="w-3.5 h-3.5 text-purple-600" /> {jobTitle}
                </span>
              </div>

              <div>
                <span className="block font-bold text-slate-400 text-[10px] uppercase">ORIGEM DA VAGA:</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-extrabold bg-purple-100 text-purple-800 text-[11px] mt-0.5">
                  {originLabel}
                </span>
              </div>

              <div>
                <span className="block font-bold text-slate-400 text-[10px] uppercase">EMPRESA CONTRATANTE:</span>
                <span className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" /> {companyName}
                </span>
              </div>

              <div>
                <span className="block font-bold text-slate-400 text-[10px] uppercase">CLIENTE HEADHUNTER:</span>
                <span className="font-bold text-slate-800 mt-0.5 block">
                  {clientName || 'N/A (Interna)'}
                </span>
              </div>
            </div>
          </div>

          {/* Error / Validation Warning */}
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-bold flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Choice Buttons */}
          <div className="space-y-3 pt-1">
            <span className="block text-xs font-black text-slate-500 uppercase tracking-wider">
              Escolha uma opção de finalização:
            </span>

            {/* Options based on permissions and job origin */}
            {(!showDPOption || (showHeadhunterOption && isHeadhunterOrClientJob)) ? (
              <button
                onClick={handleHireHeadhunterClick}
                disabled={submitting}
                className="w-full p-4 rounded-xl border text-left transition flex items-start gap-3 group bg-emerald-50/80 border-emerald-300 hover:bg-emerald-100/80 shadow-2xs"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold shadow-xs">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wide group-hover:text-emerald-700">
                      CONTRATAÇÃO HEADHUNTER / ENVIAR PARA FINANCEIRO
                    </span>
                    <span className="text-[10px] font-extrabold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                      Recomendado
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                    Marca o candidato como contratado para o cliente e gera o lançamento financeiro dos honorários do Headhunter.
                  </p>
                </div>
              </button>
            ) : null}

            {(!showHeadhunterOption || (showDPOption && !isHeadhunterOrClientJob)) ? (
              <button
                onClick={handleHireDP}
                disabled={submitting}
                className="w-full p-4 rounded-xl border text-left transition flex items-start gap-3 group bg-blue-50/80 border-blue-300 hover:bg-blue-100/80 shadow-2xs"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 font-bold shadow-xs">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wide group-hover:text-blue-700">
                      CONTRATAÇÃO INTERNA / ENVIAR PARA DP
                    </span>
                    <span className="text-[10px] font-extrabold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                      Recomendado
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                    Aprova o candidato e envia automaticamente ao Departamento Pessoal da empresa para admissão.
                  </p>
                </div>
              </button>
            ) : null}

            {/* Option 3: Banco de Talentos */}
            <button
              onClick={handleMoveToTalentBank}
              disabled={submitting}
              className="w-full p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-left transition flex items-center gap-3 group"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 font-bold shadow-xs">
                <Bookmark className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <span className="font-extrabold text-slate-800 text-xs uppercase tracking-wide group-hover:text-amber-700">
                  MANTER NO BANCO DE TALENTOS
                </span>
                <p className="text-[11px] text-slate-500 font-medium">
                  Não contrata agora, movendo o candidato com status finalizado para o Banco de Talentos.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition"
          >
            CANCELAR
          </button>
        </div>
      </div>

      {/* Encaminhar ao Headhunter & Financeiro Modal */}
      {showHeadhunterModal && (
        <EncaminharHeadhunterModal
          isOpen={showHeadhunterModal}
          onClose={() => setShowHeadhunterModal(false)}
          companyId={companyId}
          applicationId={applicationId}
          candidateName={candidateName}
          jobTitle={jobTitle}
          initialClientId={clientId}
          initialClientName={clientName}
          onSuccess={(message) => {
            setShowHeadhunterModal(false);
            if (onSuccess) onSuccess('financeiro', message);
            onClose();
          }}
        />
      )}
    </div>
  );
};

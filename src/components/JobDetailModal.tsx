import React, { useState } from 'react';
import {
  X,
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  Users,
  Building2,
  Calendar,
  Share2,
  CheckCircle,
  Zap,
  Copy,
  Check
} from 'lucide-react';
import { Job } from '../types';

interface JobDetailModalProps {
  job: Job;
  onClose: () => void;
  onEasyApply: (job: Job) => void;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  job,
  onClose,
  onEasyApply
}) => {
  const [copied, setCopied] = useState(false);

  const formattedDate = new Date(job.publishedAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const salaryDisplay = job.salaryDisclosed
    ? job.salaryMin && job.salaryMax
      ? `R$ ${job.salaryMin.toLocaleString('pt-BR')} - R$ ${job.salaryMax.toLocaleString('pt-BR')}`
      : job.salaryMin
      ? `R$ ${job.salaryMin.toLocaleString('pt-BR')}`
      : 'A combinar'
    : 'A combinar / Não divulgado';

  const currentUrl = window.location.href;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(
      `Confira esta vaga de ${job.title} na ${job.companyName} pelo RL RH Connect: ${currentUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const shareLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
      '_blank'
    );
  };

  const shareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
      '_blank'
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto relative flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start space-x-4">
            {job.companyLogo ? (
              <img
                src={job.companyLogo}
                alt={job.companyName}
                className="w-14 h-14 rounded-xl object-cover border border-slate-700 shrink-0 shadow-md"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-700">
                <Building2 className="w-7 h-7" />
              </div>
            )}

            <div>
              <span className="text-xs font-semibold text-blue-400 tracking-wider uppercase block">
                {job.companyName}
              </span>
              <h2 className="text-xl font-extrabold text-white mt-0.5 leading-snug">
                {job.title}
              </h2>

              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-300">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  <span>
                    {job.city}, {job.state}
                  </span>
                </span>
                <span className="flex items-center space-x-1">
                  <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                  <span>
                    {job.workMode} • {job.contractType}
                  </span>
                </span>
                <span className="flex items-center space-x-1">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  <span>{job.openingsCount} vagas</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800">
          {/* Info Quick Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Faixa Salarial</span>
              <span className="font-bold text-emerald-700">{salaryDisplay}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Nível Exigido</span>
              <span className="font-semibold text-slate-900">{job.experienceLevel || 'Não informado'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Publicada em</span>
              <span className="font-medium text-slate-700">{formattedDate}</span>
            </div>
          </div>

          {/* Sobre a Vaga */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2 border-b border-slate-100 pb-1">
              Sobre a vaga
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </div>

          {/* Responsabilidades */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2 border-b border-slate-100 pb-1">
                Responsabilidades
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {job.responsibilities.map((r, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Requisitos */}
          {job.requirements && job.requirements.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2 border-b border-slate-100 pb-1">
                Requisitos Obrigatorios
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {job.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Diferenciais */}
          {job.differentials && job.differentials.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2 border-b border-slate-100 pb-1">
                Diferenciais
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {job.differentials.map((diff, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-indigo-600 font-bold">★</span>
                    <span>{diff}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Benefícios */}
          {job.benefits && job.benefits.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2 border-b border-slate-100 pb-1">
                Benefícios
              </h3>
              <div className="flex flex-wrap gap-2">
                {job.benefits.map((b, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-lg text-xs font-medium"
                  >
                    ✓ {b}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Jornada & Local */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl text-xs">
            {job.schedule && (
              <div>
                <span className="font-bold text-slate-900 block mb-0.5">Jornada de Trabalho:</span>
                <span className="text-slate-600">{job.schedule}</span>
              </div>
            )}
            {job.locationDetails && (
              <div>
                <span className="font-bold text-slate-900 block mb-0.5">Local de Atuação:</span>
                <span className="text-slate-600">{job.locationDetails}</span>
              </div>
            )}
          </div>

          {/* Compartilhar vaga */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-700 block mb-2">Compartilhar esta vaga:</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={shareWhatsApp}
                className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors"
              >
                WhatsApp
              </button>
              <button
                onClick={shareLinkedIn}
                className="px-3 py-1.5 bg-blue-700 text-white rounded-lg text-xs font-semibold hover:bg-blue-800 transition-colors"
              >
                LinkedIn
              </button>
              <button
                onClick={shareFacebook}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
              >
                Facebook
              </button>
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado!' : 'Copiar Link'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl"
          >
            Fechar
          </button>

          <button
            onClick={() => {
              onClose();
              onEasyApply(job);
            }}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-2"
          >
            <Zap className="w-4 h-4 fill-current text-amber-300" />
            <span>CANDIDATURA FÁCIL</span>
          </button>
        </div>
      </div>
    </div>
  );
};

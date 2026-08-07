import React from 'react';
import {
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  Users,
  Building2,
  Calendar,
  Sparkles,
  Zap,
  ArrowRight
} from 'lucide-react';
import { Job } from '../types';

interface JobCardProps {
  job: Job;
  onViewJob: (job: Job) => void;
  onEasyApply: (job: Job) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onViewJob, onEasyApply }) => {
  const formattedDate = new Date(job.publishedAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short'
  });

  const salaryDisplay = job.salaryDisclosed
    ? job.salaryMin && job.salaryMax
      ? `R$ ${job.salaryMin.toLocaleString('pt-BR')} - R$ ${job.salaryMax.toLocaleString('pt-BR')}`
      : job.salaryMin
      ? `R$ ${job.salaryMin.toLocaleString('pt-BR')}`
      : 'A combinar'
    : 'A combinar / Não divulgado';

  const workModeColor =
    job.workMode === 'Remoto'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
      : job.workMode === 'Híbrido'
      ? 'bg-indigo-50 text-indigo-700 border-indigo-200/60'
      : 'bg-amber-50 text-amber-700 border-amber-200/60';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 hover:border-blue-300 hover:shadow-lg transition-all duration-200 flex flex-col justify-between group relative">
      <div>
        {/* Top Header: Logo + Title + Badges */}
        <div className="flex items-start space-x-3.5 mb-3">
          {job.companyLogo ? (
            <img
              src={job.companyLogo}
              alt={job.companyName}
              className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0 shadow-2xs"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 border border-slate-200">
              <Building2 className="w-6 h-6" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <span className="text-xs font-semibold text-blue-600 tracking-wide uppercase block truncate mb-0.5">
              {job.companyName}
            </span>
            <h3
              onClick={() => onViewJob(job)}
              className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors cursor-pointer leading-snug line-clamp-2"
            >
              {job.title}
            </h3>
          </div>
        </div>

        {/* Location & Modality Badges */}
        <div className="flex flex-wrap items-center gap-2 my-3">
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/60">
            <MapPin className="w-3 h-3 text-slate-500" />
            <span>
              {job.city}, {job.state}
            </span>
          </span>

          <span
            className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold border ${workModeColor}`}
          >
            <span>{job.workMode}</span>
          </span>

          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/60">
            <Briefcase className="w-3 h-3 text-slate-500" />
            <span>{job.contractType}</span>
          </span>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 my-3">
          <div className="flex items-center space-x-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate font-medium">{salaryDisplay}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Users className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>
              {job.openingsCount} {job.openingsCount === 1 ? 'vaga' : 'vagas'}
            </span>
          </div>
        </div>

        {/* Brief preview description */}
        <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
          {job.description}
        </p>
      </div>

      {/* Footer & Actions */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
        <span className="text-[11px] text-slate-400 flex items-center space-x-1">
          <Calendar className="w-3 h-3" />
          <span>Publicada em {formattedDate}</span>
        </span>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onViewJob(job)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Ver vaga
          </button>

          <button
            onClick={() => onEasyApply(job)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-xs flex items-center space-x-1"
          >
            <Zap className="w-3.5 h-3.5 fill-current text-amber-300" />
            <span>Candidatura Fácil</span>
          </button>
        </div>
      </div>
    </div>
  );
};

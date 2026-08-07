import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Building2,
  Search,
  Sparkles,
  Zap,
  UserCheck,
  TrendingUp,
  MapPin,
  ChevronRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { Job, PortalSettings } from '../types';
import { JobCard } from '../components/JobCard';
import { JobFilters, FilterState } from '../components/JobFilters';
import { JobDetailModal } from '../components/JobDetailModal';
import { EasyApplyModal } from '../components/EasyApplyModal';
import { TalentBankModal } from '../components/TalentBankModal';

interface PublicPortalProps {
  settings?: PortalSettings;
  metrics?: { availableJobsCount: number; hiringCompaniesCount: number };
  activeTab: 'home' | 'vagas' | 'banco-de-talentos';
  setActiveTab: (tab: any) => void;
  selectedJobId?: string | null;
}

export const PublicPortal: React.FC<PublicPortalProps> = ({
  settings,
  metrics,
  activeTab,
  setActiveTab,
  selectedJobId
}) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    location: '',
    workMode: 'todos',
    contractType: 'todos',
    area: 'todas',
    salaryMin: '',
    experienceLevel: '',
    educationLevel: ''
  });

  // Modals state
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [easyApplyJob, setEasyApplyJob] = useState<Job | null>(null);
  const [showTalentBankModal, setShowTalentBankModal] = useState(false);
  const [jobNotFound, setJobNotFound] = useState(false);

  // Fetch Jobs from backend
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (filters.search) query.append('search', filters.search);
      if (filters.location) query.append('location', filters.location);
      if (filters.workMode !== 'todos') query.append('workMode', filters.workMode);
      if (filters.contractType !== 'todos') query.append('contractType', filters.contractType);
      if (filters.area !== 'todas') query.append('area', filters.area);
      if (filters.salaryMin) query.append('salaryMin', filters.salaryMin);

      const res = await fetch(`/api/public/jobs?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
      }
    } catch (e) {
      console.error('Error fetching jobs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Handle direct link job opening e.g., /vagas/:id
  useEffect(() => {
    if (selectedJobId) {
      const found = jobs.find(j => j.id === selectedJobId);
      if (found) {
        setSelectedJob(found);
      } else {
        // Fetch specific job
        fetch(`/api/public/jobs/${selectedJobId}`)
          .then(res => res.json())
          .then(data => {
            if (data.job) setSelectedJob(data.job);
            else setJobNotFound(true);
          })
          .catch(() => setJobNotFound(true));
      }
    }
  }, [selectedJobId, jobs]);

  const handleClearFilters = () => {
    setFilters({
      search: '',
      location: '',
      workMode: 'todos',
      contractType: 'todos',
      area: 'todas',
      salaryMin: '',
      experienceLevel: '',
      educationLevel: ''
    });
    fetchJobs();
  };

  const realJobsCount = metrics?.availableJobsCount || jobs.length || 0;
  const realCompaniesCount = metrics?.hiringCompaniesCount || 3;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* HERO SECTION */}
      <section className="bg-gradient-to-b from-blue-950 via-slate-900 to-slate-900 text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background ambient glow */}
        <div className="absolute -top-24 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl text-center mx-auto space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Portal Oficial de Oportunidades & Recrutamento</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              {settings?.bannerTitle || 'Conectando talentos às melhores oportunidades'}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
              {settings?.bannerSubtitle ||
                'Encontre a oportunidade ideal para sua carreira com candidatura rápida, sem necessidade de senha.'}
            </p>

            {/* REAL SYSTEM METRICS */}
            <div className="pt-2 flex items-center justify-center space-x-6 text-xs sm:text-sm font-semibold">
              <div className="flex items-center space-x-2 bg-white/5 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                <Briefcase className="w-4 h-4 text-amber-400" />
                <span>
                  <strong className="text-white text-base mr-1">{realJobsCount}</strong>
                  vagas disponíveis
                </span>
              </div>

              <div className="flex items-center space-x-2 bg-white/5 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                <Building2 className="w-4 h-4 text-blue-400" />
                <span>
                  <strong className="text-white text-base mr-1">{realCompaniesCount}</strong>
                  empresas contratando
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* JOB SEARCH & FILTERS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 w-full flex-1 pb-16">
        <JobFilters
          filters={filters}
          setFilters={setFilters}
          onSearch={fetchJobs}
          onClearFilters={handleClearFilters}
          totalResults={jobs.length}
        />

        {/* Expired Job Link Notice */}
        {jobNotFound && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>Esta oportunidade não está mais disponível ou foi encerrada.</span>
            </div>
            <button
              onClick={() => {
                setJobNotFound(false);
                setActiveTab('vagas');
              }}
              className="px-3 py-1.5 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700"
            >
              Ver outras vagas
            </button>
          </div>
        )}

        {/* Action Header Banner for Talent Bank */}
        <div className="mb-6 bg-gradient-to-r from-blue-900 to-indigo-800 text-white rounded-2xl p-4 sm:p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-bold flex items-center space-x-2">
              <UserCheck className="w-5 h-5 text-amber-300" />
              <span>Não encontrou a vaga ideal hoje?</span>
            </h3>
            <p className="text-xs text-blue-100 max-w-xl">
              Cadastre seu currículo diretamente no nosso Banco de Talentos e fique disponível para recrutadores de várias empresas parceiras.
            </p>
          </div>
          <button
            onClick={() => setShowTalentBankModal(true)}
            className="px-5 py-2.5 bg-white text-blue-900 hover:bg-blue-50 text-xs font-bold rounded-xl shadow-xs transition-all shrink-0 self-start sm:self-auto"
          >
            Cadastrar no Banco de Talentos
          </button>
        </div>

        {/* VAGAS LIST GRID */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center space-x-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              <span>Oportunidades Disponíveis ({jobs.length})</span>
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-12">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse h-48" />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
              <Search className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">
                Nenhuma vaga encontrada com estes filtros
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Tente ajustar os termos de busca ou limpar os filtros para visualizar mais vagas.
              </p>
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700"
              >
                Limpar todos os filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {jobs.map(job => (
                <JobCard
                  key={job.id}
                  job={job}
                  onViewJob={j => setSelectedJob(j)}
                  onEasyApply={j => setEasyApplyJob(j)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* JOB DETAIL MODAL */}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onEasyApply={j => {
            setSelectedJob(null);
            setEasyApplyJob(j);
          }}
        />
      )}

      {/* EASY APPLY MODAL */}
      {easyApplyJob && (
        <EasyApplyModal
          job={easyApplyJob}
          onClose={() => setEasyApplyJob(null)}
          onSuccess={() => {
            setEasyApplyJob(null);
            fetchJobs();
          }}
        />
      )}

      {/* TALENT BANK MODAL */}
      {(showTalentBankModal || activeTab === 'banco-de-talentos') && (
        <TalentBankModal
          onClose={() => {
            setShowTalentBankModal(false);
            if (activeTab === 'banco-de-talentos') setActiveTab('home');
          }}
          onSuccess={() => {
            setShowTalentBankModal(false);
            if (activeTab === 'banco-de-talentos') setActiveTab('home');
          }}
        />
      )}
    </div>
  );
};

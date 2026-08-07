import React, { useState, useEffect } from 'react';
import {
  Search,
  UserCheck,
  Briefcase,
  Sparkles,
  Award,
  Filter,
  Eye,
  FileText,
  Building2,
  Calendar,
  Send,
  Star,
  Plus,
  CheckCircle2
} from 'lucide-react';
import { Job, Candidate, Application } from '../../types';

interface Props {
  companyId: string;
  onOpenDrawer: (appId: string) => void;
}

export const HeadhunterView: React.FC<Props> = ({ companyId, onOpenDrawer }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [applications, setApplications] = useState<any[]>([]);
  const [talents, setTalents] = useState<Candidate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'headhunt_pipeline' | 'executive_search'>('headhunt_pipeline');

  // Sourcing Modal State
  const [sourcingCandidate, setSourcingCandidate] = useState<Candidate | null>(null);
  const [sourcingJobId, setSourcingJobId] = useState<string>('');

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch Jobs
      const jobsRes = await fetch(`/api/company/jobs?companyId=${companyId}`);
      if (jobsRes.ok) {
        const jData = await jobsRes.json();
        setJobs(jData.jobs || []);
        if (jData.jobs?.length > 0 && !selectedJobId) {
          setSelectedJobId(jData.jobs[0].id);
        }
      }

      // Fetch Talent Pool
      const poolRes = await fetch(`/api/company/candidates/pool?companyId=${companyId}`);
      if (poolRes.ok) {
        const pData = await poolRes.json();
        setTalents(pData.candidates || []);
      }
    } catch (e) {
      console.error('Error loading headhunter data:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicationsForJob = async (jobId: string) => {
    if (!jobId) return;
    try {
      const res = await fetch(`/api/company/jobs/${jobId}/applications?companyId=${companyId}`);
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
      }
    } catch (e) {
      console.error('Error fetching applications for headhunter:', e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [companyId]);

  useEffect(() => {
    if (selectedJobId) {
      fetchApplicationsForJob(selectedJobId);
    }
  }, [selectedJobId]);

  const handleSourceTalent = async () => {
    if (!sourcingCandidate || !sourcingJobId) return;
    try {
      const res = await fetch('/api/public/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: sourcingJobId,
          name: sourcingCandidate.name,
          cpf: sourcingCandidate.cpf,
          birthDate: sourcingCandidate.birthDate,
          email: sourcingCandidate.email,
          phone: sourcingCandidate.phone,
          city: sourcingCandidate.city,
          state: sourcingCandidate.state,
          resumeUrl: sourcingCandidate.resumeUrl,
          resumeFileName: sourcingCandidate.resumeFileName,
          bancoTalentos: true,
          lgpdAceito: true,
          origin: 'indicação'
        })
      });

      const data = await res.json();
      if (res.ok) {
        alert(`Candidato ${sourcingCandidate.name} vinculado à vaga como indicação de Headhunter com sucesso!`);
        setSourcingCandidate(null);
        fetchApplicationsForJob(selectedJobId);
      } else {
        alert(data.error || 'Erro ao vincular candidato.');
      }
    } catch (e) {
      alert('Erro ao realizar indicação de headhunter.');
    }
  };

  const selectedJob = jobs.find(j => j.id === selectedJobId);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold mb-2 border border-purple-400/20">
            <Award className="w-3.5 h-3.5" /> Módulo Headhunting Especializado
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Executive Search & Talent Sourcing</h1>
          <p className="text-purple-200 text-sm mt-1 max-w-2xl">
            Busca ativa de talentos de alto nível. Os dados de candidatos e vagas são compartilhados nativamente com o ATS Recrutamento e Seleção.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="bg-white/10 p-1 rounded-xl border border-white/20 flex gap-1">
          <button
            onClick={() => setActiveTab('headhunt_pipeline')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === 'headhunt_pipeline'
                ? 'bg-white text-slate-900 shadow'
                : 'text-white hover:bg-white/10'
            }`}
          >
            Pipeline por Vaga
          </button>
          <button
            onClick={() => setActiveTab('executive_search')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === 'executive_search'
                ? 'bg-white text-slate-900 shadow'
                : 'text-white hover:bg-white/10'
            }`}
          >
            Busca Ativa / Sourcing
          </button>
        </div>
      </div>

      {activeTab === 'headhunt_pipeline' ? (
        <div className="space-y-6">
          {/* Job Selector Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider shrink-0">
                Selecione a Vaga:
              </span>
              <select
                value={selectedJobId}
                onChange={e => setSelectedJobId(e.target.value)}
                className="w-full sm:w-80 px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {jobs.map(j => (
                  <option key={j.id} value={j.id}>
                    {j.title} ({j.city}/{j.state})
                  </option>
                ))}
              </select>
            </div>

            {selectedJob && (
              <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
                <span className="px-3 py-1 bg-purple-50 text-purple-700 font-bold rounded-full border border-purple-200">
                  {selectedJob.area}
                </span>
                <span>{selectedJob.openingsCount} vaga(s)</span>
                <span>{applications.length} candidato(s) em processo</span>
              </div>
            )}
          </div>

          {/* Applications Cards in Headhunter View */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-purple-600 fill-purple-600" />
              Candidatos Mapeados em Headhunting ({applications.length})
            </h3>

            {applications.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl">
                <p className="text-sm text-slate-500 font-medium">Nenhum candidato mapeado para esta vaga ainda.</p>
                <p className="text-xs text-slate-400 mt-1">Use a aba "Busca Ativa / Sourcing" para prospectar talentos no Banco.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {applications.map(app => (
                  <div
                    key={app.id}
                    className="p-5 bg-slate-50/80 hover:bg-slate-50 rounded-2xl border border-slate-200 hover:border-purple-300 transition shadow-sm hover:shadow flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{app.candidate?.name || 'Candidato'}</h4>
                          <p className="text-xs text-slate-500">{app.candidate?.city}/{app.candidate?.state}</p>
                        </div>
                        <span className="px-2.5 py-1 bg-purple-100 text-purple-800 text-[11px] font-bold rounded-full uppercase">
                          {app.stage.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs text-slate-600 my-3">
                        <p><strong className="text-slate-800">Origem:</strong> {app.origin}</p>
                        <p><strong className="text-slate-800">Pretensão Salarial:</strong> {app.candidate?.salaryExpectation || 'Não informada'}</p>
                        <p><strong className="text-slate-800">Cargo Atual:</strong> {app.candidate?.currentRole || 'N/I'}</p>
                        {app.aiScore !== undefined && (
                          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg border border-emerald-200 text-xs">
                            <Sparkles className="w-3.5 h-3.5" /> AI Match: {app.aiScore}%
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                      <button
                        onClick={() => onOpenDrawer(app.id)}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs rounded-xl transition flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" /> Avaliar Parecer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Executive Search / Sourcing Tab */
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">Prospectar Talentos no Banco de Dados Central</h3>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Buscar talentos por nome, cargo, cidade, habilidades..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Talent Pool Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {talents
                .filter(t =>
                  searchTerm
                    ? t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      t.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (t.currentRole && t.currentRole.toLowerCase().includes(searchTerm.toLowerCase()))
                    : true
                )
                .map(talent => (
                  <div key={talent.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-slate-900 text-sm">{talent.name}</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-200 text-slate-700 rounded">
                          {talent.id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{talent.city}/{talent.state}</p>
                      <p className="text-xs font-semibold text-slate-700 mt-2">
                        Cargo: {talent.currentRole || 'Profissional Cadastrado'}
                      </p>
                      <p className="text-xs text-slate-600">Expectativa: {talent.salaryExpectation || 'R$ 5.000+'}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200 flex justify-end">
                      <button
                        onClick={() => {
                          setSourcingCandidate(talent);
                          if (jobs.length > 0) setSourcingJobId(jobs[0].id);
                        }}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl transition flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Indicar para Vaga
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal to Source Talent */}
      {sourcingCandidate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Indicação de Headhunter</h3>
            <p className="text-xs text-slate-600">
              Vincular o talento <strong className="text-slate-900">{sourcingCandidate.name}</strong> a uma vaga aberta da empresa:
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Selecione a Vaga:</label>
              <select
                value={sourcingJobId}
                onChange={e => setSourcingJobId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
              >
                {jobs.map(j => (
                  <option key={j.id} value={j.id}>{j.title} ({j.city}/{j.state})</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                onClick={() => setSourcingCandidate(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={handleSourceTalent}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition"
              >
                Confirmar Vinculação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

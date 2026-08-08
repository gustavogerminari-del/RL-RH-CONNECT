import React, { useState, useEffect } from 'react';
import {
  Search,
  Users,
  FileText,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Award,
  Sparkles,
  Eye,
  Filter,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Plus
} from 'lucide-react';
import { Candidate } from '../../types';
import { maskCPFForPrivacy } from '../../utils/cpf';
import { TalentBankModal } from '../TalentBankModal';

interface Props {
  companyId: string;
}

export const BancoTalentosView: React.FC<Props> = ({ companyId }) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchTalents = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/company/candidates/pool?companyId=${companyId}`);
      if (res.ok) {
        const data = await res.json();
        setCandidates(data.candidates || []);
      }
    } catch (e) {
      console.error('Error fetching talent pool:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTalents();
  }, [companyId]);

  const filtered = candidates.filter(c => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.cpf && c.cpf.includes(q)) ||
      c.city.toLowerCase().includes(q) ||
      c.state.toLowerCase().includes(q) ||
      (c.currentRole && c.currentRole.toLowerCase().includes(q)) ||
      (c.skills && c.skills.some(s => s.toLowerCase().includes(q)))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-2 border border-teal-400/20">
            <ShieldCheck className="w-3.5 h-3.5" /> Banco Central de Talentos
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Repositório Geral de Candidatos</h1>
          <p className="text-teal-200 text-sm mt-1 max-w-2xl">
            Acesse currículos, históricos de candidaturas, qualificações e dados com autorização prévia da LGPD.
          </p>
        </div>
        <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/20 text-right">
          <div className="text-2xl font-black">{candidates.length}</div>
          <div className="text-[11px] text-teal-200">Talentos Cadastrados</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por nome, cidade, habilidade..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-xs text-slate-500 font-medium">
            Exibindo {filtered.length} de {candidates.length} talentos
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-1.5 transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Cadastrar Currículo</span>
          </button>
        </div>
      </div>

      {showAddModal && (
        <TalentBankModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            fetchTalents();
            setShowAddModal(false);
          }}
        />
      )}

      {/* Candidates List Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-500">Carregando Banco de Talentos...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500">
          Nenhum candidato localizado com o filtro informado.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(c => (
            <div
              key={c.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-teal-400 transition shadow-sm hover:shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{c.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5" /> {c.city} - {c.state}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-teal-50 text-teal-700 rounded border border-teal-200">
                    {c.id}
                  </span>
                </div>

                <div className="mt-3 space-y-1 text-xs text-slate-600">
                  <p><strong className="text-slate-800">CPF:</strong> {maskCPFForPrivacy(c.cpf)}</p>
                  <p><strong className="text-slate-800">Cargo Atual:</strong> {c.currentRole || 'N/I'}</p>
                  <p><strong className="text-slate-800">Expectativa:</strong> {c.salaryExpectation || 'A combinar'}</p>
                </div>

                {c.skills && c.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {c.skills.slice(0, 3).map((sk, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded-md">
                        {sk}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                <span className="text-[11px] text-slate-400">
                  Cadastrado em {new Date(c.createdAt).toLocaleDateString('pt-BR')}
                </span>
                <button
                  onClick={() => setSelectedCandidate(c)}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs rounded-xl transition flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" /> Ver Perfil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Candidate Full Profile Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-4">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{selectedCandidate.name}</h3>
                <p className="text-xs text-slate-500">ID: {selectedCandidate.id} | {selectedCandidate.city}/{selectedCandidate.state}</p>
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕ Fechar
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-slate-500 font-medium">CPF</p>
                <p className="font-bold text-slate-900">{selectedCandidate.cpf}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Data de Nascimento</p>
                <p className="font-bold text-slate-900">{selectedCandidate.birthDate}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">E-mail</p>
                <p className="font-bold text-slate-900">{selectedCandidate.email}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">WhatsApp / Telefone</p>
                <p className="font-bold text-slate-900">{selectedCandidate.phone}</p>
              </div>
            </div>

            {selectedCandidate.resumeUrl && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-800">{selectedCandidate.resumeFileName || 'Currículo.pdf'}</span>
                <a
                  href={selectedCandidate.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 bg-blue-600 text-white font-bold text-xs rounded-lg hover:bg-blue-700 transition"
                >
                  Baixar / Visualizar
                </a>
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedCandidate(null)}
                className="px-4 py-2 bg-slate-800 text-white font-bold text-xs rounded-xl"
              >
                Concluído
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

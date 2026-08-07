import React, { useState, useEffect } from 'react';
import {
  BarChart2,
  Download,
  TrendingUp,
  Users,
  Briefcase,
  Clock,
  DollarSign,
  FileSpreadsheet
} from 'lucide-react';

interface Props {
  companyId: string;
}

export const RelatoriosView: React.FC<Props> = ({ companyId }) => {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/company/dashboard?companyId=${companyId}`)
      .then(r => r.json())
      .then(d => {
        setReportData(d.metrics);
        setLoading(false);
      });
  }, [companyId]);

  const handleExportCSV = () => {
    if (!reportData) return;
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Indicador,Valor\n" +
      `Funcionários Ativos,${reportData.activeEmployees}\n` +
      `Vagas Abertas,${reportData.openJobs}\n` +
      `Total Candidatos,${reportData.totalCandidates}\n` +
      `Folha Estimada (R$),${reportData.totalPayrollAmount}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_rh_${companyId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-500">Gerando relatórios consolidados...</div>;
  }

  const m = reportData || {};

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-900 to-blue-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2 border border-indigo-400/20">
            <BarChart2 className="w-3.5 h-3.5" /> Módulo de Relatórios & Analytics
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Relatórios Gerenciais de RH</h1>
          <p className="text-indigo-200 text-sm mt-1 max-w-2xl">
            Relatórios consolidados de recrutamento (ATS), horas extras, custos de folha e efetivo de pessoal.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition shadow-lg flex items-center gap-2 shrink-0"
        >
          <FileSpreadsheet className="w-4 h-4" /> Exportar Planilha CSV
        </button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-600" /> Funil de Recrutamento & Seleção (ATS)
          </h3>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Total de Candidatos Inscritos</span>
                <span>{m.totalCandidates}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Entrevistas e Triagem Ativa</span>
                <span>{m.pendingInterviews || 2}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Contratações / Admissões Finalizadas</span>
                <span>{m.activeEmployees || 1}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" /> Custos de Pessoal e Cargas de Ponto
          </h3>

          <div className="p-4 bg-slate-50 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-600">Folha de Pagamento Estimada:</span>
              <strong className="text-slate-900 font-bold">R$ {m.totalPayrollAmount?.toLocaleString('pt-BR')}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Batimentos de Ponto Registrados Hoje:</span>
              <strong className="text-slate-900 font-bold">{m.pointEntriesToday} batimentos</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Férias em Andamento / Programadas:</span>
              <strong className="text-slate-900 font-bold">{m.scheduledVacations} colaboradores</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

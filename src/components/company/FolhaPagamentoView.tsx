import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Calculator,
  CheckCircle2,
  FileText,
  Calendar,
  Eye,
  Send,
  Building2,
  Users
} from 'lucide-react';
import { PayrollRecord } from '../../types';

interface Props {
  companyId: string;
}

export const FolhaPagamentoView: React.FC<Props> = ({ companyId }) => {
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([]);
  const [monthYear, setMonthYear] = useState('2026-08');
  const [loading, setLoading] = useState(true);
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollRecord | null>(null);

  const fetchPayroll = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/company/payrolls?companyId=${companyId}&monthYear=${monthYear}`);
      if (res.ok) {
        const data = await res.json();
        setPayrolls(data.payrolls || []);
      }
    } catch (e) {
      console.error('Error fetching payrolls:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, [companyId, monthYear]);

  const handleGeneratePayroll = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/company/payrolls/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, monthYear })
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'Folha calculada com sucesso!');
        fetchPayroll();
      } else {
        alert(data.error || 'Erro ao calcular folha.');
      }
    } catch (e) {
      alert('Erro ao calcular folha de pagamento.');
    } finally {
      setLoading(false);
    }
  };

  const totalBase = payrolls.reduce((acc, p) => acc + (p.baseSalary || 0), 0);
  const totalNet = payrolls.reduce((acc, p) => acc + (p.netSalary || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2 border border-emerald-400/20">
            <DollarSign className="w-3.5 h-3.5" /> Módulo de Folha de Pagamento
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Cálculo de Holerites & Encargos</h1>
          <p className="text-emerald-200 text-sm mt-1 max-w-2xl">
            Apurador automático de vencimentos, adicionais, horas extras do Ponto Digital, descontos legais de INSS / IRRF e salário líquido.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <input
            type="month"
            value={monthYear}
            onChange={e => setMonthYear(e.target.value)}
            className="px-3.5 py-2.5 bg-white/10 text-white border border-white/20 rounded-xl text-sm font-bold focus:outline-none"
          />
          <button
            onClick={handleGeneratePayroll}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition shadow-lg flex items-center gap-2"
          >
            <Calculator className="w-4 h-4" /> Calcular Folha ({monthYear})
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase">Colaboradores na Folha</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{payrolls.length}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase">Massa Salarial Bruta</span>
          <div className="text-2xl font-black text-slate-900 mt-1">R$ {totalBase.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase">Líquido Total a Pagar</span>
          <div className="text-2xl font-black text-emerald-700 mt-1">R$ {totalNet.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-600" /> Holerites do Mês ({monthYear})
        </h3>

        {loading ? (
          <div className="py-8 text-center text-slate-500">Processando folha de pagamento...</div>
        ) : payrolls.length === 0 ? (
          <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
            Nenhuma folha gerada para a competência {monthYear}. Clique em "Calcular Folha" acima.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Colaborador</th>
                  <th className="px-4 py-3">Salário Base</th>
                  <th className="px-4 py-3">Adicionais / HE</th>
                  <th className="px-4 py-3">INSS / IRRF</th>
                  <th className="px-4 py-3">Líquido</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payrolls.map(p => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 font-bold text-slate-900">{p.employeeName}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">R$ {p.baseSalary?.toLocaleString('pt-BR')}</td>
                    <td className="px-4 py-3 font-medium text-emerald-700">+R$ {p.additions?.toLocaleString('pt-BR')}</td>
                    <td className="px-4 py-3 font-medium text-red-600">-R$ {p.discounts?.toLocaleString('pt-BR')}</td>
                    <td className="px-4 py-3 font-black text-emerald-800">R$ {p.netSalary?.toLocaleString('pt-BR')}</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-[11px] rounded-full uppercase">
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedPayroll(p)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition flex items-center gap-1 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" /> Ver Holerite
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Holerite Preview Modal */}
      {selectedPayroll && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 border border-slate-200">
            <div className="border-b border-slate-200 pb-3 flex justify-between items-start">
              <div>
                <h3 className="text-lg font-black text-slate-900">DEMONSTRATIVO DE PAGAMENTO DE SALÁRIO</h3>
                <p className="text-xs text-slate-500">Competência: {selectedPayroll.monthYear} | Empresa: {companyId}</p>
              </div>
              <button onClick={() => setSelectedPayroll(null)} className="text-slate-400 font-bold text-sm">✕</button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
              <p><strong className="text-slate-900">Colaborador:</strong> {selectedPayroll.employeeName}</p>
              <p><strong className="text-slate-900">ID do Colaborador:</strong> {selectedPayroll.employeeId}</p>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2">Descrição da Rubrica</th>
                    <th className="p-2 text-right">Proventos</th>
                    <th className="p-2 text-right">Descontos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-2 text-slate-800 font-medium">Salário Base Mensal</td>
                    <td className="p-2 text-right font-bold text-emerald-700">R$ {selectedPayroll.baseSalary?.toLocaleString('pt-BR')}</td>
                    <td className="p-2 text-right text-slate-400">-</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-slate-800 font-medium">Horas Extras & Adicionais</td>
                    <td className="p-2 text-right font-bold text-emerald-700">R$ {selectedPayroll.additions?.toLocaleString('pt-BR')}</td>
                    <td className="p-2 text-right text-slate-400">-</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-slate-800 font-medium">Desconto INSS (Previdência Social)</td>
                    <td className="p-2 text-right text-slate-400">-</td>
                    <td className="p-2 text-right font-bold text-red-600">R$ {selectedPayroll.inssAmount?.toLocaleString('pt-BR')}</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-slate-800 font-medium">Desconto IRRF (Imposto de Renda)</td>
                    <td className="p-2 text-right text-slate-400">-</td>
                    <td className="p-2 text-right font-bold text-red-600">R$ {selectedPayroll.irrfAmount?.toLocaleString('pt-BR')}</td>
                  </tr>
                </tbody>
                <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                  <tr>
                    <td className="p-2 text-slate-900">VALOR LÍQUIDO A RECEBER</td>
                    <td colSpan={2} className="p-2 text-right text-base text-emerald-800">
                      R$ {selectedPayroll.netSalary?.toLocaleString('pt-BR')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setSelectedPayroll(null)} className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl">
                Fechar Holerite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  UserCheck,
  Building2,
  Phone,
  Mail,
  DollarSign,
  Briefcase,
  FileText,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Eye,
  CreditCard
} from 'lucide-react';
import { Employee } from '../../types';

interface Props {
  companyId: string;
}

export const FuncionariosView: React.FC<Props> = ({ companyId }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Employee Form
  const [newEmp, setNewEmp] = useState<Partial<Employee>>({
    name: '',
    cpf: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    salary: 3500,
    workSchedule: '44h semanais CLT',
    admissionDate: new Date().toISOString().slice(0, 10),
    contractType: 'CLT',
    status: 'ativo'
  });

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/company/employees?companyId=${companyId}`);
      if (res.ok) {
        const data = await res.json();
        setEmployees(data.employees || []);
      }
    } catch (e) {
      console.error('Error fetching employees:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [companyId]);

  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmp.name || !newEmp.cpf || !newEmp.role) {
      alert('Nome, CPF e Cargo são obrigatórios.');
      return;
    }

    try {
      const res = await fetch('/api/company/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newEmp,
          companyId
        })
      });

      const data = await res.json();
      if (res.ok) {
        alert('Colaborador cadastrado com sucesso no Cadastro Central de Funcionários!');
        setShowAddModal(false);
        fetchEmployees();
      } else {
        alert(data.error || 'Erro ao cadastrar colaborador.');
      }
    } catch (e) {
      alert('Erro na comunicação com o servidor.');
    }
  };

  const filtered = employees.filter(e => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      e.name.toLowerCase().includes(q) ||
      e.cpf.includes(q) ||
      e.role.toLowerCase().includes(q) ||
      e.department.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-2 border border-blue-400/20">
            <Users className="w-3.5 h-3.5" /> Cadastro Central de Colaboradores
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Funcionários da Empresa</h1>
          <p className="text-blue-200 text-sm mt-1 max-w-2xl">
            Gestão do cadastro central de colaboradores (`employeeId`), dados bancários, dependentes, cargo, jornada e contratos.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl transition shadow-lg flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" /> Novo Colaborador
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por nome, CPF, cargo, departamento..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">Total: {filtered.length} colaboradores</span>
      </div>

      {/* Employee List */}
      {loading ? (
        <div className="p-12 text-center text-slate-500">Carregando quadro de colaboradores...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500">
          Nenhum colaborador encontrado.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">ID / Nome</th>
                  <th className="px-5 py-3.5">Cargo / Depto</th>
                  <th className="px-5 py-3.5">Contrato / Salário</th>
                  <th className="px-5 py-3.5">Admissão</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(emp => (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900">{emp.name}</div>
                      <div className="text-xs text-slate-500">CPF: {emp.cpf} | ID: {emp.id}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-800">{emp.role}</div>
                      <div className="text-xs text-slate-500">{emp.department}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-emerald-700">R$ {emp.salary?.toLocaleString('pt-BR')}</div>
                      <div className="text-xs text-slate-500">{emp.contractType}</div>
                    </td>
                    <td className="px-5 py-4 text-xs font-medium text-slate-700">
                      {new Date(emp.admissionDate).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${
                        emp.status === 'ativo' ? 'bg-emerald-100 text-emerald-800' :
                        emp.status === 'ferias' ? 'bg-amber-100 text-amber-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {emp.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setSelectedEmp(emp)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs rounded-xl transition flex items-center gap-1 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" /> Ficha Completa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveEmployee} className="bg-white rounded-2xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Novo Cadastro de Colaborador</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={newEmp.name}
                  onChange={e => setNewEmp({ ...newEmp, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">CPF *</label>
                <input
                  type="text"
                  required
                  placeholder="000.000.000-00"
                  value={newEmp.cpf}
                  onChange={e => setNewEmp({ ...newEmp, cpf: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cargo *</label>
                <input
                  type="text"
                  required
                  value={newEmp.role}
                  onChange={e => setNewEmp({ ...newEmp, role: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Departamento</label>
                <input
                  type="text"
                  value={newEmp.department}
                  onChange={e => setNewEmp({ ...newEmp, department: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Salário Base (R$)</label>
                <input
                  type="number"
                  value={newEmp.salary}
                  onChange={e => setNewEmp({ ...newEmp, salary: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Data de Admissão</label>
                <input
                  type="date"
                  value={newEmp.admissionDate}
                  onChange={e => setNewEmp({ ...newEmp, admissionDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition"
              >
                Salvar Colaborador
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Employee Details Modal */}
      {selectedEmp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-4">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{selectedEmp.name}</h3>
                <p className="text-xs text-slate-500">ID: {selectedEmp.id} | {selectedEmp.role} ({selectedEmp.department})</p>
              </div>
              <button
                onClick={() => setSelectedEmp(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕ Fechar
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <p className="text-slate-500 font-medium">CPF</p>
                <p className="font-bold text-slate-900">{selectedEmp.cpf}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Contrato</p>
                <p className="font-bold text-slate-900">{selectedEmp.contractType}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Salário</p>
                <p className="font-bold text-emerald-700">R$ {selectedEmp.salary?.toLocaleString('pt-BR')}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Admissão</p>
                <p className="font-bold text-slate-900">{selectedEmp.admissionDate}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Jornada</p>
                <p className="font-bold text-slate-900">{selectedEmp.workSchedule}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Status</p>
                <p className="font-bold text-blue-700 uppercase">{selectedEmp.status}</p>
              </div>
            </div>

            {selectedEmp.bankAccount && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <p className="font-bold text-slate-800 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-blue-600" /> Dados Bancários para Holerite / Pix
                </p>
                <p className="text-slate-600">Banco: {selectedEmp.bankAccount.bank} | Agência: {selectedEmp.bankAccount.agency} | Conta: {selectedEmp.bankAccount.account}</p>
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedEmp(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl"
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

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
  const [empActiveTab, setEmpActiveTab] = useState<
    'resumo' | 'pessoais' | 'profissionais' | 'documentos' | 'contrato' | 'jornada' | 'beneficios' | 'dependentes' | 'ferias' | 'ponto' | 'folha' | 'ocorrencias' | 'historico'
  >('resumo');
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

      {/* Employee Details Modal / Drawer with 13 Structured Tabs */}
      {selectedEmp && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex justify-end">
          <div className="w-full max-w-[620px] bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
            {/* Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-base font-bold text-white">{selectedEmp.name}</h3>
                <p className="text-xs text-slate-400">
                  ID: {selectedEmp.id} • {selectedEmp.role} ({selectedEmp.department})
                </p>
              </div>
              <button
                onClick={() => setSelectedEmp(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                ✕ Fechar
              </button>
            </div>

            {/* 13 Navigation Tabs */}
            <div className="bg-slate-100 border-b border-slate-200 flex items-center overflow-x-auto no-scrollbar px-2 py-1.5 text-xs shrink-0 space-x-1">
              {[
                { id: 'resumo', label: 'Resumo' },
                { id: 'pessoais', label: 'Dados Pessoais' },
                { id: 'profissionais', label: 'Profissionais' },
                { id: 'documentos', label: 'Documentos' },
                { id: 'contrato', label: 'Contrato' },
                { id: 'jornada', label: 'Jornada' },
                { id: 'beneficios', label: 'Benefícios' },
                { id: 'dependentes', label: 'Dependentes' },
                { id: 'ferias', label: 'Férias' },
                { id: 'ponto', label: 'Ponto' },
                { id: 'folha', label: 'Folha' },
                { id: 'ocorrencias', label: 'Ocorrências' },
                { id: 'historico', label: 'Histórico' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setEmpActiveTab(t.id as any)}
                  className={`px-2.5 py-1.5 rounded-lg font-bold whitespace-nowrap transition ${
                    empActiveTab === t.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              {/* TAB: RESUMO */}
              {empActiveTab === 'resumo' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-2 gap-3 text-slate-700">
                    <div>
                      <span className="text-slate-400 block font-medium">Status do Colaborador:</span>
                      <span className="font-bold text-emerald-700 uppercase">{selectedEmp.status}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">CPF:</span>
                      <span className="font-mono font-bold text-slate-900">{selectedEmp.cpf}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Cargo:</span>
                      <span className="font-bold text-slate-900">{selectedEmp.role}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Departamento:</span>
                      <span className="font-semibold text-slate-800">{selectedEmp.department}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Salário Base:</span>
                      <span className="font-bold text-emerald-700">R$ {selectedEmp.salary?.toLocaleString('pt-BR')}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Data de Admissão:</span>
                      <span className="font-semibold text-slate-800">{new Date(selectedEmp.admissionDate).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: DADOS PESSOAIS */}
              {empActiveTab === 'pessoais' && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs border-b pb-1">Identificação do Colaborador</h4>
                  <p><span className="text-slate-500">Nome:</span> <strong>{selectedEmp.name}</strong></p>
                  <p><span className="text-slate-500">CPF:</span> <strong className="font-mono">{selectedEmp.cpf}</strong></p>
                  <p><span className="text-slate-500">Nascimento:</span> {selectedEmp.birthDate || 'Não informado'}</p>
                  <p><span className="text-slate-500">E-mail:</span> {selectedEmp.email || 'Não informado'}</p>
                  <p><span className="text-slate-500">Telefone:</span> {selectedEmp.phone || 'Não informado'}</p>
                  <p><span className="text-slate-500">Endereço:</span> {selectedEmp.address ? `${selectedEmp.address.street || ''} ${selectedEmp.address.city || ''}/${selectedEmp.address.state || ''}` : 'Não informado'}</p>
                </div>
              )}

              {/* TAB: DADOS PROFISSIONAIS */}
              {empActiveTab === 'profissionais' && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs border-b pb-1">Cargo e Estrutura Organizacional</h4>
                  <p><span className="text-slate-500">Cargo Atual:</span> <strong>{selectedEmp.role}</strong></p>
                  <p><span className="text-slate-500">Departamento:</span> <strong>{selectedEmp.department}</strong></p>
                  <p><span className="text-slate-500">ID do Candidato Origem:</span> <strong>{selectedEmp.candidateId || 'Admissão Direta'}</strong></p>
                </div>
              )}

              {/* TAB: DOCUMENTOS */}
              {empActiveTab === 'documentos' && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs border-b pb-1">Documentos Digitais & Contrato</h4>
                  <p className="text-slate-600">Documentação vinculada ao prontuário do funcionário no Departamento Pessoal.</p>
                </div>
              )}

              {/* TAB: CONTRATO */}
              {empActiveTab === 'contrato' && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs border-b pb-1">Regime e Tipo de Contrato</h4>
                  <p><span className="text-slate-500">Tipo de Contrato:</span> <strong>{selectedEmp.contractType}</strong></p>
                  <p><span className="text-slate-500">Salário Contratual:</span> <strong className="text-emerald-700">R$ {selectedEmp.salary?.toLocaleString('pt-BR')}</strong></p>
                  <p><span className="text-slate-500">Data Admissão:</span> {selectedEmp.admissionDate}</p>
                </div>
              )}

              {/* TAB: JORNADA */}
              {empActiveTab === 'jornada' && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs border-b pb-1">Carga Horária e Escala de Trabalho</h4>
                  <p><span className="text-slate-500">Jornada:</span> <strong>{selectedEmp.workSchedule}</strong></p>
                  <p><span className="text-slate-500">Regime:</span> Ponto Digital com tolerância CLT de 10 minutos diários.</p>
                </div>
              )}

              {/* TAB: BENEFÍCIOS */}
              {empActiveTab === 'beneficios' && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs border-b pb-1">Pacote de Benefícios do Colaborador</h4>
                  <p className="text-slate-600">Vale Transporte, Vale Refeição/Alimentação e Plano de Saúde vinculados no portal de benefícios.</p>
                </div>
              )}

              {/* TAB: DEPENDENTES */}
              {empActiveTab === 'dependentes' && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs border-b pb-1">Dependentes para IRRF / Salário Família</h4>
                  <p className="text-slate-600">Nenhum dependente cadastrado para este colaborador.</p>
                </div>
              )}

              {/* TAB: FÉRIAS */}
              {empActiveTab === 'ferias' && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs border-b pb-1">Período Aquisitivo e Programação de Férias</h4>
                  <p className="text-slate-600">Período Aquisitivo Ativo. Programação gerida via módulo Departamento Pessoal.</p>
                </div>
              )}

              {/* TAB: PONTO */}
              {empActiveTab === 'ponto' && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs border-b pb-1">Espelho de Ponto Digital & Banco de Horas</h4>
                  <p className="text-slate-600">Registros de batimentos diários integrados com cálculo de horas extras e faltas.</p>
                </div>
              )}

              {/* TAB: FOLHA */}
              {empActiveTab === 'folha' && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs border-b pb-1">Histórico de Holerites e Lançamentos</h4>
                  <p className="text-slate-600">Proventos, descontos de INSS, IRRF e salário líquido gerados mensalmente.</p>
                </div>
              )}

              {/* TAB: OCORRÊNCIAS */}
              {empActiveTab === 'ocorrencias' && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs border-b pb-1">Ocorrências do Prontuário</h4>
                  <p className="text-slate-600">Registro de atestados, ausências justificadas ou advertências.</p>
                </div>
              )}

              {/* TAB: HISTÓRICO */}
              {empActiveTab === 'historico' && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs border-b pb-1">Linha do Tempo Profissional</h4>
                  <p className="text-slate-600">Admissão realizada em {new Date(selectedEmp.admissionDate).toLocaleDateString('pt-BR')}.</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 flex justify-end shrink-0">
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

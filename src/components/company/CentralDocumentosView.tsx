import React, { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  Search,
  CheckCircle2,
  AlertTriangle,
  Download,
  Eye,
  Plus
} from 'lucide-react';
import { DocumentItem, Employee } from '../../types';

interface Props {
  companyId: string;
}

export const CentralDocumentosView: React.FC<Props> = ({ companyId }) => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const [form, setForm] = useState({
    entityType: 'funcionario' as any,
    entityId: '',
    category: 'admissional',
    title: '',
    fileName: '',
    fileUrl: '',
    expirationDate: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [docRes, empRes] = await Promise.all([
        fetch(`/api/company/central-documents?companyId=${companyId}`),
        fetch(`/api/company/employees?companyId=${companyId}`)
      ]);

      if (docRes.ok) setDocuments((await docRes.json()).documents || []);
      if (empRes.ok) setEmployees((await empRes.json()).employees || []);
    } catch (e) {
      console.error('Error loading documents:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [companyId]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({
          ...form,
          fileName: file.name,
          fileUrl: reader.result as string,
          title: form.title || file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.fileUrl) return alert('Anexe o documento e informe o título.');

    const emp = employees.find(e => e.id === form.entityId);

    try {
      const res = await fetch('/api/company/central-documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          companyId,
          entityName: emp ? emp.name : 'Geral',
          status: 'valido'
        })
      });

      if (res.ok) {
        alert('Documento armazenado com sucesso!');
        setShowUploadModal(false);
        loadData();
      }
    } catch (e) {
      alert('Erro ao salvar documento.');
    }
  };

  const filtered = documents.filter(d => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      d.title.toLowerCase().includes(q) ||
      d.category.toLowerCase().includes(q) ||
      (d.entityName && d.entityName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-2 border border-blue-400/20">
            <FileText className="w-3.5 h-3.5" /> Repositório Central Documental
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Documentos & Anexos do Sistema</h1>
          <p className="text-blue-200 text-sm mt-1 max-w-2xl">
            Central de armazenamento de comprovantes, CNH, certificados, diplomas, holerites e contratos admissionais com controle de validade.
          </p>
        </div>

        <button
          onClick={() => {
            if (employees.length > 0) setForm({ ...form, entityId: employees[0].id });
            setShowUploadModal(true);
          }}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl transition shadow-lg flex items-center gap-2 shrink-0"
        >
          <Upload className="w-4 h-4" /> Anexar Documento
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por título, colaborador ou categoria..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">Total: {filtered.length} arquivos salvos</span>
      </div>

      {/* Documents List Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        {loading ? (
          <div className="py-8 text-center text-slate-500">Carregando repositório...</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
            Nenhum documento armazenado no repositório.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Documento / Título</th>
                  <th className="px-4 py-3">Vínculo (Entidade)</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3">Validade</th>
                  <th className="px-4 py-3 text-right">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(doc => (
                  <tr key={doc.id}>
                    <td className="px-4 py-3 font-bold text-slate-900">
                      <div>{doc.title}</div>
                      <div className="text-xs text-slate-500 font-mono">{doc.fileName}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-medium">{doc.entityName || doc.entityId}</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 font-bold text-xs rounded uppercase">
                        {doc.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {doc.expirationDate ? doc.expirationDate : 'Sem Vencimento'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <a
                        href={doc.fileUrl}
                        download={doc.fileName || 'documento.pdf'}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition inline-flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" /> Baixar
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveDocument} className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Anexar Documento no Repositório</h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Título do Documento *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Colaborador Vinculado</label>
              <select
                value={form.entityId}
                onChange={e => setForm({ ...form, entityId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
              >
                {employees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.role})</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Categoria</label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
              >
                <option value="admissional">Admissional / Contrato</option>
                <option value="habilitacao">Habilitação / CNH / Registro Profissional</option>
                <option value="comprovante">Comprovante de Endereço / Escolaridade</option>
                <option value="holerite">Holerite / Comprovante de Pagamento</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Anexo / Arquivo *</label>
              <input
                type="file"
                onChange={handleFileUpload}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button type="button" onClick={() => setShowUploadModal(false)} className="px-4 py-2 text-xs font-medium">Cancelar</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl">Salvar e Armazenar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Award,
  Plus,
  CheckCircle2,
  AlertCircle,
  Building2,
  DollarSign,
  Gift
} from 'lucide-react';
import { BenefitItem } from '../../types';

interface Props {
  companyId: string;
}

export const BeneficiosView: React.FC<Props> = ({ companyId }) => {
  const [benefits, setBenefits] = useState<BenefitItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [form, setForm] = useState({
    name: '',
    type: 'VR' as any,
    value: 500,
    description: ''
  });

  const fetchBenefits = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/company/benefits?companyId=${companyId}`);
      if (res.ok) {
        const data = await res.json();
        setBenefits(data.benefits || []);
      }
    } catch (e) {
      console.error('Error loading benefits:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBenefits();
  }, [companyId]);

  const handleSaveBenefit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return alert('Nome do benefício é obrigatório.');

    try {
      const res = await fetch('/api/company/benefits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, companyId, active: true })
      });

      if (res.ok) {
        alert('Benefício cadastrado com sucesso!');
        setShowAddModal(false);
        fetchBenefits();
      }
    } catch (e) {
      alert('Erro ao salvar benefício.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-pink-950 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-semibold mb-2 border border-pink-400/20">
            <Gift className="w-3.5 h-3.5" /> Módulo de Gestão de Benefícios
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Benefícios & Incentivos da Empresa</h1>
          <p className="text-pink-200 text-sm mt-1 max-w-2xl">
            Gestão de cartões e pacotes de benefícios: Vale Refeição (VR), Vale Alimentação (VA), Vale Transporte (VT), Plano de Saúde, Odonto, Combustível e Bônus.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-pink-600 hover:bg-pink-500 text-white font-bold text-sm rounded-xl transition shadow-lg flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" /> Cadastrar Benefício
        </button>
      </div>

      {/* Benefits Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-500">Carregando catálogo de benefícios...</div>
      ) : benefits.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500">
          Nenhum benefício cadastrado no momento.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {benefits.map(b => (
            <div key={b.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-900 text-base">{b.name}</h3>
                  <span className="px-2.5 py-0.5 bg-pink-100 text-pink-800 text-xs font-bold rounded-full uppercase">
                    {b.type}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">{b.description || 'Benefício corporativo padrão.'}</p>
                <div className="mt-3 text-lg font-black text-pink-700">
                  R$ {b.value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / mês
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ativo para Colaboradores
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveBenefit} className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Novo Benefício</h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nome do Benefício *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Categoria / Tipo</label>
              <select
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
              >
                <option value="VR">Vale Refeição (VR)</option>
                <option value="VA">Vale Alimentação (VA)</option>
                <option value="VT">Vale Transporte (VT)</option>
                <option value="Saúde">Plano de Saúde Médica</option>
                <option value="Odonto">Plano Odontológico</option>
                <option value="Combustível">Auxílio Combustível</option>
                <option value="Assiduidade">Bônus Assiduidade</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Valor Mensal por Colaborador (R$)</label>
              <input
                type="number"
                required
                value={form.value}
                onChange={e => setForm({ ...form, value: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Regra / Descrição</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-xs font-medium">Cancelar</button>
              <button type="submit" className="px-4 py-2 bg-pink-600 text-white font-bold text-xs rounded-xl">Salvar Benefício</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { X, DollarSign, Search, Plus, Building2, AlertCircle, CheckCircle2, ChevronDown, User, FileText } from 'lucide-react';
import { HeadhunterClient } from '../../types';

export function parseCurrencyBRL(value: string | number): number {
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  if (!value) return 0;
  let str = String(value).trim();
  // Handle strings like "R$ 6.500,004444" or "6.500,00"
  if (str.includes(',')) {
    const parts = str.split(',');
    const integerPart = parts[0].replace(/[^\d]/g, '');
    const fractionPart = parts[1].replace(/[^\d]/g, '').slice(0, 2);
    str = `${integerPart}.${fractionPart}`;
  } else if (str.includes('.')) {
    const parts = str.split('.');
    if (parts.length > 2) {
      // e.g. 6.500.00
      const integerPart = parts.slice(0, -1).join('');
      const fractionPart = parts[parts.length - 1].slice(0, 2);
      str = `${integerPart}.${fractionPart}`;
    } else {
      const num = parseFloat(str.replace(/[^\d.]/g, ''));
      if (!isNaN(num)) return Math.round(num * 100) / 100;
    }
  } else {
    str = str.replace(/[^\d]/g, '');
  }
  const result = parseFloat(str);
  return isNaN(result) ? 0 : result;
}

export function formatCurrencyBRL(value: number | string): string {
  const num = typeof value === 'number' ? value : parseCurrencyBRL(value);
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
}

interface EncaminharHeadhunterModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  applicationId: string;
  candidateName: string;
  jobTitle: string;
  jobId?: string;
  initialSalary?: number | string;
  initialClientId?: string;
  initialClientName?: string;
  initialFee?: number | string;
  closingDate?: string;
  onSuccess?: (message: string) => void;
}

export const EncaminharHeadhunterModal: React.FC<EncaminharHeadhunterModalProps> = ({
  isOpen,
  onClose,
  companyId,
  applicationId,
  candidateName,
  jobTitle,
  jobId,
  initialSalary = 6500,
  initialClientId,
  initialClientName,
  initialFee,
  closingDate,
  onSuccess
}) => {
  const [clients, setClients] = useState<HeadhunterClient[]>([]);
  const [selectedClient, setSelectedClient] = useState<HeadhunterClient | null>(null);
  const [loadingClients, setLoadingClients] = useState(false);
  
  // Search & Dropdown State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Form Fields State
  const [salaryStr, setSalaryStr] = useState<string>(formatCurrencyBRL(initialSalary || 6500));
  const [feeStr, setFeeStr] = useState<string>('');
  const [isManualFee, setIsManualFee] = useState(false);
  const [commercialRuleText, setCommercialRuleText] = useState('');
  const [notes, setNotes] = useState(
    `Contratação de ${candidateName} finalizada no ATS e encaminhada para faturamento de honorários do Headhunter.`
  );
  
  // Date formatting (default 03/08/2026 or current formatted date)
  const defaultDate = closingDate || new Date().toLocaleDateString('pt-BR');
  const [formattedClosingDate, setFormattedClosingDate] = useState(defaultDate);

  // Submitting State
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal: Cadastrar Novo Cliente
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [newClientForm, setNewClientForm] = useState({
    corporateName: '',
    tradeName: '',
    cnpj: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    commercialResponsible: 'Gestor Comercial',
    billingType: 'percentual_salario' as 'percentual_salario' | 'valor_fixo' | 'percentual_anual' | 'manual',
    feePercent: 200,
    fixedFee: 3500,
    paymentDeadline: '30 dias'
  });
  const [savingNewClient, setSavingNewClient] = useState(false);
  const [newClientError, setNewClientError] = useState<string | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch Clients from Backend
  const fetchClients = async (selectClientIdToPick?: string) => {
    setLoadingClients(true);
    try {
      const res = await fetch(`/api/company/headhunter/clients?companyId=${companyId}`);
      if (res.ok) {
        const data = await res.json();
        const clientList: HeadhunterClient[] = (data.clients || []).filter(
          (c: HeadhunterClient) => c.status !== 'inativo'
        );
        setClients(clientList);

        // Pre-select logic
        const targetId = selectClientIdToPick || initialClientId;
        if (targetId) {
          const matched = clientList.find(c => c.id === targetId);
          if (matched) {
            setSelectedClient(matched);
          } else if (initialClientName) {
            const matchedByName = clientList.find(
              c => c.tradeName === initialClientName || c.corporateName === initialClientName
            );
            if (matchedByName) setSelectedClient(matchedByName);
          }
        } else if (clientList.length > 0 && !selectedClient) {
          // Preselect first client if available
          setSelectedClient(clientList[0]);
        }
      }
    } catch (err) {
      console.error('Erro ao buscar clientes Headhunter:', err);
    } finally {
      setLoadingClients(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setSalaryStr(formatCurrencyBRL(initialSalary || 6500));
      setErrorMessage(null);
      setIsManualFee(false);
      fetchClients();
    }
  }, [isOpen, companyId, applicationId]);

  // Recalculate fees when client or salary changes
  useEffect(() => {
    const salNum = parseCurrencyBRL(salaryStr);

    if (initialFee && !selectedClient && !isManualFee) {
      setFeeStr(formatCurrencyBRL(initialFee));
      setCommercialRuleText('Regra comercial personalizada');
      return;
    }

    if (!selectedClient) {
      const fallbackFee = salNum * 2;
      setFeeStr(formatCurrencyBRL(fallbackFee));
      setCommercialRuleText('Selecione um cliente para carregar a regra comercial');
      return;
    }

    const bType = selectedClient.billingType || 'percentual_salario';
    const pct = selectedClient.feePercent ?? 100;
    const fixed = selectedClient.fixedFee ?? 3500;

    let calcFee = 0;
    let ruleText = '';

    if (bType === 'percentual_salario') {
      calcFee = (salNum * pct) / 100;
      ruleText = `Regra comercial: ${pct}% sobre remuneração`;
    } else if (bType === 'valor_fixo') {
      calcFee = fixed;
      ruleText = `Regra comercial: Valor fixo de ${formatCurrencyBRL(fixed)}`;
    } else if (bType === 'percentual_anual') {
      calcFee = (salNum * 12 * pct) / 100;
      ruleText = `Regra comercial: ${pct}% sobre remuneração anual`;
    } else {
      calcFee = (salNum * pct) / 100;
      ruleText = `Regra comercial: Acordo manual de honorários`;
    }

    if (!isManualFee) {
      setFeeStr(formatCurrencyBRL(calcFee));
    }
    setCommercialRuleText(ruleText);
  }, [selectedClient, salaryStr, isManualFee]);

  if (!isOpen) return null;

  // Filter clients by search query
  const filteredClients = clients.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const trade = (c.tradeName || '').toLowerCase();
    const corp = (c.corporateName || '').toLowerCase();
    const cnpj = (c.cnpj || '').replace(/\D/g, '');
    const cleanQ = q.replace(/\D/g, '');

    return trade.includes(q) || corp.includes(q) || (cleanQ.length > 0 && cnpj.includes(cleanQ));
  });

  // Handle Salary Change
  const handleSalaryBlur = () => {
    const num = parseCurrencyBRL(salaryStr);
    setSalaryStr(formatCurrencyBRL(num));
  };

  // Handle Fee Change
  const handleFeeBlur = () => {
    const num = parseCurrencyBRL(feeStr);
    setFeeStr(formatCurrencyBRL(num));
  };

  // Create New Client Handler
  const handleSaveNewClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientForm.corporateName.trim() && !newClientForm.tradeName.trim()) {
      setNewClientError('Preencha a Razão Social ou Nome Fantasia.');
      return;
    }

    setSavingNewClient(true);
    setNewClientError(null);

    try {
      const res = await fetch('/api/company/headhunter/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newClientForm,
          companyId,
          tradeName: newClientForm.tradeName || newClientForm.corporateName,
          corporateName: newClientForm.corporateName || newClientForm.tradeName,
          status: 'ativo'
        })
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Erro ao cadastrar novo cliente.');
      }

      const newClient: HeadhunterClient = json.client;
      setShowNewClientModal(false);
      
      // Reset new client form
      setNewClientForm({
        corporateName: '',
        tradeName: '',
        cnpj: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        commercialResponsible: 'Gestor Comercial',
        billingType: 'percentual_salario',
        feePercent: 200,
        fixedFee: 3500,
        paymentDeadline: '30 dias'
      });

      // Refresh list and select new client automatically
      await fetchClients(newClient.id);
      setSelectedClient(newClient);
      setIsDropdownOpen(false);
    } catch (err: any) {
      setNewClientError(err.message || 'Erro ao salvar cliente.');
    } finally {
      setSavingNewClient(false);
    }
  };

  // Confirm and Submit to Headhunter & Financial
  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation 1: Must select client
    if (!selectedClient) {
      setErrorMessage('Selecione o Cliente Corporativo responsável por esta contratação.');
      return;
    }

    // Validation 2: Check required amounts
    const salaryNum = parseCurrencyBRL(salaryStr);
    const feeNum = parseCurrencyBRL(feeStr);

    if (salaryNum <= 0) {
      setErrorMessage('Informe um valor de salário/remuneração válido.');
      return;
    }

    if (feeNum <= 0) {
      setErrorMessage('Informe o valor dos honorários do Headhunter.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/company/applications/${applicationId}/hire-headhunter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          clientId: selectedClient.id,
          clientName: selectedClient.tradeName || selectedClient.corporateName,
          salary: salaryNum,
          headhunterFee: feeNum,
          billingRule: selectedClient.billingType || 'percentual_salario',
          feePercent: selectedClient.feePercent || 100,
          commercialResponsible: selectedClient.commercialResponsible || 'Gestor Comercial',
          closingDate: formattedClosingDate,
          notes,
          recruiterUser: { name: 'Gestor de RH' }
        })
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Ocorreu um erro ao processar a contratação.');
      }

      if (onSuccess) {
        onSuccess(json.message || 'Contratação enviada ao Headhunter & Financeiro com sucesso!');
      }
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao comunicar com o servidor.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 font-sans select-none border border-slate-200 animate-in zoom-in-95 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-base shadow-xs">
              $
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 leading-tight">Encaminhar ao Headhunter & Financeiro</h3>
              <p className="text-xs text-slate-500 font-medium">Enviar contratação finalizada para faturamento de honorários</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-bold">Candidato Contratado:</span>
            <span className="font-extrabold text-slate-900 text-sm">{candidateName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-bold">Cargo / Vaga:</span>
            <span className="font-extrabold text-blue-600 uppercase tracking-wide">{jobTitle}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-bold">Data de Fechamento:</span>
            <span className="font-extrabold text-slate-800">{formattedClosingDate}</span>
          </div>
        </div>

        {/* Error Message Display */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-bold flex items-start space-x-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleConfirm} className="space-y-3.5 text-xs">
          
          {/* SEARCHABLE CLIENT SELECT */}
          <div className="relative" ref={dropdownRef}>
            <label className="block font-bold text-slate-700 mb-1">
              Cliente Corporativo / Solicitante *
            </label>

            {/* Selected Value Trigger / Search Input */}
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium cursor-pointer flex items-center justify-between transition hover:border-purple-300 ${
                isDropdownOpen ? 'bg-white ring-2 ring-purple-500 border-purple-500' : ''
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                <Building2 className="w-4 h-4 text-purple-600 shrink-0" />
                {selectedClient ? (
                  <div className="truncate">
                    <span className="font-bold text-slate-900 block truncate">
                      {selectedClient.tradeName || selectedClient.corporateName}
                    </span>
                    {selectedClient.cnpj && (
                      <span className="text-[10px] text-slate-500 block">
                        CNPJ: {selectedClient.cnpj}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-slate-400 font-normal">🔍 Selecione o cliente corporativo...</span>
                )}
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-64 flex flex-col animate-in fade-in zoom-in-95">
                {/* Search Bar */}
                <div className="p-2 border-b border-slate-100 bg-slate-50/50 flex items-center space-x-2">
                  <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="🔍 Buscar por Nome Fantasia, Razão Social ou CNPJ..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-xs font-medium text-slate-800 placeholder-slate-400"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="text-slate-400 hover:text-slate-600 text-[10px] font-bold px-1"
                    >
                      Limpar
                    </button>
                  )}
                </div>

                {/* Client List Container */}
                <div className="overflow-y-auto max-h-44 divide-y divide-slate-100">
                  {loadingClients ? (
                    <div className="p-4 text-center text-slate-400 text-xs">Carregando clientes...</div>
                  ) : filteredClients.length > 0 ? (
                    filteredClients.map((c) => {
                      const isSelected = selectedClient?.id === c.id;
                      return (
                        <div
                          key={c.id}
                          onClick={() => {
                            setSelectedClient(c);
                            setIsDropdownOpen(false);
                            setSearchQuery('');
                            setIsManualFee(false);
                          }}
                          className={`p-2.5 cursor-pointer transition flex items-center justify-between ${
                            isSelected ? 'bg-purple-50 text-purple-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div>
                            <div className="font-extrabold text-xs text-slate-900">
                              {c.tradeName || c.corporateName}
                            </div>
                            <div className="text-[10px] text-slate-500 font-medium">
                              {c.corporateName !== c.tradeName ? `${c.corporateName} • ` : ''}
                              {c.cnpj ? `CNPJ: ${c.cnpj}` : 'Sem CNPJ'}
                            </div>
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />}
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-3 text-center text-slate-500 text-xs">
                      <p className="font-medium text-slate-600">Nenhum cliente corporativo cadastrado.</p>
                    </div>
                  )}
                </div>

                {/* Always-visible Add New Client Action */}
                <div className="p-2 border-t border-slate-100 bg-slate-50">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setShowNewClientModal(true);
                    }}
                    className="w-full py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-lg flex items-center justify-center space-x-1.5 transition text-xs shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Cadastrar novo cliente</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* SALARY & HEADHUNTER FEE GRID */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Salário / Remuneração *
              </label>
              <input
                type="text"
                required
                value={salaryStr}
                onChange={(e) => {
                  setSalaryStr(e.target.value);
                  setIsManualFee(false);
                }}
                onBlur={handleSalaryBlur}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Honorários Headhunter *
              </label>
              <input
                type="text"
                required
                value={feeStr}
                onChange={(e) => {
                  setFeeStr(e.target.value);
                  setIsManualFee(true);
                }}
                onBlur={handleFeeBlur}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-purple-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* COMMERCIAL RULE DESCRIPTION */}
          {commercialRuleText && (
            <div className="px-3 py-1.5 bg-purple-50 border border-purple-100 rounded-lg text-purple-800 text-[11px] font-bold flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600 shrink-0"></span>
              <span>{commercialRuleText}</span>
            </div>
          )}

          {/* NOTES */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Observações de Faturamento
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs"
            />
          </div>

          {/* BUTTONS */}
          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl shadow-md transition flex items-center space-x-1.5 disabled:opacity-50"
            >
              <DollarSign className="w-4 h-4" />
              <span>{submitting ? 'Enviando...' : 'Confirmar e Enviar ao Headhunter'}</span>
            </button>
          </div>
        </form>

        {/* SUB-MODAL: CADASTRAR NOVO CLIENTE HEADHUNTER */}
        {showNewClientModal && (
          <div className="fixed inset-0 z-[60] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-3.5 border border-slate-200 text-xs animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900">Cadastrar Cliente Headhunter</h4>
                </div>
                <button
                  onClick={() => setShowNewClientModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {newClientError && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-800 rounded-lg text-[11px] font-bold">
                  {newClientError}
                </div>
              )}

              <form onSubmit={handleSaveNewClient} className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nome Fantasia / Cliente *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Logística Express S.A."
                    value={newClientForm.tradeName}
                    onChange={(e) => setNewClientForm({ ...newClientForm, tradeName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Razão Social</label>
                  <input
                    type="text"
                    placeholder="Ex: Logística Express Serviços Logísticos S.A."
                    value={newClientForm.corporateName}
                    onChange={(e) => setNewClientForm({ ...newClientForm, corporateName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">CNPJ</label>
                    <input
                      type="text"
                      placeholder="00.000.000/0001-00"
                      value={newClientForm.cnpj}
                      onChange={(e) => setNewClientForm({ ...newClientForm, cnpj: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Regra de Cobrança</label>
                    <select
                      value={newClientForm.billingType}
                      onChange={(e) => setNewClientForm({ ...newClientForm, billingType: e.target.value as any })}
                      className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="percentual_salario">% sobre salário</option>
                      <option value="valor_fixo">Valor Fixo (R$)</option>
                      <option value="percentual_anual">% sobre salário anual</option>
                      <option value="manual">Manual</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">% Honorários ou Valor Fixo</label>
                    <input
                      type="number"
                      placeholder="200 ou 3500"
                      value={newClientForm.billingType === 'valor_fixo' ? newClientForm.fixedFee : newClientForm.feePercent}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        if (newClientForm.billingType === 'valor_fixo') {
                          setNewClientForm({ ...newClientForm, fixedFee: val });
                        } else {
                          setNewClientForm({ ...newClientForm, feePercent: val });
                        }
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Prazo de Pagamento</label>
                    <input
                      type="text"
                      placeholder="Ex: 30 dias"
                      value={newClientForm.paymentDeadline}
                      onChange={(e) => setNewClientForm({ ...newClientForm, paymentDeadline: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Responsável Comercial</label>
                  <input
                    type="text"
                    placeholder="Nome do executivo de contas"
                    value={newClientForm.commercialResponsible}
                    onChange={(e) => setNewClientForm({ ...newClientForm, commercialResponsible: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowNewClientModal(false)}
                    disabled={savingNewClient}
                    className="px-3 py-1.5 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={savingNewClient}
                    className="px-4 py-1.5 bg-purple-600 text-white font-extrabold rounded-lg hover:bg-purple-700 shadow-xs"
                  >
                    {savingNewClient ? 'Salvando...' : 'Salvar e Selecionar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

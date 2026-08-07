import React, { useState } from 'react';
import {
  Search,
  MapPin,
  Filter,
  X,
  SlidersHorizontal,
  Briefcase,
  DollarSign,
  GraduationCap,
  Layers
} from 'lucide-react';
import { WorkMode, ContractType, JobArea } from '../types';

export interface FilterState {
  search: string;
  location: string;
  workMode: WorkMode | 'todos';
  contractType: ContractType | 'todos';
  area: JobArea | 'todas';
  salaryMin: string;
  experienceLevel: string;
  educationLevel: string;
}

interface JobFiltersProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onSearch: () => void;
  onClearFilters: () => void;
  totalResults: number;
}

export const JobFilters: React.FC<JobFiltersProps> = ({
  filters,
  setFilters,
  onSearch,
  onClearFilters,
  totalResults
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const areas: (JobArea | 'todas')[] = [
    'todas',
    'Administrativo',
    'Comercial',
    'Financeiro',
    'Logística',
    'RH',
    'Tecnologia',
    'Produção',
    'Operacional',
    'Marketing',
    'Engenharia',
    'Saúde',
    'Outros'
  ];

  const contractTypes: (ContractType | 'todos')[] = [
    'todos',
    'CLT',
    'PJ',
    'Temporário',
    'Estágio',
    'Jovem Aprendiz',
    'Freelancer',
    'Autônomo'
  ];

  const workModes: (WorkMode | 'todos')[] = ['todos', 'Presencial', 'Híbrido', 'Remoto'];

  const hasActiveFilters =
    filters.search ||
    filters.location ||
    filters.workMode !== 'todos' ||
    filters.contractType !== 'todos' ||
    filters.area !== 'todas' ||
    filters.salaryMin ||
    filters.experienceLevel ||
    filters.educationLevel;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-6 mb-8">
      {/* Primary Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Search Query */}
        <div className="md:col-span-5 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={filters.search}
            onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && onSearch()}
            placeholder="Cargo, palavra-chave ou empresa"
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>

        {/* Location Input */}
        <div className="md:col-span-4 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <MapPin className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={filters.location}
            onChange={e => setFilters(prev => ({ ...prev, location: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && onSearch()}
            placeholder="Cidade ou Estado (ex: São Paulo, SP)"
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>

        {/* Search & Filter Buttons */}
        <div className="md:col-span-3 flex items-center space-x-2">
          <button
            onClick={onSearch}
            className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>Buscar vagas</span>
          </button>

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`p-3 rounded-xl border text-sm font-medium transition-colors cursor-pointer flex items-center justify-center ${
              showAdvanced || hasActiveFilters
                ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
            title="Filtros avançados"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Quick Filter Chips */}
      <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-100">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">
          Modalidade:
        </span>
        {workModes.map(mode => (
          <button
            key={mode}
            onClick={() => setFilters(prev => ({ ...prev, workMode: mode }))}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              filters.workMode === mode
                ? 'bg-blue-600 text-white shadow-2xs font-semibold'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {mode === 'todos' ? 'Todas' : mode}
          </button>
        ))}

        <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1 hidden sm:inline">
          Área:
        </span>
        <select
          value={filters.area}
          onChange={e => setFilters(prev => ({ ...prev, area: e.target.value as any }))}
          className="bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium rounded-lg px-2.5 py-1 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
        >
          {areas.map(a => (
            <option key={a} value={a}>
              {a === 'todas' ? 'Todas as Áreas' : a}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="ml-auto text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center space-x-1"
          >
            <X className="w-3.5 h-3.5" />
            <span>Limpar Filtros</span>
          </button>
        )}
      </div>

      {/* Expanded Advanced Filters */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50/80 p-4 rounded-xl">
          {/* Contratação */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Contratação
            </label>
            <select
              value={filters.contractType}
              onChange={e =>
                setFilters(prev => ({ ...prev, contractType: e.target.value as any }))
              }
              className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-medium rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
            >
              {contractTypes.map(c => (
                <option key={c} value={c}>
                  {c === 'todos' ? 'Todos os tipos' : c}
                </option>
              ))}
            </select>
          </div>

          {/* Faixa Salarial Mínima */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Salário Mínimo (R$)
            </label>
            <input
              type="number"
              placeholder="ex: 3000"
              value={filters.salaryMin}
              onChange={e => setFilters(prev => ({ ...prev, salaryMin: e.target.value }))}
              className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-medium rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Nível Profissional */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nível Profissional
            </label>
            <select
              value={filters.experienceLevel}
              onChange={e => setFilters(prev => ({ ...prev, experienceLevel: e.target.value }))}
              className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-medium rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os níveis</option>
              <option value="Estágio / Trainee">Estágio / Trainee</option>
              <option value="Júnior">Júnior</option>
              <option value="Pleno">Pleno</option>
              <option value="Sênior">Sênior</option>
              <option value="Especialista / Liderança">Especialista / Liderança</option>
            </select>
          </div>

          {/* Escolaridade */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Escolaridade
            </label>
            <select
              value={filters.educationLevel}
              onChange={e => setFilters(prev => ({ ...prev, educationLevel: e.target.value }))}
              className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-medium rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Qualquer escolaridade</option>
              <option value="Ensino Fundamental">Ensino Fundamental</option>
              <option value="Ensino Médio">Ensino Médio</option>
              <option value="Ensino Técnico">Ensino Técnico</option>
              <option value="Ensino Superior">Ensino Superior</option>
              <option value="Pós-Graduação">Pós-Graduação / Especialização</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

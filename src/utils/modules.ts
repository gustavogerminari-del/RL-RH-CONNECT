export interface CompanyWithModules {
  id?: string;
  modules?: string[];
  [key: string]: any;
}

export const MODULE_IDS = {
  VAGAS: 'vagas',
  CANDIDATOS: 'candidatos',
  HEADHUNTER: 'headhunter',
  BANCO_TALENTOS: 'banco-de-talentos',
  AGENDA_ENTREVISTAS: 'agenda-entrevistas',
  CONTRATACOES: 'contratacoes',
  FUNCIONARIOS: 'funcionarios',
  ADMISSOES: 'admissoes',
  PONTO_DIGITAL: 'ponto-digital',
  FOLHA_PAGAMENTO: 'folha-de-pagamento',
  BENEFICIOS: 'beneficios',
  FERIAS: 'ferias',
  SST: 'sst',
  CENTRAL_DOCUMENTOS: 'central-documentos',
  RELATORIOS: 'relatorios',
  IA_RH: 'ia-rh'
} as const;

/**
 * Official helper to check if a module is enabled for a given company.
 */
export function hasModule(
  company: CompanyWithModules | null | undefined,
  moduleId: string
): boolean {
  if (!company) return false;

  const activeModules = company.modules;
  if (!Array.isArray(activeModules)) {
    return false;
  }

  // Direct check
  if (activeModules.includes(moduleId)) {
    return true;
  }

  // Aliases and group checks
  if (moduleId === 'headhunter' || moduleId === 'headhunter_finance') {
    return activeModules.includes('headhunter');
  }

  if (moduleId === 'dp' || moduleId === 'departamento_pessoal' || moduleId === 'departamento-pessoal') {
    return activeModules.some(m =>
      [
        'funcionarios',
        'admissoes',
        'ponto-digital',
        'folha-de-pagamento',
        'beneficios',
        'ferias',
        'sst',
        'central-documentos'
      ].includes(m)
    );
  }

  if (moduleId === 'recrutamento' || moduleId === 'recruitment') {
    return activeModules.some(m =>
      ['vagas', 'candidatos', 'banco-de-talentos', 'agenda-entrevistas', 'contratacoes', 'headhunter'].includes(m)
    );
  }

  return false;
}

/**
 * Returns module dependencies.
 */
export function getModuleDependencies(moduleId: string): string[] {
  switch (moduleId) {
    case 'headhunter_finance':
      return ['headhunter'];
    case 'folha-de-pagamento':
    case 'ponto-digital':
    case 'beneficios':
    case 'ferias':
    case 'sst':
    case 'admissoes':
      return ['funcionarios'];
    default:
      return [];
  }
}

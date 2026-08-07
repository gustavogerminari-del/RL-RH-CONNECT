import React, { useState } from 'react';
import {
  Briefcase,
  Building2,
  UserCheck,
  Search,
  Menu,
  X,
  LogOut,
  ShieldCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { PortalSettings, CompanyUser, Company } from '../types';

interface HeaderProps {
  settings?: PortalSettings;
  activeTab: 'home' | 'vagas' | 'banco-de-talentos' | 'empresa' | 'master';
  setActiveTab: (tab: 'home' | 'vagas' | 'banco-de-talentos' | 'empresa' | 'master') => void;
  currentUser: CompanyUser | null;
  currentCompany: Company | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  activeTab,
  setActiveTab,
  currentUser,
  currentCompany,
  onLogout
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const portalName = settings?.portalName || 'RL RH Connect';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => setActiveTab('home')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold text-slate-900 tracking-tight block">
                {portalName}
              </span>
              <span className="text-xs font-medium text-blue-600 tracking-wide uppercase block -mt-1">
                Portal de Vagas
              </span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'home'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Início
            </button>
            <button
              onClick={() => setActiveTab('vagas')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'vagas'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Vagas
            </button>
            <button
              onClick={() => setActiveTab('banco-de-talentos')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'banco-de-talentos'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Banco de Talentos
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {currentUser ? (
              <div className="flex items-center space-x-3 bg-slate-50 p-1.5 pl-3 rounded-xl border border-slate-200">
                <div className="text-right">
                  <p className="text-xs font-semibold text-slate-900 leading-tight">
                    {currentUser.name}
                  </p>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    {currentUser.role === 'master'
                      ? 'ADMIN MASTER'
                      : currentCompany?.tradeName || currentCompany?.name || 'Empresa'}
                  </p>
                </div>
                <button
                  onClick={() =>
                    setActiveTab(currentUser.role === 'master' ? 'master' : 'empresa')
                  }
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs"
                >
                  Painel RH
                </button>
                <button
                  onClick={onLogout}
                  title="Sair"
                  className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-slate-200/50"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActiveTab('empresa')}
                  className="px-4 py-2 bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-800 hover:to-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all flex items-center space-x-2"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Sou uma empresa</span>
                </button>
                <button
                  onClick={() => setActiveTab('empresa')}
                  className="px-3 py-2 text-slate-600 hover:text-slate-900 text-sm font-medium hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Entrar
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('empresa')}
              className="px-2.5 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg flex items-center space-x-1"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Empresa</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-hidden"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          <button
            onClick={() => {
              setActiveTab('home');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
              activeTab === 'home' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700'
            }`}
          >
            Início
          </button>
          <button
            onClick={() => {
              setActiveTab('vagas');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
              activeTab === 'vagas' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700'
            }`}
          >
            Vagas
          </button>
          <button
            onClick={() => {
              setActiveTab('banco-de-talentos');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
              activeTab === 'banco-de-talentos' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700'
            }`}
          >
            Banco de Talentos
          </button>
          <button
            onClick={() => {
              setActiveTab('empresa');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm font-semibold text-blue-700 bg-blue-50 rounded-lg flex items-center justify-between"
          >
            <span>Acesso Empresarial (RH)</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </header>
  );
};

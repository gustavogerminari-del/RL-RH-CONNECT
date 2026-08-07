import React, { useState } from 'react';
import {
  Briefcase,
  Phone,
  Mail,
  Linkedin,
  Facebook,
  Instagram,
  ShieldCheck,
  FileText,
  X
} from 'lucide-react';
import { PortalSettings } from '../types';

interface FooterProps {
  settings?: PortalSettings;
}

export const Footer: React.FC<FooterProps> = ({ settings }) => {
  const [modalType, setModalType] = useState<'privacy' | 'terms' | null>(null);

  const year = new Date().getFullYear();
  const footerText =
    settings?.footerText || `© ${year} RL RH Connect. Todos os direitos reservados.`;

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          {/* Col 1 - Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                {settings?.portalName || 'RL RH Connect'}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Plataforma completa de Recrutamento & Seleção integrando candidaturas rápidas, gestão de vagas multiempresa e inteligência para contratações.
            </p>
            <div className="flex items-center space-x-3 pt-1">
              {settings?.linkedinUrl && (
                <a
                  href={settings.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {settings?.facebookUrl && (
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {settings?.instagramUrl && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-pink-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Col 2 - Quick links */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Navegação
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <a href="#vagas" className="hover:text-blue-400 transition-colors">
                  Vagas Abertas
                </a>
              </li>
              <li>
                <a href="#banco-de-talentos" className="hover:text-blue-400 transition-colors">
                  Cadastrar no Banco de Talentos
                </a>
              </li>
              <li>
                <a href="#empresa" className="hover:text-blue-400 transition-colors">
                  Portal da Empresa
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3 - Legal */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Privacidade & LGPD
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => setModalType('privacy')}
                  className="hover:text-blue-400 transition-colors flex items-center space-x-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span>Política de Privacidade</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setModalType('terms')}
                  className="hover:text-blue-400 transition-colors flex items-center space-x-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  <span>Termos de Uso</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4 - Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Atendimento
            </h4>
            <div className="space-y-3 text-xs text-slate-400">
              {settings?.whatsappContact && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>{settings.whatsappContact}</span>
                </div>
              )}
              {settings?.emailContact && (
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-blue-400" />
                  <span>{settings.emailContact}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-8 text-center text-xs text-slate-500">
          <p>{footerText}</p>
        </div>
      </div>

      {/* Modal Privacy / Terms */}
      {modalType && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setModalType(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <span>
                {modalType === 'privacy'
                  ? 'Política de Privacidade & LGPD'
                  : 'Termos e Condições de Uso'}
              </span>
            </h3>

            <div className="text-xs text-slate-600 leading-relaxed whitespace-pre-line space-y-3 border-t border-slate-100 pt-4">
              {modalType === 'privacy'
                ? settings?.privacyPolicyText ||
                  'O RL RH Connect garante o tratamento seguro dos seus dados pessoais em total conformidade com a LGPD.'
                : settings?.termsOfUseText ||
                  'Ao se candidatar às vagas, você declara a veracidade de todas as informações fornecidas.'}
            </div>

            <div className="mt-6 text-right">
              <button
                onClick={() => setModalType(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors"
              >
                Entendi e Concordo
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

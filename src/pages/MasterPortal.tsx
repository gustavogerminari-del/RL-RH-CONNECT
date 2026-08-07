import React, { useState } from 'react';
import {
  ShieldCheck,
  Globe,
  Settings,
  Save,
  CheckCircle2,
  Phone,
  Mail,
  Linkedin,
  Facebook,
  Instagram,
  FileText,
  Sparkles
} from 'lucide-react';
import { PortalSettings } from '../types';

interface MasterPortalProps {
  settings?: PortalSettings;
  onSaveSettings: (settings: PortalSettings) => void;
}

export const MasterPortal: React.FC<MasterPortalProps> = ({ settings, onSaveSettings }) => {
  const [form, setForm] = useState<PortalSettings>(
    settings || {
      portalName: 'RL RH Connect',
      bannerTitle: 'Conectando talentos às melhores oportunidades',
      bannerSubtitle: 'Encontre a oportunidade ideal para sua carreira.',
      primaryColor: '#1e40af',
      secondaryColor: '#0d9488',
      logoUrl: '',
      bgImageUrl: '',
      featuredJobIds: ['job-101'],
      footerText: '© 2026 RL RH Connect. Todos os direitos reservados.',
      whatsappContact: '(11) 98765-4321',
      emailContact: 'contato@rlrhconnect.com.br',
      linkedinUrl: 'https://linkedin.com/company/rlrhconnect',
      facebookUrl: 'https://facebook.com/rlrhconnect',
      instagramUrl: 'https://instagram.com/rlrhconnect',
      privacyPolicyText: 'Política de privacidade referente à LGPD...',
      termsOfUseText: 'Termos de uso do portal...',
      seoTitle: 'RL RH Connect - Portal de Vagas',
      seoDescription: 'Portal completo de empregos e recrutamento'
    }
  );

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6 text-xs text-slate-900">
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 shadow-md flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-amber-300" />
            <h2 className="text-xl font-bold">MASTER → Configuração do Portal de Vagas</h2>
          </div>
          <p className="text-blue-200">
            Personalize a identidade visual, SEO, dados de contato e políticas globais do RL RH Connect.
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Configurações do Portal atualizadas com sucesso e salvas no sistema!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identidade e Banner */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold border-b pb-2 text-slate-900">
            1. Identidade & Banner Principal
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Nome do Portal</label>
              <input
                type="text"
                value={form.portalName}
                onChange={e => setForm(prev => ({ ...prev, portalName: e.target.value }))}
                className="w-full p-2.5 bg-slate-50 border rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">URL da Logo</label>
              <input
                type="text"
                placeholder="https://..."
                value={form.logoUrl || ''}
                onChange={e => setForm(prev => ({ ...prev, logoUrl: e.target.value }))}
                className="w-full p-2.5 bg-slate-50 border rounded-xl"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold mb-1">Título do Banner Principal</label>
              <input
                type="text"
                value={form.bannerTitle}
                onChange={e => setForm(prev => ({ ...prev, bannerTitle: e.target.value }))}
                className="w-full p-2.5 bg-slate-50 border rounded-xl"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold mb-1">Subtítulo do Banner</label>
              <textarea
                rows={2}
                value={form.bannerSubtitle}
                onChange={e => setForm(prev => ({ ...prev, bannerSubtitle: e.target.value }))}
                className="w-full p-2.5 bg-slate-50 border rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Contato e Redes Sociais */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold border-b pb-2 text-slate-900">
            2. Canais de Contato & Redes Sociais
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">WhatsApp de Suporte</label>
              <input
                type="text"
                value={form.whatsappContact}
                onChange={e => setForm(prev => ({ ...prev, whatsappContact: e.target.value }))}
                className="w-full p-2.5 bg-slate-50 border rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">E-mail de Atendimento</label>
              <input
                type="email"
                value={form.emailContact}
                onChange={e => setForm(prev => ({ ...prev, emailContact: e.target.value }))}
                className="w-full p-2.5 bg-slate-50 border rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">LinkedIn URL</label>
              <input
                type="text"
                value={form.linkedinUrl || ''}
                onChange={e => setForm(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                className="w-full p-2.5 bg-slate-50 border rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Instagram URL</label>
              <input
                type="text"
                value={form.instagramUrl || ''}
                onChange={e => setForm(prev => ({ ...prev, instagramUrl: e.target.value }))}
                className="w-full p-2.5 bg-slate-50 border rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Políticas LGPD e SEO */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold border-b pb-2 text-slate-900">
            3. Política de Privacidade, Termos e SEO
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block font-semibold mb-1">Texto da Política de Privacidade (LGPD)</label>
              <textarea
                rows={3}
                value={form.privacyPolicyText}
                onChange={e => setForm(prev => ({ ...prev, privacyPolicyText: e.target.value }))}
                className="w-full p-2.5 bg-slate-50 border rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Texto dos Termos de Uso</label>
              <textarea
                rows={3}
                value={form.termsOfUseText}
                onChange={e => setForm(prev => ({ ...prev, termsOfUseText: e.target.value }))}
                className="w-full p-2.5 bg-slate-50 border rounded-xl"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-colors flex items-center space-x-2 text-xs"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Alterações Master</span>
          </button>
        </div>
      </form>
    </div>
  );
};

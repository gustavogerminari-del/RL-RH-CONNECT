import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { PublicPortal } from './pages/PublicPortal';
import { CompanyPortal } from './pages/CompanyPortal';
import { MasterPortal } from './pages/MasterPortal';
import { PortalSettings, CompanyUser, Company } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'home' | 'vagas' | 'banco-de-talentos' | 'empresa' | 'master'
  >('home');

  const [settings, setSettings] = useState<PortalSettings | undefined>(undefined);
  const [metrics, setMetrics] = useState<
    { availableJobsCount: number; hiringCompaniesCount: number } | undefined
  >(undefined);

  const [currentUser, setCurrentUser] = useState<CompanyUser | null>(null);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);

  // Check URL path e.g. /vagas or /empresa/login
  const [urlJobId, setUrlJobId] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/public/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.settings) setSettings(data.settings);
        if (data.metrics) setMetrics(data.metrics);
      }
    } catch (e) {
      console.error('Error fetching settings:', e);
    }
  };

  useEffect(() => {
    fetchSettings();

    // Auto login demo user
    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'rh@logisticabrasil.com.br' })
    })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setCurrentUser(data.user);
          setCurrentCompany(data.company || null);
        }
      })
      .catch(e => console.error('Error auto-logging in:', e));

    // Simple path routing checker
    const path = window.location.pathname;
    if (path.startsWith('/vagas/')) {
      const id = path.split('/vagas/')[1]?.split('/')[0];
      if (id) {
        setUrlJobId(id);
        setActiveTab('vagas');
      }
    } else if (path === '/empresa/login' || path === '/empresa') {
      setActiveTab('empresa');
    } else if (path === '/banco-de-talentos') {
      setActiveTab('banco-de-talentos');
    }
  }, []);

  const handleLogin = (user: CompanyUser, company: Company | null) => {
    setCurrentUser(user);
    setCurrentCompany(company);
    if (user.role === 'master') {
      setActiveTab('master');
    } else {
      setActiveTab('empresa');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentCompany(null);
    setActiveTab('home');
  };

  const handleSaveMasterSettings = async (newSettings: PortalSettings) => {
    try {
      const res = await fetch('/api/master/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: newSettings })
      });
      if (res.ok) {
        fetchSettings();
      }
    } catch (e) {
      console.error('Error saving master settings:', e);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
      <Header
        settings={settings}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        currentCompany={currentCompany}
        onLogout={handleLogout}
      />

      <main className="flex-1">
        {(activeTab === 'home' || activeTab === 'vagas' || activeTab === 'banco-de-talentos') && (
          <PublicPortal
            settings={settings}
            metrics={metrics}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            selectedJobId={urlJobId}
          />
        )}

        {activeTab === 'empresa' && (
          <CompanyPortal
            currentUser={currentUser}
            currentCompany={currentCompany}
            onLogin={handleLogin}
            onLogout={handleLogout}
          />
        )}

        {activeTab === 'master' && (
          <MasterPortal settings={settings} onSaveSettings={handleSaveMasterSettings} />
        )}
      </main>

      <Footer settings={settings} />
    </div>
  );
};

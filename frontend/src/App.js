import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import './App.css';
import './i18n/i18n';
import { useTranslation } from 'react-i18next';
import Dashboard from './pages/Dashboard';
import VillageMap from './pages/VillageMap';
import Alerts from './pages/Alerts';
import { AlertProvider } from './contexts/AlertContext';
import { VoiceProvider } from './contexts/VoiceContext';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Language selector component
const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'kn', name: 'ಕನ್ನಡ', flag: '🇮🇳' },
    { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
    { code: 'ml', name: 'മലയാളം', flag: '🇮🇳' }
  ];

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    setCurrentLanguage(langCode);
  };

  return (
    <div className="relative">
      <select 
        value={currentLanguage}
        onChange={(e) => changeLanguage(e.target.value)}
        className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};

// Navigation component
const Navigation = () => {
  const { t } = useTranslation();
  
  return (
    <nav className="bg-gradient-to-r from-green-600 to-green-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl mr-2">🏛️</span>
              <h1 className="text-white text-xl font-bold">{t('Digital Sarpanch')}</h1>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-green-700 text-white'
                        : 'text-green-100 hover:bg-green-700 hover:text-white'
                    }`
                  }
                >
                  {t('Dashboard')}
                </NavLink>
                <NavLink
                  to="/map"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-green-700 text-white'
                        : 'text-green-100 hover:bg-green-700 hover:text-white'
                    }`
                  }
                >
                  {t('Village Map')}
                </NavLink>
                <NavLink
                  to="/alerts"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-green-700 text-white'
                        : 'text-green-100 hover:bg-green-700 hover:text-white'
                    }`
                  }
                >
                  {t('Alerts')}
                </NavLink>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <LanguageSelector />
          </div>
        </div>
      </div>
    </nav>
  );
};

// Main App component
function App() {
  const { t } = useTranslation();

  return (
    <ErrorBoundary>
      <AlertProvider>
        <VoiceProvider>
          <div className="App min-h-screen bg-gray-50">
            <BrowserRouter>
              <Navigation />
              <main className="flex-1">
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/map" element={<VillageMap />} />
                    <Route path="/alerts" element={<Alerts />} />
                  </Routes>
                </Suspense>
              </main>
            </BrowserRouter>
          </div>
        </VoiceProvider>
      </AlertProvider>
    </ErrorBoundary>
  );
}

export default App;
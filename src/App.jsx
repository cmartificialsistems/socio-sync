import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Header } from './components/Header';
import { MeetingScheduler } from './components/MeetingScheduler';
import { AgendaTopics } from './components/AgendaTopics';
import { ActionItems } from './components/ActionItems';
import { IdeasBoard } from './components/IdeasBoard';
import { SettingsView } from './components/SettingsView';

function AppContent() {
  const [activeTab, setActiveTab] = useState('reuniones');

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {activeTab === 'reuniones' && (
          <div className="space-y-6">
            <MeetingScheduler />
            <AgendaTopics />
          </div>
        )}

        {activeTab === 'tareas' && (
          <ActionItems />
        )}

        {activeTab === 'ideas' && (
          <IdeasBoard />
        )}

        {activeTab === 'ajustes' && (
          <SettingsView />
        )}
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <p>SocioSync • Plataforma de Agendamiento, Minutas y Colaboración entre Socios</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

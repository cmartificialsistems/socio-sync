import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { MeetingScheduler } from './components/MeetingScheduler';
import { AgendaTopics } from './components/AgendaTopics';
import { ActionItems } from './components/ActionItems';
import { IdeasBoard } from './components/IdeasBoard';
import { SettingsView } from './components/SettingsView';
import { GatewayLogin } from './components/GatewayLogin';

function AppContent() {
  const [activeTab, setActiveTab] = useState('reuniones');
  const { isLocked } = useApp();

  if (isLocked) {
    return <GatewayLogin />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F2EB] text-[#1C1B1A]">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
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

      <footer className="border-t border-[#E6E0D4] bg-[#FAF8F5] py-4 text-center text-xs text-[#6E685F]">
        <p>SocioSync • Plataforma Privada de Agendamiento, Minutas y Colaboración entre Socios</p>
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

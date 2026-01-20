
import React, { useState, useEffect, useCallback } from 'react';
import { ChronoDB } from '../backend/ChronoDB';
import { Snapshot } from '../backend/types';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { CollectionsTab } from '../components/dashboard/CollectionsTab';
import { LogTab } from '../components/dashboard/LogTab';
import { SnapshotsTab } from '../components/dashboard/SnapshotsTab';
import { CliTab } from '../components/dashboard/CliTab';
import { DocsTab } from '../components/dashboard/DocsTab';
import { Database } from 'lucide-react';
// import { useNavigate } from 'react-router-dom'; // Removed due to missing export error

interface Props {
  db: ChronoDB;
}

export const DashboardPage: React.FC<Props> = ({ db }) => {
  // Use native hash routing instead of react-router-dom useNavigate
  const navigate = (to: string) => {
    window.location.hash = to.startsWith('/') ? '#' + to : '#' + (to.startsWith('#') ? to.slice(1) : to);
  };

  const [activeCollection, setActiveCollection] = useState<string>('users');
  const [state, setState] = useState<any>(null);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [activeTab, setActiveTab] = useState<'collections' | 'log' | 'snapshots' | 'cli' | 'docs'>('collections');
  const [notification, setNotification] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setState(db.getInternalState());
    setSnapshots(db.snapshots.list());
  }, [db]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  if (!state) return null;

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-6 bg-[#080B14] text-slate-300">
      {notification && (
        <div className="fixed top-6 right-6 bg-emerald-600 text-white px-5 py-3 rounded-lg shadow-2xl z-50 flex items-center gap-3 border border-emerald-400/30 animate-in fade-in slide-in-from-top-4 duration-300">
          <Database className="w-4 h-4" /> {notification}
        </div>
      )}

      <Header 
        user={state.user} 
        version={state.version} 
        onConnectCloud={() => navigate('/auth?mode=login')} 
        onSignUp={() => navigate('/auth?mode=signup')}
        onLogout={() => { db.cli.login.logout(); refresh(); }}
      />

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          activeCollection={activeCollection} 
          setActiveCollection={setActiveCollection}
          collectionNames={state.collectionNames}
          stats={state.stats}
          onCreateCollection={(name) => {
            db.col(name);
            setActiveCollection(name);
            refresh();
          }}
        />

        <div className="lg:col-span-9 flex flex-col bg-slate-900/10 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl backdrop-blur-sm">
          {activeTab === 'collections' && (
            <CollectionsTab 
              db={db}
              activeCollection={activeCollection}
              entries={state.indexEntries.filter((e: any) => e.collectionName === activeCollection)}
              onRefresh={refresh}
              showNotification={showNotification}
            />
          )}
          {activeTab === 'log' && <LogTab rawLog={state.rawLog} />}
          {activeTab === 'snapshots' && (
            <SnapshotsTab 
              snapshots={snapshots}
              onRestore={(id) => {
                db.restoreToSnapshot(id);
                refresh();
                showNotification(`Restored to ${id}`);
              }}
              onCreate={async () => {
                const snap = await db.triggerSnapshot('manual');
                if (snap) {
                  refresh();
                  showNotification('Manual Snapshot Captured');
                } else {
                  showNotification('No data changes to capture');
                }
              }}
            />
          )}
          {activeTab === 'cli' && (
            <CliTab 
              db={db} 
              onRefresh={refresh}
              onLoginRequested={() => navigate('/auth?mode=login')}
            />
          )}
          {activeTab === 'docs' && <DocsTab />}
        </div>
      </main>

      <footer className="mt-8 pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-6 text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">
        <div className="flex items-center gap-8 font-mono">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]"></div>
            <span>RUNTIME: VIRTUAL_VFS</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${state.user?.isLoggedIn ? 'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.5)]' : 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]'}`}></div>
            <span>SYNC: {state.user?.isLoggedIn ? 'ACTIVE_SESSION' : 'LOCAL_OFFLINE'}</span>
          </div>
        </div>
        <div className="text-slate-700">ChronoDB v1.2.0 • Build ID: FB-902</div>
      </footer>
    </div>
  );
};

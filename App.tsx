
import React, { useState, useEffect } from 'react';
import { ChronoDB } from './backend/src/index';
import { DashboardPage } from './pages/DashboardPage';
import { AuthPage } from './pages/AuthPage';
import { RefreshCw } from 'lucide-react';

const App: React.FC = () => {
  const [db, setDb] = useState<ChronoDB | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [currentHash, setCurrentHash] = useState(window.location.hash || '#/');

  useEffect(() => {
    // Initialize the ChronoDB instance using the new consolidated package structure
    ChronoDB.open({ snapshots: { interval: 60000 } }).then(instance => {
      setDb(instance);
      setIsReady(true);
    });

    const handleHashChange = () => {
      setCurrentHash(window.location.hash || '#/');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (!isReady || !db) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#080B14] text-slate-500 font-mono">
        <RefreshCw className="w-5 h-5 animate-spin mr-3" />
        INITIALIZING_CHRONODB_RUNTIME...
      </div>
    );
  }

  const path = currentHash.split('?')[0];
  
  if (path === '#/auth') {
    return <AuthPage db={db} />;
  }

  return <DashboardPage db={db} />;
};

export default App;

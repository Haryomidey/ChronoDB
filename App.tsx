import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ChronoDB } from './backend/ChronoDB';
import { DashboardPage } from './pages/DashboardPage';
import { AuthPage } from './pages/AuthPage';
import { RefreshCw } from 'lucide-react';
import Test from './pages/Test';

const App: React.FC = () => {
  const [db, setDb] = useState<ChronoDB | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    ChronoDB.open({ snapshots: { interval: 60000 } }).then(instance => {
      setDb(instance);
      setIsReady(true);
    });
  }, []);

  if (!isReady || !db) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#080B14] text-slate-500 font-mono">
        <RefreshCw className="w-5 h-5 animate-spin mr-3" />
        INITIALIZING_CHRONODB_RUNTIME...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/test" element={<Test />} />
        <Route path="/" element={<DashboardPage db={db} />} />
        <Route path="/auth" element={<AuthPage db={db} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
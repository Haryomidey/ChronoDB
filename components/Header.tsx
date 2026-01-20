
import React from 'react';
import { Database, Cloud, CloudOff, User, LogOut } from 'lucide-react';
import { CloudUser } from '../backend/types';

interface Props {
  user: CloudUser | null;
  version: number;
  onConnectCloud: () => void;
  onSignUp: () => void;
  onLogout: () => void;
}

export const Header: React.FC<Props> = ({ user, version, onConnectCloud, onSignUp, onLogout }) => {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-slate-800 pb-8">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
          <Database className="w-8 h-8 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tighter uppercase">ChronoDB <span className="text-slate-600 font-light">1.2</span></h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-black uppercase tracking-widest border border-slate-700">CORE_VFS</span>
            {user?.isLoggedIn ? (
              <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-black uppercase flex items-center gap-1 border border-emerald-500/20">
                <Cloud className="w-2.5 h-2.5" /> CLOUD_CONNECTED
              </span>
            ) : (
              <button onClick={onConnectCloud} className="text-[9px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded font-black uppercase flex items-center gap-1 border border-amber-500/20 hover:bg-amber-500/20 transition-all">
                <CloudOff className="w-2.5 h-2.5" /> SYNC_DISABLED
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-end">
          <span className="text-[9px] text-slate-600 font-black uppercase tracking-[0.2em]">DB_VERSION</span>
          <span className="text-2xl font-mono text-emerald-400 leading-none">#{version}</span>
        </div>
        <div className="h-8 w-px bg-slate-800"></div>
        {user?.isLoggedIn ? (
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-slate-600 font-black uppercase tracking-[0.2em]">USER_SESSION</span>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-blue-400 flex items-center gap-2">
                <User className="w-3.5 h-3.5" /> {user.email}
              </span>
              <button onClick={onLogout} className="p-1.5 hover:text-rose-400 bg-slate-800/50 rounded-lg transition-colors"><LogOut className="w-4 h-4" /></button>
            </div>
          </div>
        ) : (
          <button onClick={onSignUp} className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[10px] font-black tracking-widest border border-slate-700 transition-all">PROVISION_LINK</button>
        )}
      </div>
    </header>
  );
};

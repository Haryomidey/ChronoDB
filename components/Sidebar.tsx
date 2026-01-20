
import React from 'react';
import { Layers, FileText, Clock, Terminal, BookOpen, ChevronRight, Plus } from 'lucide-react';

interface Props {
  activeTab: string;
  setActiveTab: (t: any) => void;
  activeCollection: string;
  setActiveCollection: (c: string) => void;
  collectionNames: string[];
  stats: Record<string, number>;
  onCreateCollection: (name: string) => void;
}

export const Sidebar: React.FC<Props> = ({ 
  activeTab, setActiveTab, activeCollection, setActiveCollection, collectionNames, stats, onCreateCollection 
}) => {
  const navItems = [
    { id: 'collections', icon: Layers, label: 'Collections' },
    { id: 'log', icon: FileText, label: 'Data Log' },
    { id: 'snapshots', icon: Clock, label: 'Snapshots' },
    { id: 'cli', icon: Terminal, label: 'CLI Console' },
    { id: 'docs', icon: BookOpen, label: 'Dev Guide' }
  ];

  return (
    <div className="lg:col-span-3 space-y-6">
      <nav className="flex flex-col gap-1.5">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all text-[11px] font-black uppercase tracking-widest ${
              activeTab === item.id 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-900/10' 
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
            }`}
          >
            <item.icon className="w-4 h-4" /> {item.label}
          </button>
        ))}
      </nav>

      {activeTab === 'collections' && (
        <div className="bg-slate-900/20 rounded-[1.5rem] border border-slate-800 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Index</h3>
            <button onClick={() => {
              const n = prompt("New Collection Name:");
              if(n) onCreateCollection(n);
            }} className="p-1.5 hover:text-emerald-400 bg-slate-800/50 rounded-lg transition-colors"><Plus className="w-4 h-4" /></button>
          </div>
          <div className="space-y-2">
            {collectionNames.map(c => (
              <button
                key={c}
                onClick={() => setActiveCollection(c)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs transition-all ${
                  activeCollection === c ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${activeCollection === c ? 'rotate-90 text-emerald-400' : ''}`} />
                  {c}
                </div>
                <span className="text-[9px] font-mono text-slate-600 bg-black/40 px-1.5 py-0.5 rounded">{stats[c] || 0}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

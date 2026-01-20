
import React from 'react';
import { History, Clock, RefreshCw } from 'lucide-react';
// Import from backend source to ensure type consistency
import { Snapshot } from '../../backend/src/types';

interface Props {
  snapshots: Snapshot[];
  onRestore: (id: string) => void;
  onCreate: () => void;
}

export const SnapshotsTab: React.FC<Props> = ({ snapshots, onRestore, onCreate }) => {
  return (
    <div className="flex-1 p-10 space-y-10 overflow-auto custom-scrollbar">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-4 tracking-tighter uppercase">
            <History className="w-8 h-8 text-purple-500" /> State_History
          </h2>
          <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-[0.3em] font-bold">Immutable Logical Snapshots</p>
        </div>
        <button onClick={onCreate} className="bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-black px-8 py-4 rounded-2xl transition-all shadow-xl shadow-purple-900/20 tracking-widest uppercase">
          CAPTURE_INSTANCE
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {snapshots.length === 0 ? (
          <div className="col-span-full py-32 text-center text-slate-700 border-2 border-dashed border-slate-800 rounded-[2.5rem] uppercase font-bold tracking-[0.4em] text-xs">No_Stored_Markers</div>
        ) : snapshots.slice().reverse().map(s => (
          <div key={s.snapshot_id} className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-8 flex flex-col gap-6 group hover:border-purple-500/40 transition-all relative overflow-hidden">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-black/40 border border-slate-800 text-slate-600 group-hover:text-purple-400 transition-colors">
                <Clock className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-black text-white text-base tracking-tight">{s.snapshot_id}</span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-500 uppercase font-black tracking-widest border border-slate-700">{s.reason}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 font-mono tracking-widest uppercase">Target_Version::{s.version}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-2 pt-6 border-t border-slate-800/50">
              <span className="text-[10px] text-slate-600 font-bold font-mono">{new Date(s.timestamp).toLocaleString()}</span>
              <button onClick={() => onRestore(s.snapshot_id)} className="flex items-center gap-2 bg-slate-800 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl transition-all text-[10px] font-black tracking-widest">
                <RefreshCw className="w-3.5 h-3.5" /> ROLLBACK
              </button>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500/5 blur-[50px] rounded-full"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

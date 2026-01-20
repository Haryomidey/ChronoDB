
import React from 'react';
import { FileText } from 'lucide-react';

export const LogTab: React.FC<{ rawLog: string }> = ({ rawLog }) => {
  return (
    <div className="flex-1 flex flex-col p-8 overflow-hidden">
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3">
          <FileText className="w-4 h-4 text-blue-400" /> Physical_Log::data.log
        </h2>
        <span className="text-[9px] bg-slate-800 text-slate-500 px-3 py-1 rounded-full uppercase font-bold tracking-widest">Read_Only</span>
      </div>
      <div className="flex-1 overflow-auto rounded-[2rem] border border-slate-800 bg-black/40 p-8 font-mono text-[11px] leading-relaxed custom-scrollbar shadow-inner">
        {rawLog ? rawLog.split('\n').filter(l => l).map((line, i) => {
          const p = JSON.parse(line);
          return (
            <div key={i} className="flex items-center hover:bg-white/5 py-1.5 px-4 rounded-xl transition-colors group">
              <span className="text-slate-800 w-10 select-none opacity-40 group-hover:opacity-100">0x{i.toString(16).toUpperCase().padStart(2, '0')}</span>
              <span className={`w-20 text-[9px] font-black mr-6 text-center rounded px-2 py-0.5 border ${
                p.op === 'insert' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' : 
                p.op === 'update' ? 'text-blue-500 border-blue-500/20 bg-blue-500/5' : 
                'text-rose-500 border-rose-500/20 bg-rose-500/5'
              }`}>{p.op.toUpperCase()}</span>
              <span className="text-slate-500 w-24 truncate mr-6 italic">{p.collection}</span>
              <span className="text-slate-400 truncate mr-6 font-bold">{p.id}</span>
              <span className="ml-auto text-slate-700 font-bold tracking-widest">VERSION::{p.version}</span>
            </div>
          );
        }) : <div className="text-slate-600 italic h-64 flex items-center justify-center font-mono opacity-50 uppercase tracking-[0.4em]">Log_Buffer_Empty</div>}
      </div>
    </div>
  );
};

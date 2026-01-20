
import React from 'react';
import { FileText } from 'lucide-react';

export const LogTab: React.FC<{ rawLog: string }> = ({ rawLog }) => {
    return (
        <div className="flex-1 flex flex-col p-8 overflow-hidden">
            <h2 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 mb-8">
                <FileText className="w-4 h-4" /> Storage Log
            </h2>
            <div className="flex-1 overflow-auto rounded-2xl border border-slate-800 bg-black/40 p-6 font-mono text-[11px] leading-7">
                {rawLog ? rawLog.split('\n').filter(l => l).map((line, i) => {
                    const p = JSON.parse(line);
                    return (
                        <div key={i} className="flex items-center hover:bg-white/5 px-2 py-0.5 rounded transition-colors">
                            <span className="text-slate-800 w-8 select-none">{i+1}</span>
                            <span className={`w-16 text-[9px] font-black mr-4 text-center rounded ${p.op === 'insert' ? 'text-emerald-500' : p.op === 'update' ? 'text-blue-500' : 'text-rose-500'}`}>{p.op}</span>
                            <span className="text-slate-600 w-20 truncate mr-4">{p.collection}</span>
                            <span className="text-slate-400 truncate mr-4">{p.id}</span>
                            <span className="ml-auto text-slate-700">V#{p.version}</span>
                        </div>
                    );
                }) : <div className="text-slate-600 italic">Log is empty</div>}
            </div>
        </div>
    );
};

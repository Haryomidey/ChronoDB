
import React from 'react';
import { History, Clock, RefreshCw } from 'lucide-react';
import { Snapshot } from '../backend/types';

interface Props {
    snapshots: Snapshot[];
    onRestore: (id: string) => void;
    onCreate: () => void;
}

export const SnapshotsTab: React.FC<Props> = ({ snapshots, onRestore, onCreate }) => {
    return (
        <div className="flex-1 p-8 space-y-8 overflow-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                        <History className="w-6 h-6 text-purple-400" /> Snapshots
                    </h2>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">Versioned State History</p>
                </div>
                <button onClick={onCreate} className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-6 py-3 rounded-2xl transition-all">
                    MANUAL SNAPSHOT
                </button>
            </div>
            <div className="space-y-4">
                {snapshots.length === 0 ? (
                    <div className="py-20 text-center text-slate-700 border-2 border-dashed border-slate-800 rounded-3xl">No snapshots</div>
                ) : snapshots.slice().reverse().map(s => (
                    <div key={s.snapshot_id} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex items-center justify-between group hover:border-purple-500/30 transition-all">
                        <div className="flex items-center gap-6">
                            <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-black/40 border border-slate-800"><Clock className="w-6 h-6 text-slate-600" /></div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-white">{s.snapshot_id}</span>
                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">{s.reason}</span>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">Version #{s.version} • {new Date(s.timestamp).toLocaleString()}</p>
                            </div>
                        </div>
                        <button onClick={() => onRestore(s.snapshot_id)} className="flex items-center gap-2 bg-slate-800 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl transition-all text-xs font-bold">
                            <RefreshCw className="w-3 h-3" /> RESTORE
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

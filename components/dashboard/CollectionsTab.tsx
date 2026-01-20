
import React, { useState } from 'react';
import { ChronoDB } from '../../server';
// Added Database icon to the imports from lucide-react
import { Layers, Edit2, Trash2, Plus, ArrowRight, Database } from 'lucide-react';

interface Props {
  db: ChronoDB;
  activeCollection: string;
  entries: any[];
  onRefresh: () => void;
  showNotification: (msg: string) => void;
}

export const CollectionsTab: React.FC<Props> = ({ db, activeCollection, entries, onRefresh, showNotification }) => {
  const [docId, setDocId] = useState('');
  const [docBody, setDocBody] = useState('{\n  "name": "New Record",\n  "active": true\n}');
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async () => {
    try {
      const data = JSON.parse(docBody);
      if (isEditing) {
        await db.col(activeCollection).update(docId, data);
        showNotification(`Sync record ${docId}`);
      } else {
        if (docId) data._id = docId;
        await db.col(activeCollection).add(data);
        showNotification(`Append record to ${activeCollection}`);
      }
      onRefresh();
      setDocId('');
      setDocBody('{\n  "name": "",\n  "active": true\n}');
      setIsEditing(false);
    } catch (e) {
      showNotification('Parse Error: Invalid JSON');
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-8 py-5 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span className="text-emerald-400 font-mono text-xs tracking-widest uppercase">db.collection("{activeCollection}")</span>
        </div>
      </div>
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-5 divide-x divide-slate-800 overflow-hidden">
        <div className="xl:col-span-3 p-8 space-y-6 overflow-auto custom-scrollbar">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 opacity-20 text-center">
              <Database className="w-16 h-16 mb-4" />
              <p className="text-xs uppercase tracking-[0.3em]">No Document Fragments</p>
            </div>
          ) : entries.map(e => (
            <div key={e.id} className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 group hover:border-emerald-500/30 transition-all relative overflow-hidden">
              <div className="flex items-center justify-between mb-5 relative z-10">
                <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-400/10 px-3 py-1.5 rounded-full border border-blue-400/20">FRAGMENT::{e.id}</span>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setDocId(e.id); setDocBody(JSON.stringify(e.record.data, null, 2)); setIsEditing(true); }} className="p-2 bg-slate-800 rounded-xl hover:text-emerald-400 transition-colors"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={async () => { await db.col(activeCollection).remove(e.id); onRefresh(); showNotification("Tombstone appended"); }} className="p-2 bg-slate-800 rounded-xl hover:text-rose-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <pre className="text-[12px] font-mono text-slate-300 bg-black/50 p-6 rounded-2xl overflow-x-auto border border-slate-800/50 relative z-10">
                {JSON.stringify(e.record.data, null, 2)}
              </pre>
              <div className="mt-5 flex justify-between text-[10px] text-slate-600 border-t border-slate-800/50 pt-4 font-mono tracking-widest relative z-10">
                <span>V#{e.record.version}</span>
                <span>{new Date(e.record.timestamp).toLocaleTimeString()}</span>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[60px] rounded-full"></div>
            </div>
          ))}
        </div>
        <div className="xl:col-span-2 p-8 bg-slate-900/20 overflow-auto">
          <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3 mb-8">
            {isEditing ? <Edit2 className="w-4 h-4 text-blue-400" /> : <Plus className="w-4 h-4 text-emerald-400" />} 
            {isEditing ? 'Sync_Update' : 'Commit_Append'}
          </h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-700 uppercase tracking-widest ml-1">Document_UID</label>
              <input 
                value={docId} readOnly={isEditing} onChange={e => setDocId(e.target.value)}
                placeholder="Auto_ID"
                className={`w-full bg-black/40 border border-slate-800 rounded-2xl p-4 text-emerald-400 outline-none text-xs font-mono transition-all ${isEditing ? 'opacity-40 grayscale' : 'focus:border-emerald-500/40'}`}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-700 uppercase tracking-widest ml-1">Payload_JSON</label>
              <textarea 
                value={docBody} onChange={e => setDocBody(e.target.value)}
                className="w-full bg-black/40 border border-slate-800 rounded-2xl p-5 font-mono text-xs h-96 outline-none focus:border-blue-500/40 transition-all resize-none"
              />
            </div>
            <div className="flex gap-4 pt-4">
              <button onClick={handleSave} className={`flex-1 py-4 rounded-2xl font-black text-[11px] tracking-[0.2em] text-white transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 ${isEditing ? 'bg-blue-600 shadow-blue-900/20' : 'bg-emerald-600 shadow-emerald-900/20'}`}>
                {isEditing ? 'COMMIT_CHANGE' : 'COMMIT_APPEND'} <ArrowRight className="w-4 h-4" />
              </button>
              {isEditing && (
                <button onClick={() => { setDocId(''); setDocBody(''); setIsEditing(false); }} className="px-6 bg-slate-800 text-slate-400 rounded-2xl font-black text-[10px] tracking-widest border border-slate-700">CANCEL</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

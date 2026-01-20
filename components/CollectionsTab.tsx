import React, { useState } from 'react';
import { ChronoDB } from '../backend/ChronoDB';
import { Layers, Edit2, Trash2, Plus } from 'lucide-react';

interface Props {
  db: ChronoDB;
  activeCollection: string;
  entries: any[];
  onRefresh: () => void;
  showNotification: (msg: string) => void;
}

export const CollectionsTab: React.FC<Props> = ({ db, activeCollection, entries, onRefresh, showNotification }) => {
  const [docId, setDocId] = useState('');
  const [docBody, setDocBody] = useState('{\n  "name": "Alice",\n  "role": "Admin"\n}');
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async () => {
    try {
      const data = JSON.parse(docBody);
      if (isEditing) {
        await db.col(activeCollection).update(docId, data);
        showNotification(`Updated ${docId}`);
      } else {
        if (docId) data._id = docId;
        await db.col(activeCollection).add(data);
        showNotification(`Added record`);
      }
      onRefresh();
      setDocId('');
      setDocBody('{\n  "name": "",\n  "role": ""\n}');
      setIsEditing(false);
    } catch (e) {
      showNotification('Invalid JSON');
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/40">
        <span className="text-emerald-400 font-mono text-sm">db.col("{activeCollection}")</span>
      </div>
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-5 divide-x divide-slate-800 overflow-hidden">
        <div className="xl:col-span-3 p-6 space-y-4 overflow-auto scrollbar-thin">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 opacity-20">
              <Layers className="w-12 h-12 mb-2" />
              <p className="text-xs">No documents</p>
            </div>
          ) : entries.map(e => (
            <div key={e.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 group hover:border-slate-600 transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-blue-400 bg-blue-400/10 px-2 py-1 rounded">ID: {e.id}</span>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setDocId(e.id); setDocBody(JSON.stringify(e.record.data, null, 2)); setIsEditing(true); }} className="p-1.5 bg-slate-800 rounded-lg hover:text-emerald-400"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={async () => { await db.col(activeCollection).remove(e.id); onRefresh(); showNotification("Deleted"); }} className="p-1.5 bg-slate-800 rounded-lg hover:text-rose-400"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <pre className="text-[11px] font-mono text-slate-300 bg-black/40 p-4 rounded-xl overflow-x-auto">
                {JSON.stringify(e.record.data, null, 2)}
              </pre>
              <div className="mt-4 flex justify-between text-[10px] text-slate-500 border-t border-slate-800/50 pt-3 font-mono">
                <span>VER: #{e.record.version}</span>
                <span>{new Date(e.record.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="xl:col-span-2 p-6 bg-slate-900/30 overflow-auto">
          <h3 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 mb-6">
            {isEditing ? <Edit2 className="w-3 h-3" /> : <Plus className="w-3 h-3" />} {isEditing ? 'Editor' : 'New Doc'}
          </h3>
          <div className="space-y-5">
            <input 
              value={docId} readOnly={isEditing} onChange={e => setDocId(e.target.value)}
              placeholder="Document ID (auto-gen)"
              className="w-full bg-black/40 border border-slate-800 rounded-xl p-3 text-emerald-400 outline-none"
            />
            <textarea 
              value={docBody} onChange={e => setDocBody(e.target.value)}
              className="w-full bg-black/40 border border-slate-800 rounded-xl p-4 font-mono text-xs h-80 outline-none"
            />
            <div className="flex gap-3">
              <button onClick={handleSave} className={`flex-1 py-4 rounded-2xl font-bold text-white transition-all ${isEditing ? 'bg-blue-600' : 'bg-emerald-600'}`}>
                {isEditing ? 'UPDATE' : 'INSERT'}
              </button>
              {isEditing && <button onClick={() => { setDocId(''); setDocBody(''); setIsEditing(false); }} className="px-5 bg-slate-800 text-slate-400 rounded-2xl">Cancel</button>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
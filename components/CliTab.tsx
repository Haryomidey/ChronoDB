import React, { useState, useRef, useEffect } from 'react';
import { ChronoDB } from '../backend/ChronoDB';

interface Props {
  db: ChronoDB;
  version: number;
  onRefresh: () => void;
  onLoginRequested: () => void;
}

export const CliTab: React.FC<Props> = ({ db, version, onRefresh, onLoginRequested }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<{cmd: string, out: string}[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const execute = async () => {
    const cmd = input.trim();
    if (!cmd) return;
    let out = '';

    if (cmd === 'chronodb login') {
      onLoginRequested();
      out = 'Opening auth window...';
    } else if (cmd === 'chronodb snapshots list') {
      const list = db.snapshots.list();
      out = list.length > 0 ? list.map(s => s.snapshot_id).join('\n') : 'Empty';
    } else if (cmd === 'help') {
      out = 'Available: login, snapshots list, snapshots create, snapshots delete-all';
    } else {
      out = `Command not recognized: ${cmd}`;
    }

    setHistory([...history, { cmd, out }]);
    setInput('');
    onRefresh();
  };

  return (
    <div className="flex-1 flex flex-col bg-black p-6 font-mono text-xs overflow-hidden">
      <div className="flex-1 overflow-auto custom-scrollbar mb-4">
        <div className="text-emerald-500 opacity-60 mb-4 pb-4 border-b border-emerald-900/20">CHRONODB CLI v1.1.0 Ready</div>
        {history.map((h, i) => (
          <div key={i} className="mb-4">
            <div className="flex items-center gap-2 text-slate-500"><span className="text-blue-500">❯</span> <span className="text-white">{h.cmd}</span></div>
            <div className="mt-1 pl-4 border-l border-slate-800 text-slate-400">{h.out}</div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="flex items-center gap-3 bg-slate-900/40 p-4 rounded-xl border border-slate-800">
        <span className="text-blue-500">❯</span>
        <input 
          autoFocus value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && execute()}
          className="flex-1 bg-transparent border-none outline-none text-white" placeholder="chronodb login"
        />
      </div>
    </div>
  );
};
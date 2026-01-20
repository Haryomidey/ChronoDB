
import React, { useState, useRef, useEffect } from 'react';
import { ChronoDB } from '../../backend/ChronoDB';

interface Props {
  db: ChronoDB;
  onRefresh: () => void;
  onLoginRequested: () => void;
}

export const CliTab: React.FC<Props> = ({ db, onRefresh, onLoginRequested }) => {
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
      out = 'AWAITING_EXTERNAL_AUTH_SESSION...';
    } else if (cmd === 'chronodb snapshots list') {
      const list = db.snapshots.list();
      out = list.length > 0 ? list.map(s => `${s.snapshot_id} (v${s.version})`).join('\n') : 'BUFFER_EMPTY';
    } else if (cmd === 'help') {
      out = 'CHRONODB_CLI COMMANDS:\n- login\n- snapshots list\n- snapshots create\n- snapshots delete-all';
    } else {
      out = `ERR_CMD_UNRECOGNIZED: ${cmd}`;
    }

    setHistory([...history, { cmd, out }]);
    setInput('');
    onRefresh();
  };

  return (
    <div className="flex-1 flex flex-col bg-black/80 p-8 font-mono text-[13px] overflow-hidden">
      <div className="flex-1 overflow-auto custom-scrollbar mb-6">
        <div className="text-emerald-500 opacity-80 mb-6 pb-6 border-b border-emerald-900/20 font-black tracking-tighter uppercase">
          ChronoDB CLI Instance v1.2.0-core<br/>
          (c) 2025 ChronoSystems. All rights reserved.
        </div>
        {history.map((h, i) => (
          <div key={i} className="mb-6 animate-in slide-in-from-left-2 duration-200">
            <div className="flex items-center gap-3 text-slate-500">
              <span className="text-blue-500 font-black">❯</span> 
              <span className="text-white bg-slate-800 px-3 py-1 rounded-lg text-[12px] font-bold tracking-tight">{h.cmd}</span>
            </div>
            <div className="mt-2 pl-6 border-l-2 border-slate-900/50 text-slate-400 whitespace-pre-wrap leading-relaxed py-1">
              {h.out}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="flex items-center gap-4 bg-slate-900/60 p-5 rounded-[1.5rem] border border-slate-800 shadow-2xl">
        <span className="text-blue-500 font-black">❯</span>
        <input 
          autoFocus value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && execute()}
          className="flex-1 bg-transparent border-none outline-none text-white font-mono placeholder:text-slate-800" placeholder="Type 'help' for available commands..."
        />
      </div>
    </div>
  );
};

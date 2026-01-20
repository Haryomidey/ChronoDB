
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
    const fullInput = input.trim();
    if (!fullInput) return;
    
    const parts = fullInput.split(' ');
    const cmd = parts[0];
    const sub = parts[1];
    const sub2 = parts[2];
    const arg = parts[3];

    let out = '';

    if (fullInput === 'chronodb login') {
      db.cli.login.setAwaitingToken(true);
      onLoginRequested();
      out = 'Opening browser for OAuth verification...\nOnce verified, cloud sync will activate.';
    } else if (fullInput === 'chronodb logout') {
      db.cli.login.logout();
      out = 'Session terminated. Sync disabled.';
    } else if (fullInput === 'chronodb snapshots list') {
      const list = db.snapshots.list();
      out = list.length > 0 
        ? list.map(s => `[${s.isSynced ? 'CLOUD' : 'LOCAL'}] ${s.snapshot_id} (v${s.version})`).join('\n') 
        : 'Snapshot buffer empty.';
    } else if (fullInput === 'chronodb snapshots create') {
      const snap = await db.triggerSnapshot('manual');
      out = snap ? `Snapshot created: ${snap.snapshot_id}` : 'No changes to capture.';
    } else if (cmd === 'chronodb' && sub === 'snapshots' && sub2 === 'delete' && arg) {
      await db.deleteSnapshot(arg);
      out = `Snapshot ${arg} deleted (Local + Cloud).`;
    } else if (fullInput === 'chronodb snapshots delete-all') {
      await db.deleteAllSnapshots();
      out = 'All state markers purged from disk and cloud storage.';
    } else if (fullInput === 'help') {
      out = 'CHRONODB_CLI v1.2.0\n' +
            '- login/logout: Manage cloud session\n' +
            '- snapshots list: View history\n' +
            '- snapshots create: Force manual capture\n' +
            '- snapshots delete <id>: Remove specific marker\n' +
            '- snapshots delete-all: Full marker purge\n' +
            '- stats: Database health report';
    } else if (fullInput === 'stats') {
      const state = db.getInternalState();
      out = `DB_VERSION: ${state.version}\n` +
            `SYNC_STATUS: ${state.user?.isLoggedIn ? 'CONNECTED' : 'LOCAL_ONLY'}\n` +
            `COLLECTIONS: ${state.collectionNames.join(', ') || 'none'}\n` +
            `RECORDS: ${Object.values(state.stats).reduce((a, b) => a + b, 0)}`;
    } else {
      out = `ERR_CMD_UNRECOGNIZED: '${fullInput}'\nType 'help' for documentation.`;
    }

    setHistory([...history, { cmd: fullInput, out }]);
    setInput('');
    onRefresh();
  };

  return (
    <div className="flex-1 flex flex-col bg-black/80 p-8 font-mono text-[13px] overflow-hidden">
      <div className="flex-1 overflow-auto custom-scrollbar mb-6">
        <div className="text-emerald-500 opacity-80 mb-6 pb-6 border-b border-emerald-900/20 font-black tracking-tighter uppercase">
          ChronoDB CLI Instance v1.2.0-core<br/>
          CONNECTED_TO: {db.getInternalState().user?.email || 'LOCAL_RUNTIME'}
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
          className="flex-1 bg-transparent border-none outline-none text-white font-mono placeholder:text-slate-800" placeholder="chronodb login"
        />
      </div>
    </div>
  );
};

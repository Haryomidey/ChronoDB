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
    const rawInput = input.trim();
    if (!rawInput) return;
    
    // Robust split handling multiple spaces
    const parts = rawInput.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const sub = parts[1]?.toLowerCase();
    const sub2 = parts[2]?.toLowerCase();
    const arg = parts[3]; // Keep original case for IDs

    let out = '';
    let shouldRefresh = false;

    // Command Dispatcher
    if (cmd === 'clear') {
      setHistory([]);
      setInput('');
      return;
    }

    if (cmd === 'help') {
      out = 'CHRONODB_SYSTEM_HELP\n' +
            '--------------------\n' +
            'chronodb login                  - Open authentication gateway\n' +
            'chronodb logout                 - Clear current session\n' +
            'chronodb snapshots list         - View version history\n' +
            'chronodb snapshots create       - Manual point-in-time capture\n' +
            'chronodb snapshots delete <id>  - Remove specific marker\n' +
            'chronodb snapshots delete-all   - Clear all markers\n' +
            'stats                           - System health & index report\n' +
            'clear                           - Clear console history';
    } 
    else if (cmd === 'stats') {
      const state = db.getInternalState();
      out = `[SYSTEM_REPORT]\n` +
            `RUNTIME: ChronoDB v1.2.0-core\n` +
            `VERSION: ${state.version}\n` +
            `USER: ${state.user?.email || 'GUEST_NODE'}\n` +
            `SYNC_ENABLED: ${state.user?.isLoggedIn ? 'YES' : 'NO'}\n` +
            `COLLECTIONS: ${state.collectionNames.length > 0 ? state.collectionNames.join(', ') : '0_INDEXED'}\n` +
            `OBJECTS: ${Object.values(state.stats).reduce((a, b) => a + b, 0)}`;
    }
    else if (cmd === 'chronodb') {
      if (sub === 'login') {
        db.cli.login.setAwaitingToken(true);
        onLoginRequested();
        out = 'AUTH_REQUEST_SENT: Check browser for login window...';
      } 
      else if (sub === 'logout') {
        db.cli.login.logout();
        out = 'SESSION_TERMINATED: Returning to local-only mode.';
        shouldRefresh = true;
      }
      else if (sub === 'snapshots') {
        if (sub2 === 'list') {
          const list = db.snapshots.list();
          out = list.length > 0 
            ? list.map(s => `[${s.isSynced ? 'SYNCED' : 'LOCAL'}] ${s.snapshot_id} (Ver: ${s.version})`).join('\n') 
            : 'STATE_HISTORY: No snapshots found.';
        } 
        else if (sub2 === 'create') {
          const snap = await db.triggerSnapshot('manual');
          out = snap ? `SUCCESS: Created snapshot ${snap.snapshot_id}` : 'INFO: No data changes to record.';
          shouldRefresh = true;
        } 
        else if (sub2 === 'delete' && arg) {
          await db.deleteSnapshot(arg);
          out = `SUCCESS: Purged snapshot ${arg}`;
          shouldRefresh = true;
        } 
        else if (sub2 === 'delete-all') {
          await db.deleteAllSnapshots();
          out = 'SUCCESS: All snapshot markers deleted.';
          shouldRefresh = true;
        } 
        else {
          out = `ERR: Invalid snapshot command '${sub2 || ''}'. Try 'list', 'create', 'delete', or 'delete-all'.`;
        }
      } 
      else {
        out = `ERR: Unknown chronodb sub-command '${sub || ''}'. Try 'login', 'logout', or 'snapshots'.`;
      }
    } 
    else {
      out = `ERR: Command '${cmd}' not recognized. Type 'help' for assistance.`;
    }

    setHistory(prev => [...prev, { cmd: rawInput, out }]);
    setInput('');
    if (shouldRefresh) onRefresh();
  };

  return (
    <div className="flex-1 flex flex-col bg-[#05070A] p-8 font-mono text-[13px] overflow-hidden">
      <div className="flex-1 overflow-auto custom-scrollbar mb-6">
        <div className="text-emerald-500 opacity-60 mb-6 pb-6 border-b border-emerald-900/10 font-bold uppercase tracking-widest text-[11px]">
          ChronoDB Virtual Terminal v1.2.0<br/>
          Status: {db.getInternalState().user?.isLoggedIn ? 'Authenticated' : 'Local Node'}
        </div>
        {history.map((h, i) => (
          <div key={i} className="mb-6 group">
            <div className="flex items-center gap-3 text-slate-500">
              <span className="text-blue-500 font-bold">❯</span> 
              <span className="text-white bg-white/5 px-3 py-1 rounded-lg text-[12px]">{h.cmd}</span>
            </div>
            <div className="mt-2 pl-6 border-l border-slate-800/50 text-slate-400 whitespace-pre-wrap leading-relaxed py-1">
              {h.out}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="flex items-center gap-4 bg-slate-900/40 p-5 rounded-[1.2rem] border border-slate-800 focus-within:border-blue-500/50 transition-all shadow-2xl">
        <span className="text-blue-500 font-bold">❯</span>
        <input 
          autoFocus 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && execute()}
          className="flex-1 bg-transparent border-none outline-none text-white font-mono placeholder:text-slate-800" 
          placeholder="Type 'help' for commands..."
        />
      </div>
    </div>
  );
};
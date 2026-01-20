
import React, { useState, useEffect } from 'react';

export const DocsTab: React.FC = () => {
  const [guide, setGuide] = useState('');

  useEffect(() => {
    fetch('backend/docs/developer-guide.md')
      .then(r => r.text())
      .then(t => setGuide(t))
      .catch(() => setGuide('# Documentation Fetch Failure\nPlease ensure the guide file exists in backend/docs/'));
  }, []);

  return (
    <div className="flex-1 p-12 overflow-auto custom-scrollbar bg-slate-900/10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-black text-white mb-10 border-b border-slate-800 pb-8 tracking-tighter uppercase">Technical_Manual</h1>
        <div className="space-y-12">
          {guide.split('##').map((s, idx) => {
            if (!s.trim()) return null;
            const lines = s.trim().split('\n');
            const title = lines[0];
            const content = lines.slice(1).join('\n');
            return (
              <div key={idx} className="group">
                <h2 className="text-xl font-black text-white mb-6 flex items-center gap-4">
                  <div className="w-1.5 h-8 bg-emerald-500 rounded-full group-hover:h-10 transition-all"></div>
                  {title.toUpperCase()}
                </h2>
                <div className="bg-slate-900/80 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl">
                  <pre className="text-xs font-mono text-slate-400 whitespace-pre-wrap leading-7">{content.trim()}</pre>
                </div>
              </div>
            );
          })}
        </div>
        <div className="h-24"></div>
      </div>
    </div>
  );
};

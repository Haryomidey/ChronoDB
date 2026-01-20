
import React, { useState, useEffect } from 'react';

export const DocsTab: React.FC = () => {
    const [guide, setGuide] = useState('');

    useEffect(() => {
        fetch('backend/docs/developer-guide.md')
            .then(r => r.text())
            .then(t => setGuide(t))
            .catch(() => setGuide('# Documentation not loaded'));
    }, []);

    return (
        <div className="flex-1 p-10 overflow-auto prose prose-invert custom-scrollbar">
            <h1 className="text-3xl font-black mb-8 border-b border-slate-800 pb-4">Developer Guide</h1>
            <div className="space-y-6">
                {guide.split('##').map((s, idx) => {
                    if (!s.trim()) return null;
                    const lines = s.trim().split('\n');
                    const title = lines[0];
                    const content = lines.slice(1).join('\n');
                    return (
                        <div key={idx} className="mt-10">
                            <h2 className="text-xl font-bold text-white mb-4 border-l-4 border-emerald-500 pl-4">{title}</h2>
                            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                                <pre className="text-xs font-mono text-slate-400 whitespace-pre-wrap">{content.trim()}</pre>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

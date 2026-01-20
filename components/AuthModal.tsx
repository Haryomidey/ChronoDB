
import React, { useState } from 'react';
// Import types and ChronoDB from backend source to ensure consistency
import { AuthMode, CloudUser } from '../backend/src/types';
import { ChronoDB } from '../backend/src/index';
import { ShieldCheck, Mail, Lock, RefreshCw, Plus, ArrowLeft } from 'lucide-react';

interface Props {
    mode: AuthMode | null;
    onClose: () => void;
    db: ChronoDB;
    onSuccess: () => void;
    showNotification: (msg: string) => void;
}

export const AuthModal: React.FC<Props> = ({ mode, onClose, db, onSuccess, showNotification }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [currentMode, setCurrentMode] = useState<AuthMode | null>(null);

    React.useEffect(() => {
        setCurrentMode(mode);
    }, [mode]);

    if (!currentMode) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsAuthenticating(true);
        try {
            if (currentMode === 'login') {
                await db.cli.login.login(email, password);
                showNotification("Signed in successfully");
            } else if (currentMode === 'signup') {
                await db.cli.login.signup(email, password);
                showNotification("Account created");
            } else {
                showNotification("Reset link sent");
            }
            onSuccess();
            onClose();
        } catch (err) {
            showNotification("Auth error");
        } finally {
            setIsAuthenticating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md">
            <div className="w-full max-w-md p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white">
                    <Plus className="w-6 h-6 rotate-45" />
                </button>
                
                <div className="flex flex-col items-center mb-8">
                    <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 mb-4">
                        <ShieldCheck className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                        {currentMode === 'login' ? 'Welcome Back' : currentMode === 'signup' ? 'Join ChronoDB' : 'Reset Password'}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest ml-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                            <input 
                                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                                className="w-full bg-black/40 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-white focus:border-emerald-500/40 outline-none transition-all"
                            />
                        </div>
                    </div>
                    {currentMode !== 'forgot' && (
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                                <input 
                                    type="password" required value={password} onChange={e => setPassword(e.target.value)}
                                    className="w-full bg-black/40 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-white focus:border-emerald-500/40 outline-none transition-all"
                                />
                            </div>
                        </div>
                    )}
                    <button type="submit" disabled={isAuthenticating} className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                        {isAuthenticating && <RefreshCw className="w-4 h-4 animate-spin" />}
                        {currentMode === 'login' ? 'SIGN IN' : currentMode === 'signup' ? 'SIGN UP' : 'RESET'}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col items-center gap-2 text-xs">
                    {currentMode === 'login' ? (
                        <>
                            <button onClick={() => setCurrentMode('signup')} className="text-slate-400 hover:text-emerald-400">Sign Up instead</button>
                            <button onClick={() => setCurrentMode('forgot')} className="text-slate-500">Forgot password?</button>
                        </>
                    ) : (
                        <button onClick={() => setCurrentMode('login')} className="text-slate-400 flex items-center gap-2"><ArrowLeft className="w-3 h-3" /> Back to Login</button>
                    )}
                </div>
            </div>
        </div>
    );
};

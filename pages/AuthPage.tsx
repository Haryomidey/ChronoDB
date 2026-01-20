
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChronoDB } from '../backend/ChronoDB';
import { AuthMode } from '../backend/types';
import { ShieldCheck, Mail, Lock, RefreshCw, ArrowLeft, Plus } from 'lucide-react';

interface Props {
  db: ChronoDB;
}

export const AuthPage: React.FC<Props> = ({ db }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = (searchParams.get('mode') as AuthMode) || 'login';

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        await db.cli.login.login(email, password);
      } else if (mode === 'signup') {
        await db.cli.login.signup(email, password);
      } else {
        // forgot password simulation
        await new Promise(r => setTimeout(r, 1000));
      }
      navigate('/');
    } catch (err) {
      setError('Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080B14] p-6">
      <div className="w-full max-w-md p-10 bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl relative">
        <button 
          onClick={() => navigate('/')}
          className="absolute top-8 left-8 text-slate-500 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <div className="flex flex-col items-center mb-10">
          <div className="p-5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 mb-6">
            <ShieldCheck className="w-12 h-12 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
            {mode === 'login' ? 'Cloud Access' : mode === 'signup' ? 'New Account' : 'Recovery'}
          </h2>
          <p className="text-slate-500 text-sm mt-2">Connect your local instance to ChronoCloud.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] ml-1">Email Identifier</label>
            <div className="relative">
              <Mail className="absolute left-4 top-4 w-4 h-4 text-slate-500" />
              <input 
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="w-full bg-black/40 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-emerald-500/40 outline-none transition-all placeholder:text-slate-700"
                placeholder="developer@chronodb.io"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] ml-1">Secure Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-4 w-4 h-4 text-slate-500" />
                <input 
                  type="password" required value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-emerald-500/40 outline-none transition-all placeholder:text-slate-700"
                  placeholder="••••••••"
                />
              </div>
            </div>
          )}

          <button 
            type="submit" disabled={isLoading}
            className="w-full py-5 bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 tracking-widest text-xs"
          >
            {isLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
            {mode === 'login' ? 'ESTABLISH LINK' : mode === 'signup' ? 'PROVISION ACCOUNT' : 'SEND RESET'}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-800 flex flex-col items-center gap-3 text-[11px] font-bold tracking-wider">
          {mode === 'login' ? (
            <>
              <button onClick={() => setMode('signup')} className="text-slate-400 hover:text-emerald-400 transition-colors uppercase">No Account? <span className="underline decoration-emerald-500/30">Signup</span></button>
              <button onClick={() => setMode('forgot')} className="text-slate-600 hover:text-white uppercase transition-colors">Forgot credentials?</button>
            </>
          ) : (
            <button onClick={() => setMode('login')} className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-2 uppercase">
              Existing Account? <span className="underline decoration-emerald-500/30">Log in</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
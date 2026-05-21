import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Input, Button, Alert } from '../../components/ui';

export default function LoginPage() {
  const { signIn, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [showReset, setShowReset] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await signIn(email, password);
    if (err) setError(err.message === 'Invalid login credentials' ? 'Forkert email eller adgangskode.' : err.message);
    setLoading(false);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    await resetPassword(email);
    setResetSent(true);
    setResetLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-64 h-64 bg-blue-400 rounded-full blur-3xl" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <span className="text-white text-xl font-bold">
              Håndværker<span className="text-blue-400">Pro</span>
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Din komplette<br />
            <span className="text-blue-400">business platform</span>
          </h1>
          <p className="text-slate-400 text-lg mb-12">
            Administrer jobs, kunder, medarbejdere og fakturaer på ét sted.
          </p>
          <div className="space-y-4">
            {['Komplet job- og dispatchstyring', 'CRM & kundehistorik', 'Fakturering & økonomi', 'Medarbejder- og vagtplanlægning'].map(f => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full" />
                </div>
                <span className="text-slate-300 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <span className="text-white text-lg font-bold">
              Håndværker<span className="text-blue-400">Pro</span>
            </span>
          </div>

          {!showReset ? (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white">Log ind</h2>
                <p className="text-slate-400 mt-1">Velkommen tilbage</p>
              </div>

              {error && <Alert variant="error">{error}</Alert>}

              <form onSubmit={handleLogin} className="space-y-4 mt-6">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-300">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="navn@firma.dk"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-300">Adgangskode</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 pr-11 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(s => !s)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowReset(true)}
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Glemt adgangskode?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {loading && (
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  Log ind
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-400">
                Har du ikke en konto?{' '}
                <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                  Opret gratis konto
                </Link>
              </p>
            </>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white">Nulstil adgangskode</h2>
                <p className="text-slate-400 mt-1">Vi sender dig et link på email</p>
              </div>

              {resetSent ? (
                <Alert variant="success">Email sendt! Tjek din indbakke og følg linket for at nulstille din adgangskode.</Alert>
              ) : (
                <form onSubmit={handleReset} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-300">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all"
                  >
                    {resetLoading ? 'Sender...' : 'Send nulstillingslink'}
                  </button>
                </form>
              )}

              <button
                onClick={() => { setShowReset(false); setResetSent(false); }}
                className="mt-4 text-sm text-slate-400 hover:text-slate-200 transition-colors"
              >
                ← Tilbage til log ind
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

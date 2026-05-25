import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Eye, EyeOff, Check, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Alert } from '../../components/ui';

function DarkInput({ label, hint, ...props }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-300">{label}</label>
      <input
        {...props}
        className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
      />
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export default function SignupPage() {
  const { signUp } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    company_name: '',
    email: '',
    password: '',
    phone: '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.company_name.trim()) { setError('Virksomhedens navn er påkrævet.'); return; }
    if (!form.email.trim()) { setError('Email er påkrævet.'); return; }
    if (form.password.length < 6) { setError('Adgangskode skal være mindst 6 tegn.'); return; }

    setLoading(true);
    const { error: err } = await signUp(form.email.trim(), form.password, {
      data: {
        company_name: form.company_name.trim(),
        phone: form.phone.trim(),
      },
    });
    setLoading(false);

    if (err) {
      if (err.message.includes('already registered')) {
        setError('Denne email er allerede registreret. Prøv at logge ind i stedet.');
      } else {
        setError(err.message);
      }
      return;
    }

    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-900/40">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Konto oprettet!</h2>
          <p className="text-slate-400 leading-relaxed mb-8">
            Vi har sendt en bekræftelsesmail til{' '}
            <strong className="text-white">{form.email}</strong>.
            <br />
            Klik på linket for at aktivere din konto og komme i gang.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium"
          >
            Gå til log ind <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Left visual panel */}
      <div className="hidden lg:flex flex-col w-5/12 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 p-12 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative flex-1 flex flex-col">
          <div className="flex items-center gap-3 mb-20">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <span className="text-white text-xl font-bold tracking-tight">
              Håndværker<span className="text-blue-400">Pro</span>
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">
              Alt hvad din
              <br />
              <span className="text-blue-400">håndværkervirksomhed</span>
              <br />
              behøver
            </h1>
            <p className="text-slate-400 text-lg mb-12 leading-relaxed">
              Opret dig på under 30 sekunder. Ingen kreditkort. Ingen binding.
            </p>

            <div className="space-y-4">
              {[
                'Jobs, booking & dispatch',
                'Kunder & servicehistorik',
                'Tilbud & fakturaer med moms',
                'Medarbejdere & vagtplanlægning',
                'Økonomi & rapporter',
              ].map(feature => (
                <div key={feature} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-blue-500/20 border border-blue-500/30 rounded-full flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-blue-400" />
                  </div>
                  <span className="text-slate-300 text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-slate-600 text-xs mt-8">
            Gratis 30-dages prøveperiode · Ingen opsigelsesgebyr
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden justify-center">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <Wrench className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-white text-xl font-bold">
              Håndværker<span className="text-blue-400">Pro</span>
            </span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white">Opret gratis konto</h2>
            <p className="text-slate-400 mt-1.5 text-sm">
              30 dages gratis prøveperiode · Ingen kreditkort
            </p>
          </div>

          {error && (
            <div className="mb-5">
              <Alert variant="error">{error}</Alert>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <DarkInput
              label="Virksomhedens navn"
              placeholder="Jensen VVS & Blikkenslager ApS"
              value={form.company_name}
              onChange={e => set('company_name', e.target.value)}
              required
              autoFocus
            />

            <DarkInput
              label="Email"
              type="email"
              placeholder="jens@firma.dk"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">Adgangskode</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  required
                  placeholder="Mindst 6 tegn"
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 pr-12 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            <DarkInput
              label="Telefonnummer"
              type="tel"
              placeholder="+45 12 34 56 78"
              value={form.phone}
              onChange={e => set('phone', e.target.value)}
              hint="Valgfrit — bruges til kundekontakt og fakturaer"
            />

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-blue-900/30"
              >
                {loading ? (
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <>
                    Opret konto
                    <ArrowRight className="w-4.5 h-4.5" />
                  </>
                )}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Har du allerede en konto?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
              Log ind
            </Link>
          </p>

          <p className="mt-8 text-center text-xs text-slate-600 leading-relaxed">
            Ved at oprette en konto accepterer du vores{' '}
            <span className="text-slate-500 underline cursor-pointer">vilkår</span>
            {' '}og{' '}
            <span className="text-slate-500 underline cursor-pointer">privatlivspolitik</span>.
          </p>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Eye, EyeOff, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Alert } from '../../components/ui';

const steps = ['Din konto', 'Din virksomhed'];

export default function SignupPage() {
  const { signUp } = useAuth();
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    company_name: '',
    phone: '',
    city: '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleNext = (e) => {
    e.preventDefault();
    setError('');
    if (!form.full_name || !form.email || !form.password) return;
    if (form.password.length < 6) { setError('Adgangskode skal være mindst 6 tegn.'); return; }
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.company_name) { setError('Angiv virksomhedens navn.'); return; }
    setLoading(true);
    const { error: err } = await signUp(form.email, form.password, {
      data: { full_name: form.full_name, company_name: form.company_name },
    });
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Konto oprettet!</h2>
          <p className="text-slate-400 mb-8">
            Vi har sendt en bekræftelsesmail til <strong className="text-white">{form.email}</strong>.
            Klik på linket i emailen for at aktivere din konto.
          </p>
          <Link to="/login" className="text-blue-400 hover:text-blue-300 transition-colors text-sm">
            Tilbage til log ind →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10 justify-center">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <Wrench className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-white text-xl font-bold">
            Håndværker<span className="text-blue-400">Pro</span>
          </span>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-8">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i < step ? 'bg-emerald-500 text-white' :
                i === step ? 'bg-blue-600 text-white' :
                'bg-slate-700 text-slate-400'
              }`}>
                {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className={`text-sm font-medium ${i === step ? 'text-white' : 'text-slate-500'}`}>{s}</span>
              {i < steps.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? 'bg-emerald-500' : 'bg-slate-700'}`} />}
            </div>
          ))}
        </div>

        {error && <div className="mb-4"><Alert variant="error">{error}</Alert></div>}

        {step === 0 ? (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">Opret din konto</h2>
              <p className="text-slate-400 mt-1 text-sm">Gratis 30-dages prøveperiode</p>
            </div>
            <form onSubmit={handleNext} className="space-y-4">
              <DarkInput label="Fulde navn" placeholder="Jens Jensen" value={form.full_name} onChange={e => set('full_name', e.target.value)} required />
              <DarkInput label="Email" type="email" placeholder="navn@firma.dk" value={form.email} onChange={e => set('email', e.target.value)} required />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-300">Adgangskode</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    required
                    placeholder="Mindst 6 tegn"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 pr-11 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                  <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all mt-2">
                Næste →
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">Din virksomhed</h2>
              <p className="text-slate-400 mt-1 text-sm">Fortæl os om din virksomhed</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <DarkInput label="Virksomhedsnavn *" placeholder="Jensen VVS ApS" value={form.company_name} onChange={e => set('company_name', e.target.value)} required />
              <DarkInput label="Telefon" type="tel" placeholder="+45 12 34 56 78" value={form.phone} onChange={e => set('phone', e.target.value)} />
              <DarkInput label="By" placeholder="København" value={form.city} onChange={e => set('city', e.target.value)} />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-2"
              >
                {loading && <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
                Opret konto
              </button>
            </form>
            <button onClick={() => setStep(0)} className="mt-4 text-sm text-slate-400 hover:text-slate-200 transition-colors">
              ← Tilbage
            </button>
          </>
        )}

        <p className="mt-6 text-center text-sm text-slate-400">
          Har du allerede en konto?{' '}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">Log ind</Link>
        </p>
      </div>
    </div>
  );
}

function DarkInput({ label, ...props }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-300">{label}</label>
      <input
        {...props}
        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
      />
    </div>
  );
}

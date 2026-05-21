import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, Building2, Check, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Alert } from '../../components/ui';

export default function OnboardingPage() {
  const { session, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    company_name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    zip: '',
    vat_number: '',
    full_name: '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.company_name) { setError('Virksomhedens navn er påkrævet.'); return; }
    setError('');
    setLoading(true);

    try {
      const { data: company, error: companyErr } = await supabase
        .from('companies')
        .insert({
          name: form.company_name,
          phone: form.phone || null,
          email: form.email || session.user.email,
          address: form.address || null,
          city: form.city || null,
          zip: form.zip || null,
          vat_number: form.vat_number || null,
        })
        .select()
        .single();

      if (companyErr) throw companyErr;

      const { error: profileErr } = await supabase
        .from('profiles')
        .update({
          company_id: company.id,
          role: 'owner',
          full_name: form.full_name || null,
          email: session.user.email,
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.user.id);

      if (profileErr) throw profileErr;

      await refreshProfile();
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Left: visual */}
      <div className="hidden lg:flex flex-col items-center justify-center w-2/5 bg-slate-800 p-12">
        <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-blue-900/50">
          <Building2 className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white text-center mb-4">
          Opsæt din virksomhed
        </h2>
        <p className="text-slate-400 text-center max-w-xs">
          Det tager kun 2 minutter. Du kan altid redigere oplysningerne senere i indstillinger.
        </p>

        <div className="mt-12 space-y-4 w-full max-w-xs">
          {[
            { icon: Check, text: 'Virksomhedsprofil oprettet' },
            { icon: Check, text: 'Klar til at oprette jobs' },
            { icon: Check, text: 'Klar til at tilføje kunder' },
            { icon: Check, text: 'Klar til at fakturere' },
          ].map(({ icon: Icon, text }, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <Icon className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <span className="text-slate-300 text-sm">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-10 lg:hidden justify-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <span className="text-white text-lg font-bold">HåndværkerPro</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white">Velkommen!</h2>
            <p className="text-slate-400 mt-1">Udfyld virksomhedens oplysninger for at komme i gang</p>
          </div>

          {error && <div className="mb-4"><Alert variant="error">{error}</Alert></div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">Virksomhedsnavn *</label>
              <input
                value={form.company_name}
                onChange={e => set('company_name', e.target.value)}
                required
                placeholder="Jensen VVS & Blikkenslager ApS"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">Dit fulde navn</label>
              <input
                value={form.full_name}
                onChange={e => set('full_name', e.target.value)}
                placeholder="Jens Jensen"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-300">Telefon</label>
                <input
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                  placeholder="+45 12 34 56 78"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-300">CVR-nummer</label>
                <input
                  value={form.vat_number}
                  onChange={e => set('vat_number', e.target.value)}
                  placeholder="12345678"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">Adresse</label>
              <input
                value={form.address}
                onChange={e => set('address', e.target.value)}
                placeholder="Testvej 1"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-300">Postnummer</label>
                <input
                  value={form.zip}
                  onChange={e => set('zip', e.target.value)}
                  placeholder="2100"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-300">By</label>
                <input
                  value={form.city}
                  onChange={e => set('city', e.target.value)}
                  placeholder="København"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              ) : (
                <>
                  Kom i gang
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

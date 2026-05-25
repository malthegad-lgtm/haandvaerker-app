import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check, ArrowRight, ArrowLeft, Wrench, Building2,
  MapPin, Receipt, Percent, Sparkles, SkipForward,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Alert } from '../../components/ui';

// ─── Step config ──────────────────────────────────────────────────────────────

const WIZARD_STEPS = [
  {
    id: 'identity',
    title: 'Virksomhedsdetaljer',
    subtitle: 'CVR-nummer, type og kontaktinfo',
    icon: Building2,
    color: 'blue',
  },
  {
    id: 'address',
    title: 'Faktureringsadresse',
    subtitle: 'Den adresse der fremgår på fakturaer og tilbud',
    icon: MapPin,
    color: 'violet',
  },
  {
    id: 'invoicing',
    title: 'Faktura & Betaling',
    subtitle: 'Fakturaindstillinger, betalingsfrist og bankoplysninger',
    icon: Receipt,
    color: 'amber',
  },
  {
    id: 'tax',
    title: 'Moms & Branding',
    subtitle: 'Momsindstillinger og virksomhedens logo',
    icon: Percent,
    color: 'emerald',
  },
];

const COMPANY_TYPES = [
  { value: '', label: 'Vælg type...' },
  { value: 'enkeltmand', label: 'Enkeltmandsvirksomhed' },
  { value: 'aps', label: 'Anpartsselskab (ApS)' },
  { value: 'as', label: 'Aktieselskab (A/S)' },
  { value: 'is', label: 'Interessentskab (I/S)' },
  { value: 'forening', label: 'Forening / organisation' },
  { value: 'andet', label: 'Andet' },
];

const COUNTRIES = [
  { value: 'DK', label: 'Danmark' },
  { value: 'SE', label: 'Sverige' },
  { value: 'NO', label: 'Norge' },
  { value: 'DE', label: 'Tyskland' },
  { value: 'OTHER', label: 'Andet' },
];

// ─── Helper components ────────────────────────────────────────────────────────

function WizardInput({ label, hint, optional, ...props }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-slate-700">{label}</label>
        {optional && <span className="text-xs text-slate-400">Valgfrit</span>}
      </div>
      <input
        {...props}
        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all disabled:bg-slate-50"
      />
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

function WizardSelect({ label, optional, children, ...props }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-slate-700">{label}</label>
        {optional && <span className="text-xs text-slate-400">Valgfrit</span>}
      </div>
      <select
        {...props}
        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
      >
        {children}
      </select>
    </div>
  );
}

function WizardTextarea({ label, hint, optional, ...props }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-slate-700">{label}</label>
        {optional && <span className="text-xs text-slate-400">Valgfrit</span>}
      </div>
      <textarea
        {...props}
        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all resize-none"
      />
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ steps, current }) {
  return (
    <div className="flex items-start">
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;
        const Icon = step.icon;
        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                done
                  ? 'bg-emerald-500 border-emerald-500 shadow-sm shadow-emerald-200'
                  : active
                  ? 'bg-blue-600 border-blue-600 shadow-md shadow-blue-200'
                  : 'bg-white border-slate-200'
              }`}>
                {done
                  ? <Check className="w-4.5 h-4.5 text-white" />
                  : <Icon className={`w-4.5 h-4.5 ${active ? 'text-white' : 'text-slate-400'}`} />
                }
              </div>
              <div className="mt-2 text-center">
                <p className={`text-xs font-semibold leading-tight ${active ? 'text-slate-900' : done ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {step.title.split(' ')[0]}
                </p>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-3 mb-5 transition-all duration-300 ${done ? 'bg-emerald-400' : 'bg-slate-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Success screen ───────────────────────────────────────────────────────────

function SuccessScreen({ companyName, onGo }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="relative mb-8">
        <div className="w-24 h-24 bg-emerald-100 rounded-3xl flex items-center justify-center">
          <Sparkles className="w-12 h-12 text-emerald-500" />
        </div>
        <div className="absolute -top-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-md">
          <Check className="w-4 h-4 text-white" />
        </div>
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Alt er sat op!</h2>
      <p className="text-slate-500 max-w-xs leading-relaxed mb-2">
        <strong className="text-slate-700">{companyName}</strong> er klar til at gå i gang.
        Du kan altid redigere disse indstillinger under Indstillinger.
      </p>
      <p className="text-sm text-slate-400 mb-10">
        Tilføj dine første kunder og jobs for at komme i gang.
      </p>
      <button
        onClick={onGo}
        className="inline-flex items-center gap-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-blue-200"
      >
        Gå til dashboard
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const { session, profile, company, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);
  const [creatingCompany, setCreatingCompany] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  // ── Company creation state (only shown if profile.company_id is null) ──
  const [initForm, setInitForm] = useState({
    company_name: session?.user?.user_metadata?.company_name || '',
    phone: session?.user?.user_metadata?.phone || '',
  });

  // ── Wizard form state (pre-filled from existing company) ──
  const [form, setForm] = useState({
    vat_number: '',
    company_type: '',
    website: '',
    address: '',
    zip: '',
    city: '',
    country: 'DK',
    invoice_prefix: 'FAKT',
    invoice_due_days: 14,
    invoice_footer: '',
    bank_name: '',
    bank_reg: '',
    bank_account: '',
    vat_registered: true,
    default_tax_rate: 25,
    logo_url: '',
  });

  // Pre-fill from existing company on mount
  useEffect(() => {
    if (company) {
      setForm(f => ({
        ...f,
        vat_number: company.vat_number || '',
        company_type: company.company_type || '',
        website: company.website || '',
        address: company.address || '',
        zip: company.zip || '',
        city: company.city || '',
        country: company.country || 'DK',
        invoice_prefix: company.invoice_prefix || 'FAKT',
        invoice_due_days: company.invoice_due_days ?? 14,
        invoice_footer: company.invoice_footer || '',
        bank_name: company.bank_name || '',
        bank_reg: company.bank_reg || '',
        bank_account: company.bank_account || '',
        vat_registered: company.vat_registered ?? true,
        default_tax_rate: company.default_tax_rate ?? 25,
        logo_url: company.logo_url || '',
      }));
    }
  }, [company]);

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const needsCompanyCreation = !profile?.company_id;

  // ── Create company (initial step) ──
  const handleCreateCompany = async () => {
    if (!initForm.company_name.trim()) { setError('Virksomhedens navn er påkrævet.'); return; }
    setError('');
    setCreatingCompany(true);

    try {
      const { data: newCompany, error: companyErr } = await supabase
        .from('companies')
        .insert({
          name: initForm.company_name.trim(),
          phone: initForm.phone.trim() || null,
          email: session.user.email,
          onboarding_completed: false,
        })
        .select()
        .single();

      if (companyErr) throw companyErr;

      const { error: profileErr } = await supabase
        .from('profiles')
        .update({
          company_id: newCompany.id,
          role: 'owner',
          email: session.user.email,
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.user.id);

      if (profileErr) throw profileErr;

      await refreshProfile();
      setCurrentStep(0);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreatingCompany(false);
    }
  };

  // ── Save current wizard step to DB ──
  const saveStep = async (stepIndex) => {
    const companyId = company?.id || profile?.company_id;
    if (!companyId) return;

    const patches = [
      // Step 0: identity
      { vat_number: form.vat_number || null, company_type: form.company_type || null, website: form.website || null },
      // Step 1: address
      { address: form.address || null, zip: form.zip || null, city: form.city || null, country: form.country },
      // Step 2: invoicing
      {
        invoice_prefix: form.invoice_prefix || 'FAKT',
        invoice_due_days: parseInt(form.invoice_due_days) || 14,
        invoice_footer: form.invoice_footer || null,
        bank_name: form.bank_name || null,
        bank_reg: form.bank_reg || null,
        bank_account: form.bank_account || null,
      },
      // Step 3: tax & brand
      {
        vat_registered: form.vat_registered,
        default_tax_rate: parseFloat(form.default_tax_rate) || 25,
        vat_number: form.vat_number || null,
        logo_url: form.logo_url || null,
      },
    ];

    await supabase
      .from('companies')
      .update({ ...patches[stepIndex], updated_at: new Date().toISOString() })
      .eq('id', companyId);
  };

  const handleNext = async () => {
    setError('');
    setSaving(true);
    await saveStep(currentStep);
    setSaving(false);

    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      await handleFinish();
    }
  };

  const handleSkip = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => setCurrentStep(s => Math.max(0, s - 1));

  const handleFinish = async () => {
    setSaving(true);
    const companyId = company?.id || profile?.company_id;
    if (companyId) {
      await supabase
        .from('companies')
        .update({ onboarding_completed: true, updated_at: new Date().toISOString() })
        .eq('id', companyId);
    }
    await refreshProfile();
    setSaving(false);
    setDone(true);
  };

  // ── Render: Initial company creation (before wizard) ──
  if (needsCompanyCreation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 justify-center mb-10">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <span className="text-slate-900 text-xl font-bold">
              Håndværker<span className="text-blue-600">Pro</span>
            </span>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8">
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-7 h-7 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Opret din virksomhed</h2>
              <p className="text-sm text-slate-500 mt-1.5">
                Et par hurtige oplysninger for at komme i gang
              </p>
            </div>

            {error && <div className="mb-5"><Alert variant="error">{error}</Alert></div>}

            <div className="space-y-4">
              <WizardInput
                label="Virksomhedens navn"
                placeholder="Jensen VVS & Blikkenslager ApS"
                value={initForm.company_name}
                onChange={e => setInitForm(f => ({ ...f, company_name: e.target.value }))}
                required
                autoFocus
              />
              <WizardInput
                label="Telefon"
                type="tel"
                placeholder="+45 12 34 56 78"
                value={initForm.phone}
                onChange={e => setInitForm(f => ({ ...f, phone: e.target.value }))}
                optional
              />
            </div>

            <button
              onClick={handleCreateCompany}
              disabled={creatingCompany}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2.5 shadow-md shadow-blue-200"
            >
              {creatingCompany ? (
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <>
                  Fortsæt til opsætning
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Render: Done ──
  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200/80 p-10">
          <SuccessScreen
            companyName={company?.name || 'Din virksomhed'}
            onGo={() => navigate('/', { replace: true })}
          />
        </div>
      </div>
    );
  }

  // ── Render: Wizard ──
  const step = WIZARD_STEPS[currentStep];
  const isLast = currentStep === WIZARD_STEPS.length - 1;
  const StepIcon = step.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
            <Wrench className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-slate-900 text-lg font-bold">
            Håndværker<span className="text-blue-600">Pro</span>
          </span>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden">
          {/* Step indicator bar */}
          <div className="bg-slate-50/80 border-b border-slate-200 px-8 pt-6 pb-4">
            <StepIndicator steps={WIZARD_STEPS} current={currentStep} />
          </div>

          {/* Step content */}
          <div className="p-8">
            {/* Step header */}
            <div className="flex items-start gap-4 mb-7">
              <div className="w-11 h-11 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center shrink-0">
                <StepIcon className="w-5.5 h-5.5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
                <p className="text-sm text-slate-500 mt-0.5">{step.subtitle}</p>
              </div>
            </div>

            {error && <div className="mb-5"><Alert variant="error">{error}</Alert></div>}

            {/* ── Step 0: Virksomhedsdetaljer ── */}
            {currentStep === 0 && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <WizardInput
                    label="CVR-nummer"
                    placeholder="12345678"
                    value={form.vat_number}
                    onChange={e => setF('vat_number', e.target.value)}
                    optional
                    hint="8-cifret dansk CVR-nummer"
                  />
                  <WizardSelect
                    label="Virksomhedstype"
                    optional
                    value={form.company_type}
                    onChange={e => setF('company_type', e.target.value)}
                  >
                    {COMPANY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </WizardSelect>
                </div>
                <WizardInput
                  label="Website"
                  type="url"
                  placeholder="https://www.jensenvvs.dk"
                  value={form.website}
                  onChange={e => setF('website', e.target.value)}
                  optional
                />
                <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-blue-600" />
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Disse oplysninger vises på dine fakturaer og tilbud. Du kan altid ændre dem senere under Indstillinger.
                  </p>
                </div>
              </div>
            )}

            {/* ── Step 1: Faktureringsadresse ── */}
            {currentStep === 1 && (
              <div className="space-y-5">
                <WizardInput
                  label="Adresse"
                  placeholder="Testvej 1"
                  value={form.address}
                  onChange={e => setF('address', e.target.value)}
                  optional
                />
                <div className="grid grid-cols-3 gap-4">
                  <WizardInput
                    label="Postnummer"
                    placeholder="2100"
                    value={form.zip}
                    onChange={e => setF('zip', e.target.value)}
                    optional
                  />
                  <div className="col-span-2">
                    <WizardInput
                      label="By"
                      placeholder="København Ø"
                      value={form.city}
                      onChange={e => setF('city', e.target.value)}
                      optional
                    />
                  </div>
                </div>
                <WizardSelect
                  label="Land"
                  value={form.country}
                  onChange={e => setF('country', e.target.value)}
                >
                  {COUNTRIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </WizardSelect>
              </div>
            )}

            {/* ── Step 2: Faktura & Betaling ── */}
            {currentStep === 2 && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <WizardInput
                    label="Faktura-præfiks"
                    placeholder="FAKT"
                    value={form.invoice_prefix}
                    onChange={e => setF('invoice_prefix', e.target.value)}
                    hint='Fx "FAKT" → FAKT-0001'
                  />
                  <WizardInput
                    label="Betalingsfrist (dage)"
                    type="number"
                    min="1"
                    max="90"
                    placeholder="14"
                    value={form.invoice_due_days}
                    onChange={e => setF('invoice_due_days', e.target.value)}
                    hint="Standard antal dage til betaling"
                  />
                </div>

                <div className="border-t border-slate-100 pt-5">
                  <p className="text-sm font-semibold text-slate-700 mb-4">Bankoplysninger</p>
                  <div className="space-y-4">
                    <WizardInput
                      label="Banknavn"
                      placeholder="Danske Bank"
                      value={form.bank_name}
                      onChange={e => setF('bank_name', e.target.value)}
                      optional
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <WizardInput
                        label="Reg.nummer"
                        placeholder="1234"
                        value={form.bank_reg}
                        onChange={e => setF('bank_reg', e.target.value)}
                        optional
                      />
                      <WizardInput
                        label="Kontonummer"
                        placeholder="12345678"
                        value={form.bank_account}
                        onChange={e => setF('bank_account', e.target.value)}
                        optional
                      />
                    </div>
                  </div>
                </div>

                <WizardTextarea
                  label="Faktura-footer"
                  rows={3}
                  placeholder="Tak for handelen! Betaling er netto 14 dage..."
                  value={form.invoice_footer}
                  onChange={e => setF('invoice_footer', e.target.value)}
                  optional
                  hint="Vises nederst på alle fakturaer"
                />
              </div>
            )}

            {/* ── Step 3: Moms & Branding ── */}
            {currentStep === 3 && (
              <div className="space-y-5">
                {/* VAT toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Momsregistreret</p>
                    <p className="text-xs text-slate-500 mt-0.5">Slå til hvis virksomheden opkræver moms</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setF('vat_registered', !form.vat_registered)}
                    className={`relative w-12 h-6 rounded-full transition-all duration-200 focus:outline-none ${
                      form.vat_registered ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${
                      form.vat_registered ? 'left-7' : 'left-1'
                    }`} />
                  </button>
                </div>

                {form.vat_registered && (
                  <div className="grid grid-cols-2 gap-4">
                    <WizardInput
                      label="Momssats (%)"
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      placeholder="25"
                      value={form.default_tax_rate}
                      onChange={e => setF('default_tax_rate', e.target.value)}
                      hint="Standard: 25% (dansk moms)"
                    />
                    <WizardInput
                      label="Momsnummer"
                      placeholder="DK12345678"
                      value={form.vat_number}
                      onChange={e => setF('vat_number', e.target.value)}
                      optional
                      hint="EU-momsnummer til B2B-fakturaer"
                    />
                  </div>
                )}

                <div className="border-t border-slate-100 pt-5">
                  <p className="text-sm font-semibold text-slate-700 mb-4">Branding</p>
                  <WizardInput
                    label="Logo URL"
                    type="url"
                    placeholder="https://www.jensenvvs.dk/logo.png"
                    value={form.logo_url}
                    onChange={e => setF('logo_url', e.target.value)}
                    optional
                    hint="Link til dit logo — vises på fakturaer og tilbud"
                  />
                  {form.logo_url && (
                    <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
                      <img
                        src={form.logo_url}
                        alt="Logo preview"
                        className="w-10 h-10 object-contain rounded"
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                      <p className="text-xs text-slate-500 truncate">{form.logo_url}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Tilbage
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSkip}
                  className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                  {isLast ? 'Spring over og afslut' : 'Spring dette over'}
                </button>

                <button
                  onClick={handleNext}
                  disabled={saving}
                  className="flex items-center gap-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-xl transition-all shadow-md shadow-blue-200"
                >
                  {saving ? (
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : null}
                  {isLast ? 'Afslut opsætning' : 'Gem og fortsæt'}
                  {!isLast && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Progress footer */}
          <div className="bg-slate-50/60 border-t border-slate-100 px-8 py-3 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Trin {currentStep + 1} af {WIZARD_STEPS.length}
            </p>
            <div className="flex gap-1.5">
              {WIZARD_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i < currentStep ? 'w-4 bg-emerald-400' :
                    i === currentStep ? 'w-6 bg-blue-500' :
                    'w-4 bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

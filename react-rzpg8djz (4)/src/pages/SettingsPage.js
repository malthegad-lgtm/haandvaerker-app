import { useState } from 'react';
import { Building2, User, Shield, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Card, PageHeader, Button, Input, Textarea, Alert, Avatar, Tabs } from '../components/ui';

const TABS = [
  { value: 'company', label: 'Virksomhed' },
  { value: 'profile', label: 'Min profil' },
  { value: 'security', label: 'Sikkerhed' },
];

export default function SettingsPage() {
  const { company, profile, updateCompany, updateProfile, session } = useAuth();
  const [activeTab, setActiveTab] = useState('company');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [companyForm, setCompanyForm] = useState({
    name: company?.name || '',
    phone: company?.phone || '',
    email: company?.email || '',
    address: company?.address || '',
    city: company?.city || '',
    zip: company?.zip || '',
    vat_number: company?.vat_number || '',
  });

  const [profileForm, setProfileForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    job_title: profile?.job_title || '',
  });

  const [pwForm, setPwForm] = useState({ password: '', confirm: '' });

  const setC = (k, v) => setCompanyForm(f => ({ ...f, [k]: v }));
  const setP = (k, v) => setProfileForm(f => ({ ...f, [k]: v }));

  const notify = (msg, isError = false) => {
    if (isError) { setError(msg); setSuccess(''); }
    else { setSuccess(msg); setError(''); }
    setTimeout(() => { setSuccess(''); setError(''); }, 4000);
  };

  const saveCompany = async () => {
    setSaving(true);
    const { error: err } = await updateCompany(companyForm);
    setSaving(false);
    if (err) notify(err.message, true);
    else notify('Virksomhedsoplysninger gemt.');
  };

  const saveProfile = async () => {
    setSaving(true);
    const { error: err } = await updateProfile(profileForm);
    setSaving(false);
    if (err) notify(err.message, true);
    else notify('Profiloplysninger gemt.');
  };

  const savePassword = async () => {
    if (pwForm.password.length < 6) { notify('Adgangskode skal være mindst 6 tegn.', true); return; }
    if (pwForm.password !== pwForm.confirm) { notify('Adgangskoderne stemmer ikke overens.', true); return; }
    setSaving(true);
    const { error: err } = await supabase.auth.updateUser({ password: pwForm.password });
    setSaving(false);
    if (err) notify(err.message, true);
    else { notify('Adgangskode opdateret.'); setPwForm({ password: '', confirm: '' }); }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader title="Indstillinger" subtitle="Administrer din virksomhed og profil" />

      {success && <Alert variant="success">{success}</Alert>}
      {error && <Alert variant="error">{error}</Alert>}

      <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'company' && (
        <Card>
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{company?.name}</h3>
              <p className="text-sm text-slate-500">Virksomhedsprofil</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Input className="col-span-2" label="Virksomhedsnavn" value={companyForm.name} onChange={e => setC('name', e.target.value)} />
              <Input label="Telefon" value={companyForm.phone} onChange={e => setC('phone', e.target.value)} placeholder="+45 12 34 56 78" />
              <Input label="Email" type="email" value={companyForm.email} onChange={e => setC('email', e.target.value)} placeholder="kontakt@firma.dk" />
              <Input className="col-span-2" label="Adresse" value={companyForm.address} onChange={e => setC('address', e.target.value)} placeholder="Testvej 1" />
              <Input label="Postnummer" value={companyForm.zip} onChange={e => setC('zip', e.target.value)} placeholder="2100" />
              <Input label="By" value={companyForm.city} onChange={e => setC('city', e.target.value)} placeholder="København" />
              <Input label="CVR-nummer" value={companyForm.vat_number} onChange={e => setC('vat_number', e.target.value)} placeholder="12345678" />
            </div>
          </div>

          <div className="flex justify-end mt-6 pt-6 border-t border-slate-100">
            <Button icon={Save} loading={saving} onClick={saveCompany}>Gem ændringer</Button>
          </div>
        </Card>
      )}

      {activeTab === 'profile' && (
        <Card>
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
            <Avatar name={profile?.full_name || profile?.email} size="lg" />
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{profile?.full_name || 'Din profil'}</h3>
              <p className="text-sm text-slate-500">{session?.user?.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input className="col-span-2" label="Fulde navn" value={profileForm.full_name} onChange={e => setP('full_name', e.target.value)} placeholder="Jens Jensen" />
              <Input label="Telefon" value={profileForm.phone} onChange={e => setP('phone', e.target.value)} placeholder="+45 12 34 56 78" />
              <Input label="Stillingsbetegnelse" value={profileForm.job_title} onChange={e => setP('job_title', e.target.value)} placeholder="VVS-installatør" />
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-sm text-slate-600">
                <strong>Email:</strong> {session?.user?.email}
              </p>
              <p className="text-xs text-slate-400 mt-1">Din email kan ikke ændres herfra. Kontakt support.</p>
            </div>
          </div>

          <div className="flex justify-end mt-6 pt-6 border-t border-slate-100">
            <Button icon={Save} loading={saving} onClick={saveProfile}>Gem profil</Button>
          </div>
        </Card>
      )}

      {activeTab === 'security' && (
        <Card>
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Sikkerhed</h3>
              <p className="text-sm text-slate-500">Administrer din adgangskode</p>
            </div>
          </div>

          <div className="space-y-4 max-w-sm">
            <Input
              label="Ny adgangskode"
              type="password"
              placeholder="Mindst 6 tegn"
              value={pwForm.password}
              onChange={e => setPwForm(f => ({ ...f, password: e.target.value }))}
            />
            <Input
              label="Bekræft ny adgangskode"
              type="password"
              placeholder="Gentag adgangskode"
              value={pwForm.confirm}
              onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
            />
          </div>

          <div className="flex justify-end mt-6 pt-6 border-t border-slate-100">
            <Button loading={saving} onClick={savePassword}>Opdater adgangskode</Button>
          </div>
        </Card>
      )}
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { UserCheck, Plus, Mail, Phone, Briefcase } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import {
  Card, PageHeader, Button, Modal, Input, Select,
  EmptyState, SkeletonRow, Avatar, AvailabilityBadge,
  AVAILABILITY_STATUSES, Alert,
} from '../components/ui';

const ROLES = [
  { value: 'owner', label: 'Ejer' },
  { value: 'manager', label: 'Leder' },
  { value: 'employee', label: 'Medarbejder' },
];

export default function EmployeesPage() {
  const { company, profile: currentProfile } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('employee');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const load = useCallback(async () => {
    if (!company?.id) return;
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('company_id', company.id)
      .order('full_name');
    setEmployees(data || []);
    setLoading(false);
  }, [company?.id]);

  useEffect(() => { load(); }, [load]);

  const updateAvailability = async (id, status) => {
    await supabase.from('profiles').update({ availability_status: status, updated_at: new Date().toISOString() }).eq('id', id);
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, availability_status: status } : e));
    if (showDetail?.id === id) setShowDetail(d => ({ ...d, availability_status: status }));
  };

  const filtered = filterStatus === 'all' ? employees : employees.filter(e => e.availability_status === filterStatus);

  const isOwnerOrManager = ['owner', 'manager', 'super_admin'].includes(currentProfile?.role);

  return (
    <div className="space-y-6">
      <PageHeader title="Medarbejdere" subtitle={`${employees.length} ansatte i din virksomhed`}>
        {isOwnerOrManager && (
          <Button icon={Plus} onClick={() => setShowInvite(true)}>Inviter medarbejder</Button>
        )}
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'I alt', count: employees.length, color: 'slate' },
          { label: 'Tilgængelige', count: employees.filter(e => e.availability_status === 'available').length, color: 'emerald' },
          { label: 'På job', count: employees.filter(e => e.availability_status === 'on_job' || e.availability_status === 'busy').length, color: 'blue' },
          { label: 'Fraværende', count: employees.filter(e => ['sick', 'vacation', 'offline'].includes(e.availability_status)).length, color: 'rose' },
        ].map(({ label, count, color }) => (
          <Card key={label}>
            <p className="text-2xl font-bold text-slate-900">{count}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </Card>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {[{ value: 'all', label: 'Alle' }, ...AVAILABILITY_STATUSES].map(s => (
          <button
            key={s.value}
            onClick={() => setFilterStatus(s.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filterStatus === s.value
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Employee list */}
      <Card padding={false}>
        {loading ? (
          <div className="divide-y divide-slate-100">{[1,2,3].map(i => <SkeletonRow key={i} />)}</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={UserCheck}
            title="Ingen medarbejdere"
            description="Inviter din første medarbejder for at begynde at tildele jobs."
            action={isOwnerOrManager && <Button icon={Plus} onClick={() => setShowInvite(true)}>Inviter nu</Button>}
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map(emp => (
              <div
                key={emp.id}
                onClick={() => setShowDetail(emp)}
                className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <Avatar name={emp.full_name || emp.email} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">
                    {emp.full_name || 'Ikke udfyldt'}
                    {emp.id === currentProfile?.id && (
                      <span className="ml-2 text-xs text-slate-400">(dig)</span>
                    )}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
                    <span className="capitalize">{ROLES.find(r => r.value === emp.role)?.label || emp.role}</span>
                    {emp.job_title && <><span>·</span><span>{emp.job_title}</span></>}
                    {emp.email && <><span>·</span><span>{emp.email}</span></>}
                  </div>
                </div>
                <AvailabilityBadge status={emp.availability_status || 'offline'} />
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Invite modal */}
      <Modal
        open={showInvite}
        onClose={() => { setShowInvite(false); setError(''); setInviteEmail(''); }}
        title="Inviter medarbejder"
        subtitle="Medarbejderen vil modtage en email-invitation"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowInvite(false)}>Annuller</Button>
            <Button
              loading={saving}
              onClick={async () => {
                if (!inviteEmail) { setError('Email er påkrævet.'); return; }
                setError('');
                setSaving(true);
                const { error: err } = await supabase.auth.admin?.inviteUserByEmail?.(inviteEmail) || {};
                if (err) setError('Invitation kræver Supabase Admin-rettigheder. Bed medarbejderen om at oprette en konto med firmakoden.');
                else { setShowInvite(false); setInviteEmail(''); }
                setSaving(false);
              }}
            >
              Send invitation
            </Button>
          </div>
        }
      >
        {error && <Alert variant="error">{error}</Alert>}
        <Alert variant="info">
          Del din virksomhedskode eller bed medarbejderen om at oprette en konto og derefter kontakt dig for at blive tilknyttet virksomheden.
        </Alert>
        <Input label="Email-adresse" type="email" placeholder="medarbejder@email.dk" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
        <Select label="Rolle" value={inviteRole} onChange={e => setInviteRole(e.target.value)}>
          {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </Select>
      </Modal>

      {/* Detail panel */}
      {showDetail && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-slate-900/50" onClick={() => setShowDetail(null)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <Avatar name={showDetail.full_name || showDetail.email} size="lg" />
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{showDetail.full_name || 'Ingen navn'}</h3>
                  <p className="text-sm text-slate-500 capitalize">{ROLES.find(r => r.value === showDetail.role)?.label || showDetail.role}</p>
                </div>
              </div>
              <button onClick={() => setShowDetail(null)} className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg">
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>
            <div className="flex-1 p-6 space-y-6">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Status</p>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABILITY_STATUSES.map(s => (
                    <button
                      key={s.value}
                      onClick={() => updateAvailability(showDetail.id, s.value)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                        (showDetail.availability_status || 'offline') === s.value
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              {showDetail.email && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Email</p>
                  <p className="text-sm text-slate-900">{showDetail.email}</p>
                </div>
              )}
              {showDetail.phone && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Telefon</p>
                  <p className="text-sm text-slate-900">{showDetail.phone}</p>
                </div>
              )}
              {showDetail.job_title && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Stilling</p>
                  <p className="text-sm text-slate-900">{showDetail.job_title}</p>
                </div>
              )}
              <p className="text-xs text-slate-400">Oprettet {new Date(showDetail.created_at).toLocaleDateString('da-DK')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

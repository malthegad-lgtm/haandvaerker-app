import { useState, useEffect, useCallback } from 'react';
import { Users, Plus, Phone, Mail, MapPin, Search, Briefcase, TrendingUp, MoreHorizontal } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import {
  Card, PageHeader, Button, Modal, Input, Textarea,
  EmptyState, SkeletonRow, Avatar, formatDKK, Alert,
} from '../components/ui';

const EMPTY = { name: '', email: '', phone: '', address: '', city: '', zip: '', notes: '' };

export default function CustomersPage() {
  const { company } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [jobCounts, setJobCounts] = useState({});

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const load = useCallback(async () => {
    if (!company?.id) return;
    setLoading(true);
    const { data } = await supabase
      .from('customers')
      .select('*')
      .eq('company_id', company.id)
      .order('created_at', { ascending: false });
    setCustomers(data || []);

    const ids = (data || []).map(c => c.id);
    if (ids.length > 0) {
      const { data: jobs } = await supabase
        .from('jobs')
        .select('customer_id, status')
        .in('customer_id', ids);
      const counts = {};
      (jobs || []).forEach(j => {
        if (!counts[j.customer_id]) counts[j.customer_id] = { total: 0, completed: 0 };
        counts[j.customer_id].total++;
        if (j.status === 'completed' || j.status === 'invoiced') counts[j.customer_id].completed++;
      });
      setJobCounts(counts);
    }
    setLoading(false);
  }, [company?.id]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!form.name) { setError('Navn er påkrævet.'); return; }
    setError('');
    setSaving(true);
    const { error: err } = await supabase.from('customers').insert({
      company_id: company.id,
      name: form.name,
      email: form.email || null,
      phone: form.phone || null,
      address: form.address || null,
      city: form.city || null,
      zip: form.zip || null,
      notes: form.notes || null,
    });
    setSaving(false);
    if (err) { setError(err.message); return; }
    setShowCreate(false);
    setForm(EMPTY);
    load();
  };

  const filtered = customers.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) ||
    c.city?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Kunder" subtitle={`${customers.length} kunder i systemet`}>
        <Button icon={Plus} onClick={() => setShowCreate(true)}>Ny kunde</Button>
      </PageHeader>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 w-4.5 h-4.5 text-slate-400" />
        <input
          type="text"
          placeholder="Søg på navn, email, telefon eller by..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
        />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{customers.length}</p>
              <p className="text-xs text-slate-500">Kunder i alt</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {Object.values(jobCounts).reduce((s, c) => s + c.total, 0)}
              </p>
              <p className="text-xs text-slate-500">Jobs i alt</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {customers.length > 0
                  ? Math.round(Object.values(jobCounts).reduce((s, c) => s + c.total, 0) / customers.length * 10) / 10
                  : 0}
              </p>
              <p className="text-xs text-slate-500">Jobs/kunde (snit)</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Customer list */}
      <Card padding={false}>
        {loading ? (
          <div className="divide-y divide-slate-100">{[1,2,3,4].map(i => <SkeletonRow key={i} />)}</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title={search ? 'Ingen kunder matcher søgningen' : 'Ingen kunder endnu'}
            description={search ? '' : 'Tilføj din første kunde for at starte din kundebase.'}
            action={!search && <Button icon={Plus} onClick={() => setShowCreate(true)}>Tilføj kunde</Button>}
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map(c => {
              const counts = jobCounts[c.id] || { total: 0, completed: 0 };
              return (
                <div
                  key={c.id}
                  onClick={() => setShowDetail(c)}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <Avatar name={c.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{c.name}</p>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500 flex-wrap">
                      {c.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</span>}
                      {c.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</span>}
                      {c.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{c.city}</span>}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-slate-900">{counts.total} jobs</p>
                    <p className="text-xs text-slate-500">{counts.completed} afsluttet</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Create modal */}
      <Modal
        open={showCreate}
        onClose={() => { setShowCreate(false); setError(''); setForm(EMPTY); }}
        title="Ny kunde"
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowCreate(false)}>Annuller</Button>
            <Button loading={saving} onClick={handleCreate}>Opret kunde</Button>
          </div>
        }
      >
        {error && <Alert variant="error">{error}</Alert>}
        <div className="grid grid-cols-2 gap-4">
          <Input className="col-span-2" label="Navn *" placeholder="Lars Hansen" value={form.name} onChange={e => set('name', e.target.value)} />
          <Input label="Telefon" type="tel" placeholder="+45 12 34 56 78" value={form.phone} onChange={e => set('phone', e.target.value)} />
          <Input label="Email" type="email" placeholder="lars@email.dk" value={form.email} onChange={e => set('email', e.target.value)} />
          <Input className="col-span-2" label="Adresse" placeholder="Vesterbrogade 1" value={form.address} onChange={e => set('address', e.target.value)} />
          <Input label="Postnummer" placeholder="1620" value={form.zip} onChange={e => set('zip', e.target.value)} />
          <Input label="By" placeholder="København" value={form.city} onChange={e => set('city', e.target.value)} />
          <Textarea className="col-span-2" label="Noter" rows={3} placeholder="Interne noter om kunden..." value={form.notes} onChange={e => set('notes', e.target.value)} />
        </div>
      </Modal>

      {/* Detail panel */}
      {showDetail && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-slate-900/50" onClick={() => setShowDetail(null)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <Avatar name={showDetail.name} size="lg" />
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{showDetail.name}</h3>
                  {showDetail.city && <p className="text-sm text-slate-500">{showDetail.city}</p>}
                </div>
              </div>
              <button onClick={() => setShowDetail(null)} className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>
            <div className="flex-1 p-6 space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <DetailCard label="Jobs i alt" value={jobCounts[showDetail.id]?.total || 0} />
                <DetailCard label="Afsluttede" value={jobCounts[showDetail.id]?.completed || 0} />
              </div>
              {showDetail.phone && <DetailRow label="Telefon" value={showDetail.phone} />}
              {showDetail.email && <DetailRow label="Email" value={showDetail.email} />}
              {showDetail.address && (
                <DetailRow label="Adresse" value={[showDetail.address, showDetail.zip, showDetail.city].filter(Boolean).join(', ')} />
              )}
              {showDetail.notes && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Noter</p>
                  <p className="text-sm text-slate-700 bg-slate-50 rounded-xl p-4">{showDetail.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm text-slate-900">{value}</p>
    </div>
  );
}

function DetailCard({ label, value }) {
  return (
    <div className="bg-slate-50 rounded-xl p-4 text-center">
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Briefcase, Calendar, Clock, Users, MoreHorizontal,
  MapPin, AlertCircle, ChevronDown,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import {
  Card, PageHeader, Button, Modal, Input, Select, Textarea,
  JobStatusBadge, PriorityBadge, EmptyState, SkeletonRow, Tabs,
  JOB_STATUSES, PRIORITIES, Avatar, formatDKK, Dropdown, Alert,
} from '../components/ui';

const ALL_TABS = [
  { value: 'all', label: 'Alle' },
  { value: 'new', label: 'Nye' },
  { value: 'scheduled', label: 'Planlagt' },
  { value: 'in_progress', label: 'I gang' },
  { value: 'completed', label: 'Færdige' },
  { value: 'invoiced', label: 'Faktureret' },
];

const EMPTY_JOB = { customer_id: '', title: '', description: '', scheduled_date: '', scheduled_time: '', estimated_duration: '', address: '', priority: 'normal', notes: '', assigned_to: '' };

export default function JobsPage() {
  const { company, profile } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [form, setForm] = useState(EMPTY_JOB);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const load = useCallback(async () => {
    if (!company?.id) return;
    setLoading(true);
    const [{ data: jobsData }, { data: custsData }, { data: empsData }] = await Promise.all([
      supabase.from('jobs').select('*, customers(name, phone), job_assignments(employee_id, profiles(full_name))').eq('company_id', company.id).order('created_at', { ascending: false }),
      supabase.from('customers').select('id, name').eq('company_id', company.id).order('name'),
      supabase.from('profiles').select('id, full_name, availability_status').eq('company_id', company.id),
    ]);
    setJobs(jobsData || []);
    setCustomers(custsData || []);
    setEmployees(empsData || []);
    setLoading(false);
  }, [company?.id]);

  useEffect(() => { load(); }, [load]);

  const getNextJobNumber = async () => {
    const { count } = await supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('company_id', company.id);
    return `JOB-${String((count || 0) + 1).padStart(4, '0')}`;
  };

  const handleCreate = async () => {
    if (!form.title) { setError('Titel er påkrævet.'); return; }
    setError('');
    setSaving(true);
    const jobNumber = await getNextJobNumber();
    const { data: newJob, error: err } = await supabase.from('jobs').insert({
      company_id: company.id,
      customer_id: form.customer_id || null,
      job_number: jobNumber,
      title: form.title,
      description: form.description || null,
      scheduled_date: form.scheduled_date || null,
      scheduled_time: form.scheduled_time || null,
      estimated_duration: form.estimated_duration ? parseInt(form.estimated_duration) : null,
      address: form.address || null,
      priority: form.priority,
      notes: form.notes || null,
      status: 'new',
      created_by: profile.id,
    }).select().single();

    if (!err && newJob && form.assigned_to) {
      await supabase.from('job_assignments').insert({ job_id: newJob.id, employee_id: form.assigned_to });
    }

    setSaving(false);
    if (err) { setError(err.message); return; }
    setShowCreate(false);
    setForm(EMPTY_JOB);
    load();
  };

  const updateStatus = async (jobId, status) => {
    await supabase.from('jobs').update({ status, updated_at: new Date().toISOString() }).eq('id', jobId);
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status } : j));
    if (showDetail?.id === jobId) setShowDetail(d => ({ ...d, status }));
  };

  const filteredJobs = activeTab === 'all' ? jobs : jobs.filter(j => j.status === activeTab);

  const tabsWithCount = ALL_TABS.map(t => ({
    ...t,
    count: t.value === 'all' ? jobs.length : jobs.filter(j => j.status === t.value).length,
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Jobs & Dispatch" subtitle={`${jobs.length} jobs i alt`}>
        <Button icon={Plus} onClick={() => setShowCreate(true)}>Nyt job</Button>
      </PageHeader>

      <Tabs tabs={tabsWithCount} active={activeTab} onChange={setActiveTab} />

      <Card padding={false}>
        {loading ? (
          <div className="divide-y divide-slate-100">{[1,2,3,4].map(i => <SkeletonRow key={i} />)}</div>
        ) : filteredJobs.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title={activeTab === 'all' ? 'Ingen jobs endnu' : 'Ingen jobs med denne status'}
            description={activeTab === 'all' ? 'Opret dit første job for at komme i gang med at styre dine opgaver.' : ''}
            action={activeTab === 'all' && <Button icon={Plus} onClick={() => setShowCreate(true)}>Opret job</Button>}
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredJobs.map(job => {
              const assignee = job.job_assignments?.[0]?.profiles;
              return (
                <div
                  key={job.id}
                  onClick={() => setShowDetail(job)}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="text-xs font-mono font-medium text-slate-400">{job.job_number}</span>
                      <h3 className="text-sm font-semibold text-slate-900 truncate">{job.title}</h3>
                      <PriorityBadge priority={job.priority} />
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                      {job.customers?.name && (
                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{job.customers.name}</span>
                      )}
                      {job.scheduled_date && (
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{job.scheduled_date}</span>
                      )}
                      {job.scheduled_time && (
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{job.scheduled_time?.slice(0, 5)}</span>
                      )}
                      {job.address && (
                        <span className="flex items-center gap-1 truncate max-w-xs"><MapPin className="w-3.5 h-3.5 shrink-0" />{job.address}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {assignee && <Avatar name={assignee.full_name} size="sm" />}
                    <JobStatusBadge status={job.status} />
                    <Dropdown
                      trigger={
                        <button
                          onClick={e => e.stopPropagation()}
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      }
                      items={JOB_STATUSES.map(s => ({
                        label: `→ ${s.label}`,
                        onClick: (e) => { updateStatus(job.id, s.value); },
                      }))}
                    />
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
        onClose={() => { setShowCreate(false); setError(''); setForm(EMPTY_JOB); }}
        title="Nyt job"
        subtitle="Opret en ny opgave"
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowCreate(false)}>Annuller</Button>
            <Button loading={saving} onClick={handleCreate}>Opret job</Button>
          </div>
        }
      >
        {error && <Alert variant="error">{error}</Alert>}
        <div className="grid grid-cols-2 gap-4">
          <Input className="col-span-2" label="Titel *" placeholder="fx. Udskiftning af vandhane" value={form.title} onChange={e => set('title', e.target.value)} />
          <Select label="Kunde" value={form.customer_id} onChange={e => set('customer_id', e.target.value)}>
            <option value="">Vælg kunde...</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Select label="Prioritet" value={form.priority} onChange={e => set('priority', e.target.value)}>
            {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </Select>
          <Input label="Dato" type="date" value={form.scheduled_date} onChange={e => set('scheduled_date', e.target.value)} />
          <Input label="Tidspunkt" type="time" value={form.scheduled_time} onChange={e => set('scheduled_time', e.target.value)} />
          <Input label="Est. varighed (min)" type="number" placeholder="120" value={form.estimated_duration} onChange={e => set('estimated_duration', e.target.value)} />
          <Select label="Tildel medarbejder" value={form.assigned_to} onChange={e => set('assigned_to', e.target.value)}>
            <option value="">Ingen tildeling</option>
            {employees.map(e => <option key={e.id} value={e.id}>{e.full_name || e.id}</option>)}
          </Select>
          <Input className="col-span-2" label="Adresse" placeholder="Testvej 1, 2100 København" value={form.address} onChange={e => set('address', e.target.value)} />
          <Textarea className="col-span-2" label="Beskrivelse" rows={2} placeholder="Beskriv opgaven..." value={form.description} onChange={e => set('description', e.target.value)} />
          <Textarea className="col-span-2" label="Interne noter" rows={2} placeholder="Interne noter til holdet..." value={form.notes} onChange={e => set('notes', e.target.value)} />
        </div>
      </Modal>

      {/* Detail panel */}
      {showDetail && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-slate-900/50" onClick={() => setShowDetail(null)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
              <div>
                <p className="text-xs font-mono text-slate-400 mb-1">{showDetail.job_number}</p>
                <h3 className="text-lg font-semibold text-slate-900">{showDetail.title}</h3>
              </div>
              <button onClick={() => setShowDetail(null)} className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>
            <div className="flex-1 p-6 space-y-6">
              <div className="flex items-center gap-3">
                <JobStatusBadge status={showDetail.status} />
                <PriorityBadge priority={showDetail.priority} />
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Skift status</p>
                <div className="flex flex-wrap gap-2">
                  {JOB_STATUSES.map(s => (
                    <button
                      key={s.value}
                      onClick={() => updateStatus(showDetail.id, s.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        showDetail.status === s.value
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {showDetail.customers?.name && (
                <DetailRow label="Kunde" value={showDetail.customers.name} />
              )}
              {showDetail.scheduled_date && (
                <DetailRow label="Dato" value={`${showDetail.scheduled_date}${showDetail.scheduled_time ? ` kl. ${showDetail.scheduled_time?.slice(0,5)}` : ''}`} />
              )}
              {showDetail.address && <DetailRow label="Adresse" value={showDetail.address} />}
              {showDetail.estimated_duration && <DetailRow label="Estimeret tid" value={`${showDetail.estimated_duration} min`} />}
              {showDetail.description && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Beskrivelse</p>
                  <p className="text-sm text-slate-700 bg-slate-50 rounded-xl p-4">{showDetail.description}</p>
                </div>
              )}
              {showDetail.notes && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Interne noter</p>
                  <p className="text-sm text-slate-700 bg-amber-50 rounded-xl p-4 border border-amber-100">{showDetail.notes}</p>
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

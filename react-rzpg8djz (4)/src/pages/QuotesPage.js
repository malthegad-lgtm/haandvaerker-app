import { useState, useEffect, useCallback } from 'react';
import { FileText, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import {
  Card, PageHeader, Button, Modal, Input, Select, Textarea,
  EmptyState, SkeletonRow, Tabs, QuoteStatusBadge, formatDKK,
  QUOTE_STATUSES, Alert,
} from '../components/ui';

const ALL_TABS = [
  { value: 'all', label: 'Alle' },
  { value: 'draft', label: 'Kladder' },
  { value: 'sent', label: 'Sendte' },
  { value: 'accepted', label: 'Accepterede' },
  { value: 'rejected', label: 'Afviste' },
];

const EMPTY_ITEM = { description: '', quantity: '1', unit_price: '' };

export default function QuotesPage() {
  const { company, profile } = useAuth();
  const [quotes, setQuotes] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [detailItems, setDetailItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ customer_id: '', title: '', valid_until: '', notes: '', tax_rate: '25' });
  const [items, setItems] = useState([{ ...EMPTY_ITEM }]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const load = useCallback(async () => {
    if (!company?.id) return;
    setLoading(true);
    const [{ data: qData }, { data: cData }] = await Promise.all([
      supabase.from('quotes').select('*, customers(name)').eq('company_id', company.id).order('created_at', { ascending: false }),
      supabase.from('customers').select('id, name').eq('company_id', company.id).order('name'),
    ]);
    setQuotes(qData || []);
    setCustomers(cData || []);
    setLoading(false);
  }, [company?.id]);

  useEffect(() => { load(); }, [load]);

  const loadDetail = async (q) => {
    setShowDetail(q);
    const { data } = await supabase.from('quote_items').select('*').eq('quote_id', q.id);
    setDetailItems(data || []);
  };

  const calcTotals = (lineItems, taxRate) => {
    const sub = lineItems.reduce((s, i) => s + ((parseFloat(i.quantity)||0) * (parseFloat(i.unit_price)||0)), 0);
    const tax = Math.round(sub * (parseFloat(taxRate)||0) / 100);
    return { subtotal: Math.round(sub), taxAmount: tax, total: Math.round(sub) + tax };
  };

  const getNextNumber = async () => {
    const { count } = await supabase.from('quotes').select('*', { count: 'exact', head: true }).eq('company_id', company.id);
    return `TILB-${String((count||0)+1).padStart(4,'0')}`;
  };

  const handleCreate = async () => {
    if (!form.title) { setError('Titel er påkrævet.'); return; }
    const validItems = items.filter(i => i.description && i.unit_price);
    if (validItems.length === 0) { setError('Tilføj mindst ét linjeelement.'); return; }
    setError('');
    setSaving(true);
    const qNumber = await getNextNumber();
    const { subtotal, taxAmount, total } = calcTotals(validItems, form.tax_rate);
    const { data: q, error: qErr } = await supabase.from('quotes').insert({
      company_id: company.id,
      customer_id: form.customer_id || null,
      quote_number: qNumber,
      title: form.title,
      status: 'draft',
      subtotal, tax_rate: parseFloat(form.tax_rate)||25, tax_amount: taxAmount, total,
      valid_until: form.valid_until || null,
      notes: form.notes || null,
      created_by: profile.id,
    }).select().single();
    if (qErr) { setSaving(false); setError(qErr.message); return; }
    await supabase.from('quote_items').insert(
      validItems.map(i => ({
        quote_id: q.id,
        description: i.description,
        quantity: parseFloat(i.quantity)||1,
        unit_price: Math.round(parseFloat(i.unit_price)||0),
        total: Math.round((parseFloat(i.quantity)||0)*(parseFloat(i.unit_price)||0)),
      }))
    );
    setSaving(false);
    setShowCreate(false);
    setForm({ customer_id:'', title:'', valid_until:'', notes:'', tax_rate:'25' });
    setItems([{ ...EMPTY_ITEM }]);
    load();
  };

  const updateStatus = async (id, status) => {
    await supabase.from('quotes').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    setQuotes(prev => prev.map(q => q.id === id ? { ...q, status } : q));
    if (showDetail?.id === id) setShowDetail(d => ({ ...d, status }));
  };

  const filtered = activeTab === 'all' ? quotes : quotes.filter(q => q.status === activeTab);
  const tabsWithCount = ALL_TABS.map(t => ({ ...t, count: t.value === 'all' ? quotes.length : quotes.filter(q => q.status === t.value).length }));
  const { subtotal, taxAmount, total } = calcTotals(items.filter(i => i.unit_price), form.tax_rate);

  return (
    <div className="space-y-6">
      <PageHeader title="Tilbud" subtitle={`${quotes.length} tilbud i alt`}>
        <Button icon={Plus} onClick={() => setShowCreate(true)}>Nyt tilbud</Button>
      </PageHeader>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <p className="text-xs text-slate-500 mb-1">Afventende</p>
          <p className="text-2xl font-bold text-amber-600">{quotes.filter(q => q.status === 'sent').length}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500 mb-1">Accepterede</p>
          <p className="text-2xl font-bold text-emerald-600">{quotes.filter(q => q.status === 'accepted').length}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500 mb-1">Samlet tilbudsværdi</p>
          <p className="text-2xl font-bold text-blue-600">{formatDKK(quotes.filter(q => q.status !== 'rejected').reduce((s, q) => s + (q.total||0), 0))}</p>
        </Card>
      </div>

      <Tabs tabs={tabsWithCount} active={activeTab} onChange={setActiveTab} />

      <Card padding={false}>
        {loading ? (
          <div className="divide-y divide-slate-100">{[1,2,3].map(i => <SkeletonRow key={i} />)}</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={activeTab === 'all' ? 'Ingen tilbud endnu' : 'Ingen tilbud med denne status'}
            action={activeTab === 'all' && <Button icon={Plus} onClick={() => setShowCreate(true)}>Opret tilbud</Button>}
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map(q => (
              <div key={q.id} onClick={() => loadDetail(q)} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 cursor-pointer transition-colors">
                <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                  <FileText className="w-4.5 h-4.5 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900 truncate">{q.title}</p>
                    <QuoteStatusBadge status={q.status} />
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {q.quote_number} · {q.customers?.name || 'Ingen kunde'}
                    {q.valid_until && ` · Gyldig til: ${q.valid_until}`}
                  </p>
                </div>
                <p className="text-sm font-bold text-slate-900 shrink-0">{formatDKK(q.total)}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Create modal */}
      <Modal
        open={showCreate}
        onClose={() => { setShowCreate(false); setError(''); }}
        title="Nyt tilbud"
        size="xl"
        footer={
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-500">
              Total inkl. moms: <strong className="text-blue-600 text-base">{formatDKK(total)}</strong>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setShowCreate(false)}>Annuller</Button>
              <Button loading={saving} onClick={handleCreate}>Opret tilbud</Button>
            </div>
          </div>
        }
      >
        {error && <Alert variant="error">{error}</Alert>}
        <div className="grid grid-cols-2 gap-4">
          <Input className="col-span-2" label="Titel *" placeholder="Tilbud på VVS-installation" value={form.title} onChange={e => set('title', e.target.value)} />
          <Select label="Kunde" value={form.customer_id} onChange={e => set('customer_id', e.target.value)}>
            <option value="">Vælg kunde...</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Input label="Gyldig til" type="date" value={form.valid_until} onChange={e => set('valid_until', e.target.value)} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-slate-900">Linjeélementer</p>
            <Button variant="ghost" size="sm" icon={Plus} onClick={() => setItems(p => [...p, { ...EMPTY_ITEM }])}>Tilføj linje</Button>
          </div>
          <div className="space-y-2">
            <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-slate-500 px-1">
              <div className="col-span-6">Beskrivelse</div>
              <div className="col-span-2">Antal</div>
              <div className="col-span-3">Enhedspris</div>
              <div className="col-span-1" />
            </div>
            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-start">
                <input className="col-span-6 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Beskrivelse..." value={item.description} onChange={e => setItems(p => p.map((it, idx) => idx === i ? { ...it, description: e.target.value } : it))} />
                <input className="col-span-2 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" type="number" placeholder="1" value={item.quantity} onChange={e => setItems(p => p.map((it, idx) => idx === i ? { ...it, quantity: e.target.value } : it))} />
                <input className="col-span-3 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" type="number" placeholder="0" value={item.unit_price} onChange={e => setItems(p => p.map((it, idx) => idx === i ? { ...it, unit_price: e.target.value } : it))} />
                <button onClick={() => items.length > 1 && setItems(p => p.filter((_, idx) => idx !== i))} className="col-span-1 p-2 text-slate-400 hover:text-red-500 transition-colors disabled:opacity-30" disabled={items.length === 1}><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>
        <Textarea label="Noter" rows={2} placeholder="Betingelser, forbehold, etc." value={form.notes} onChange={e => set('notes', e.target.value)} />
      </Modal>

      {/* Detail panel */}
      {showDetail && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-slate-900/50" onClick={() => setShowDetail(null)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
              <div>
                <p className="text-xs font-mono text-slate-400 mb-1">{showDetail.quote_number}</p>
                <h3 className="text-lg font-semibold text-slate-900">{showDetail.title}</h3>
                <p className="text-sm text-slate-500">{showDetail.customers?.name}</p>
              </div>
              <button onClick={() => setShowDetail(null)} className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg"><Plus className="w-5 h-5 rotate-45" /></button>
            </div>
            <div className="flex-1 p-6 space-y-6">
              <div className="flex items-center justify-between">
                <QuoteStatusBadge status={showDetail.status} />
                <p className="text-2xl font-bold text-slate-900">{formatDKK(showDetail.total)}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {['draft','sent','accepted','rejected'].map(s => (
                  <button key={s} onClick={() => updateStatus(showDetail.id, s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${showDetail.status === s ? 'bg-blue-600 text-white border-blue-600' : 'text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50'}`}>
                    {QUOTE_STATUSES.find(q => q.value === s)?.label || s}
                  </button>
                ))}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Linjeélementer</p>
                <div className="space-y-2">
                  {detailItems.map(item => (
                    <div key={item.id} className="flex justify-between items-start py-2 border-b border-slate-100 last:border-0">
                      <div>
                        <p className="text-sm text-slate-900">{item.description}</p>
                        <p className="text-xs text-slate-500">{item.quantity} × {formatDKK(item.unit_price)}</p>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">{formatDKK(item.total)}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{formatDKK(showDetail.subtotal)}</span></div>
                <div className="flex justify-between text-slate-600"><span>Moms ({showDetail.tax_rate}%)</span><span>{formatDKK(showDetail.tax_amount)}</span></div>
                <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-200"><span>I alt</span><span className="text-blue-600">{formatDKK(showDetail.total)}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

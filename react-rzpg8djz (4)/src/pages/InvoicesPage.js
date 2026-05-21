import { useState, useEffect, useCallback } from 'react';
import { Receipt, Plus, Trash2, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import {
  Card, PageHeader, Button, Modal, Input, Select, Textarea,
  EmptyState, SkeletonRow, Tabs, InvoiceStatusBadge, formatDKK,
  INVOICE_STATUSES, Alert,
} from '../components/ui';

const ALL_TABS = [
  { value: 'all', label: 'Alle' },
  { value: 'draft', label: 'Kladder' },
  { value: 'sent', label: 'Sendte' },
  { value: 'paid', label: 'Betalte' },
  { value: 'overdue', label: 'Forfaldne' },
];

const EMPTY_ITEM = { description: '', quantity: '1', unit_price: '' };

export default function InvoicesPage() {
  const { company, profile } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [detailItems, setDetailItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({ customer_id: '', due_date: '', notes: '', tax_rate: '25' });
  const [items, setItems] = useState([{ ...EMPTY_ITEM }]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const load = useCallback(async () => {
    if (!company?.id) return;
    setLoading(true);
    const [{ data: invData }, { data: custData }] = await Promise.all([
      supabase.from('invoices').select('*, customers(name)').eq('company_id', company.id).order('created_at', { ascending: false }),
      supabase.from('customers').select('id, name').eq('company_id', company.id).order('name'),
    ]);
    setInvoices(invData || []);
    setCustomers(custData || []);
    setLoading(false);
  }, [company?.id]);

  useEffect(() => { load(); }, [load]);

  const loadDetail = async (inv) => {
    setShowDetail(inv);
    const { data } = await supabase.from('invoice_items').select('*').eq('invoice_id', inv.id);
    setDetailItems(data || []);
  };

  const getNextInvoiceNumber = async () => {
    const { count } = await supabase.from('invoices').select('*', { count: 'exact', head: true }).eq('company_id', company.id);
    return `FAKT-${String((count || 0) + 1).padStart(4, '0')}`;
  };

  const calcTotals = (lineItems, taxRate) => {
    const subtotal = lineItems.reduce((s, i) => s + ((parseFloat(i.quantity) || 0) * (parseFloat(i.unit_price) || 0)), 0);
    const taxAmount = Math.round(subtotal * (parseFloat(taxRate) || 0) / 100);
    return { subtotal: Math.round(subtotal), taxAmount, total: Math.round(subtotal) + taxAmount };
  };

  const handleCreate = async () => {
    const validItems = items.filter(i => i.description && i.unit_price);
    if (validItems.length === 0) { setError('Tilføj mindst ét linjeelement.'); return; }
    setError('');
    setSaving(true);

    const invoiceNumber = await getNextInvoiceNumber();
    const { subtotal, taxAmount, total } = calcTotals(validItems, form.tax_rate);

    const { data: inv, error: invErr } = await supabase.from('invoices').insert({
      company_id: company.id,
      customer_id: form.customer_id || null,
      invoice_number: invoiceNumber,
      status: 'draft',
      subtotal,
      tax_rate: parseFloat(form.tax_rate) || 25,
      tax_amount: taxAmount,
      total,
      due_date: form.due_date || null,
      notes: form.notes || null,
      created_by: profile.id,
    }).select().single();

    if (invErr) { setSaving(false); setError(invErr.message); return; }

    await supabase.from('invoice_items').insert(
      validItems.map(i => ({
        invoice_id: inv.id,
        description: i.description,
        quantity: parseFloat(i.quantity) || 1,
        unit_price: Math.round(parseFloat(i.unit_price) || 0),
        total: Math.round((parseFloat(i.quantity) || 0) * (parseFloat(i.unit_price) || 0)),
      }))
    );

    setSaving(false);
    setShowCreate(false);
    setForm({ customer_id: '', due_date: '', notes: '', tax_rate: '25' });
    setItems([{ ...EMPTY_ITEM }]);
    load();
  };

  const updateStatus = async (id, status, extra = {}) => {
    await supabase.from('invoices').update({ status, ...extra, updated_at: new Date().toISOString() }).eq('id', id);
    setInvoices(prev => prev.map(i => i.id === id ? { ...i, status, ...extra } : i));
    if (showDetail?.id === id) setShowDetail(d => ({ ...d, status, ...extra }));
  };

  const filteredInvoices = activeTab === 'all' ? invoices : invoices.filter(i => i.status === activeTab);

  const totalOutstanding = invoices
    .filter(i => ['sent', 'overdue'].includes(i.status))
    .reduce((s, i) => s + (i.total || 0), 0);

  const totalPaid = invoices
    .filter(i => i.status === 'paid')
    .reduce((s, i) => s + (i.total || 0), 0);

  const tabsWithCount = ALL_TABS.map(t => ({
    ...t,
    count: t.value === 'all' ? invoices.length : invoices.filter(i => i.status === t.value).length,
  }));

  const currentItems = items;
  const { subtotal, taxAmount, total } = calcTotals(currentItems.filter(i => i.unit_price), form.tax_rate);

  return (
    <div className="space-y-6">
      <PageHeader title="Fakturaer" subtitle="Overblik over din fakturering">
        <Button icon={Plus} onClick={() => setShowCreate(true)}>Ny faktura</Button>
      </PageHeader>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <p className="text-xs text-slate-500 mb-1">Betalt (total)</p>
          <p className="text-2xl font-bold text-emerald-600">{formatDKK(totalPaid)}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500 mb-1">Udestående</p>
          <p className="text-2xl font-bold text-amber-600">{formatDKK(totalOutstanding)}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500 mb-1">Forfaldne fakturaer</p>
          <p className="text-2xl font-bold text-rose-600">
            {invoices.filter(i => i.status === 'overdue').length}
          </p>
        </Card>
      </div>

      <Tabs tabs={tabsWithCount} active={activeTab} onChange={setActiveTab} />

      <Card padding={false}>
        {loading ? (
          <div className="divide-y divide-slate-100">{[1,2,3].map(i => <SkeletonRow key={i} />)}</div>
        ) : filteredInvoices.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title={activeTab === 'all' ? 'Ingen fakturaer endnu' : 'Ingen fakturaer med denne status'}
            action={activeTab === 'all' && <Button icon={Plus} onClick={() => setShowCreate(true)}>Opret faktura</Button>}
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredInvoices.map(inv => (
              <div
                key={inv.id}
                onClick={() => loadDetail(inv)}
                className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                  <Receipt className="w-4.5 h-4.5 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">{inv.invoice_number}</p>
                    <InvoiceStatusBadge status={inv.status} />
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {inv.customers?.name || 'Ingen kunde'}
                    {inv.due_date && ` · Forfald: ${inv.due_date}`}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-slate-900">{formatDKK(inv.total)}</p>
                  {inv.status === 'paid' && inv.paid_at && (
                    <p className="text-xs text-emerald-600">Betalt {new Date(inv.paid_at).toLocaleDateString('da-DK')}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Create modal */}
      <Modal
        open={showCreate}
        onClose={() => { setShowCreate(false); setError(''); }}
        title="Ny faktura"
        size="xl"
        footer={
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-500">
              Subtotal: <strong className="text-slate-900">{formatDKK(subtotal)}</strong>
              {' · '}Moms ({form.tax_rate}%): <strong className="text-slate-900">{formatDKK(taxAmount)}</strong>
              {' · '}Total: <strong className="text-blue-600 text-base">{formatDKK(total)}</strong>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setShowCreate(false)}>Annuller</Button>
              <Button loading={saving} onClick={handleCreate}>Opret faktura</Button>
            </div>
          </div>
        }
      >
        {error && <Alert variant="error">{error}</Alert>}
        <div className="grid grid-cols-2 gap-4">
          <Select label="Kunde" value={form.customer_id} onChange={e => set('customer_id', e.target.value)}>
            <option value="">Vælg kunde...</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Input label="Forfaldsdato" type="date" value={form.due_date} onChange={e => set('due_date', e.target.value)} />
          <Input label="Momssats (%)" type="number" value={form.tax_rate} onChange={e => set('tax_rate', e.target.value)} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-slate-900">Linjeélementer</p>
            <Button variant="ghost" size="sm" icon={Plus} onClick={() => setItems(prev => [...prev, { ...EMPTY_ITEM }])}>
              Tilføj linje
            </Button>
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
                <input
                  className="col-span-6 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Beskrivelse af arbejde..."
                  value={item.description}
                  onChange={e => setItems(prev => prev.map((it, idx) => idx === i ? { ...it, description: e.target.value } : it))}
                />
                <input
                  className="col-span-2 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="number"
                  placeholder="1"
                  value={item.quantity}
                  onChange={e => setItems(prev => prev.map((it, idx) => idx === i ? { ...it, quantity: e.target.value } : it))}
                />
                <input
                  className="col-span-3 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="number"
                  placeholder="0"
                  value={item.unit_price}
                  onChange={e => setItems(prev => prev.map((it, idx) => idx === i ? { ...it, unit_price: e.target.value } : it))}
                />
                <button
                  onClick={() => items.length > 1 && setItems(prev => prev.filter((_, idx) => idx !== i))}
                  className="col-span-1 p-2 text-slate-400 hover:text-red-500 transition-colors disabled:opacity-30"
                  disabled={items.length === 1}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
        <Textarea label="Noter til faktura" rows={2} placeholder="Betalingsbetingelser, tak for handelen, etc." value={form.notes} onChange={e => set('notes', e.target.value)} />
      </Modal>

      {/* Detail panel */}
      {showDetail && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-slate-900/50" onClick={() => setShowDetail(null)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
              <div>
                <p className="text-xs font-mono text-slate-400 mb-1">{showDetail.invoice_number}</p>
                <h3 className="text-lg font-semibold text-slate-900">{showDetail.customers?.name || 'Ingen kunde'}</h3>
              </div>
              <button onClick={() => setShowDetail(null)} className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg">
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>
            <div className="flex-1 p-6 space-y-6">
              <div className="flex items-center justify-between">
                <InvoiceStatusBadge status={showDetail.status} />
                <p className="text-2xl font-bold text-slate-900">{formatDKK(showDetail.total)}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {['draft', 'sent', 'paid', 'overdue'].map(s => (
                  <button
                    key={s}
                    onClick={() => updateStatus(showDetail.id, s, s === 'paid' ? { paid_at: new Date().toISOString() } : {})}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      showDetail.status === s
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    {INVOICE_STATUSES.find(i => i.value === s)?.label || s}
                  </button>
                ))}
              </div>

              {showDetail.due_date && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Forfaldsdato</p>
                  <p className="text-sm text-slate-900">{showDetail.due_date}</p>
                </div>
              )}

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
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span><span>{formatDKK(showDetail.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Moms ({showDetail.tax_rate}%)</span><span>{formatDKK(showDetail.tax_amount)}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>I alt</span><span className="text-blue-600">{formatDKK(showDetail.total)}</span>
                </div>
              </div>

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

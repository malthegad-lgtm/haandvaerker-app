import React, { useMemo, useState } from 'react';
import { Calendar, Users, Plus, Phone, Mail, MapPin, Clock, CircleCheck as CheckCircle2, Wrench, TrendingUp, X } from 'lucide-react';

const STATUS = { PLANNED: 'planlagt', DONE: 'færdig' };

const TABS = [
  { id: 'dashboard', label: 'Oversigt', icon: TrendingUp },
  { id: 'bookings', label: 'Bookinger', icon: Calendar },
  { id: 'customers', label: 'Kunder', icon: Users },
];

const EMPTY_BOOKING = { customer: '', task: '', date: '', time: '', price: '', materials: [] };
const EMPTY_CUSTOMER = { name: '', phone: '', email: '', address: '' };
const EMPTY_MATERIAL = { name: '', quantity: '', unitPrice: '' };

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-stone-900/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-bold text-stone-900">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Luk"
            className="text-stone-500 hover:text-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-3">{children}</div>
      </div>
    </div>
  );
}

function StatCard({ label, value, note, noteColor = 'text-stone-500' }) {
  return (
    <div className="bg-white p-6 rounded-lg border border-stone-200 shadow-sm">
      <p className="text-sm uppercase tracking-wider text-stone-500 mb-2">{label}</p>
      <p className="text-3xl font-bold text-stone-900">{value}</p>
      {note && <p className={`text-xs mt-2 ${noteColor}`}>{note}</p>}
    </div>
  );
}

function PageHeader({ title, subtitle, buttonLabel, onButtonClick }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-bold text-stone-900 mb-1">{title}</h2>
        <p className="text-stone-500">{subtitle}</p>
      </div>
      <button
        onClick={onButtonClick}
        className="bg-amber-500 hover:bg-amber-600 text-stone-900 font-semibold px-5 py-3 rounded-lg flex items-center gap-2 transition-colors"
      >
        <Plus className="w-5 h-5" />
        {buttonLabel}
      </button>
    </div>
  );
}

function InfoItem({ icon: Icon, text }) {
  return (
    <p className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-amber-600" />
      {text}
    </p>
  );
}

const inputClass = 'w-full p-3 border border-stone-300 rounded-lg';

function MaterialList({ materials }) {
  const totalCost = materials.reduce((sum, m) => sum + (parseInt(m.quantity) || 0) * (parseInt(m.unitPrice) || 0), 0);
  return (
    <div className="bg-stone-50 p-4 rounded-lg border border-stone-200">
      <p className="text-sm font-semibold text-stone-900 mb-2">Materialer</p>
      {materials.length === 0 ? (
        <p className="text-xs text-stone-500">Ingen materialer tilføjet</p>
      ) : (
        <div className="space-y-2">
          {materials.map((m, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-stone-700">{m.name}</span>
              <span className="text-stone-900 font-semibold">{((parseInt(m.quantity) || 0) * (parseInt(m.unitPrice) || 0)).toLocaleString('da-DK')} kr</span>
            </div>
          ))}
          <div className="pt-2 border-t border-stone-300 flex justify-between">
            <span className="text-sm font-bold text-stone-900">Total materialer</span>
            <span className="text-sm font-bold text-amber-600">{totalCost.toLocaleString('da-DK')} kr</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HaandvaerkerApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNewBooking, setShowNewBooking] = useState(false);
  const [showNewCustomer, setShowNewCustomer] = useState(false);

  const [customers, setCustomers] = useState([
    { id: 1, name: 'Lars Hansen', phone: '+45 22 33 44 55', email: 'lars@email.dk', address: 'Vesterbrogade 12, 1620 København' },
    { id: 2, name: 'Mette Sørensen', phone: '+45 31 22 11 99', email: 'mette@email.dk', address: 'Strandvejen 45, 2900 Hellerup' },
    { id: 3, name: 'Peter Nielsen', phone: '+45 26 78 90 12', email: 'peter@email.dk', address: 'Nørrebrogade 88, 2200 København N' },
  ]);

  const [bookings, setBookings] = useState([
    { id: 1, customer: 'Lars Hansen', task: 'Reparation af tag', date: '2026-05-20', time: '09:00', price: 4500, status: STATUS.PLANNED, materials: [{ name: 'Tagsten', quantity: '50', unitPrice: '25' }, { name: 'Mørtel', quantity: '10', unitPrice: '80' }] },
    { id: 2, customer: 'Mette Sørensen', task: 'Installation af køkken', date: '2026-05-22', time: '08:00', price: 18000, status: STATUS.PLANNED, materials: [] },
    { id: 3, customer: 'Peter Nielsen', task: 'Maling af stue', date: '2026-05-18', time: '10:00', price: 6800, status: STATUS.DONE, materials: [{ name: 'Maling', quantity: '20', unitPrice: '150' }] },
  ]);

  const [newBooking, setNewBooking] = useState(EMPTY_BOOKING);
  const [newCustomer, setNewCustomer] = useState(EMPTY_CUSTOMER);
  const [newMaterial, setNewMaterial] = useState(EMPTY_MATERIAL);

  const { totalRevenue, completedJobs, upcomingJobs, upcomingList } = useMemo(() => {
    let revenue = 0;
    let completed = 0;
    let upcoming = 0;
    const upcomingList = [];
    for (const b of bookings) {
      revenue += b.price;
      if (b.status === STATUS.DONE) {
        completed++;
      } else {
        upcoming++;
        if (upcomingList.length < 3) upcomingList.push(b);
      }
    }
    return { totalRevenue: revenue, completedJobs: completed, upcomingJobs: upcoming, upcomingList };
  }, [bookings]);

  const handleAddBooking = () => {
    if (!newBooking.customer || !newBooking.task || !newBooking.date) return;
    setBookings((prev) => [
      ...prev,
      { ...newBooking, id: Date.now(), price: parseInt(newBooking.price) || 0, status: STATUS.PLANNED, materials: [...newBooking.materials] },
    ]);
    setNewBooking(EMPTY_BOOKING);
    setShowNewBooking(false);
  };

  const handleAddMaterial = () => {
    if (!newMaterial.name || !newMaterial.quantity || !newMaterial.unitPrice) return;
    setNewBooking((prev) => ({
      ...prev,
      materials: [...prev.materials, { ...newMaterial }],
    }));
    setNewMaterial(EMPTY_MATERIAL);
  };

  const handleRemoveMaterial = (index) => {
    setNewBooking((prev) => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index),
    }));
  };

  const handleAddCustomer = () => {
    if (!newCustomer.name || !newCustomer.phone) return;
    setCustomers((prev) => [...prev, { ...newCustomer, id: Date.now() }]);
    setNewCustomer(EMPTY_CUSTOMER);
    setShowNewCustomer(false);
  };

  const toggleStatus = (id) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === id
          ? { ...b, status: b.status === STATUS.PLANNED ? STATUS.DONE : STATUS.PLANNED }
          : b
      )
    );
  };

  return (
    <div className="min-h-screen bg-stone-50 font-serif">
      <header className="bg-stone-900 text-stone-100 border-b-4 border-amber-500">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wrench className="w-7 h-7 text-amber-500" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Håndværker<span className="text-amber-500">Pro</span>
              </h1>
              <p className="text-xs text-stone-400 uppercase tracking-widest">Booking & Kundestyring</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-stone-400">Velkommen tilbage</p>
            <p className="font-semibold">Demo Bruger</p>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-4 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-amber-500 text-stone-900 font-semibold'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-stone-900 mb-1">Din oversigt</h2>
              <p className="text-stone-500">Her er hvad der sker i din virksomhed</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <StatCard
                label="Total omsætning"
                value={`${totalRevenue.toLocaleString('da-DK')} kr`}
                note="+12% denne måned"
                noteColor="text-amber-600"
              />
              <StatCard
                label="Kommende opgaver"
                value={upcomingJobs}
                note="Planlagte denne uge"
              />
              <StatCard
                label="Færdige opgaver"
                value={completedJobs}
                note="Total denne måned"
              />
            </div>

            <div className="bg-white p-6 rounded-lg border border-stone-200">
              <h3 className="text-lg font-bold text-stone-900 mb-4">Næste opgaver</h3>
              <div className="space-y-3">
                {upcomingList.map((b) => (
                  <div key={b.id} className="flex items-center justify-between py-3 border-b border-stone-100 last:border-0">
                    <div>
                      <p className="font-semibold text-stone-900">{b.task}</p>
                      <p className="text-sm text-stone-500">{b.customer} · {b.date} kl. {b.time}</p>
                    </div>
                    <p className="font-bold text-amber-600">{b.price.toLocaleString('da-DK')} kr</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <PageHeader
              title="Bookinger"
              subtitle="Administrer dine opgaver"
              buttonLabel="Ny booking"
              onButtonClick={() => setShowNewBooking(true)}
            />

            <div className="bg-white rounded-lg border border-stone-200 overflow-hidden">
              {bookings.map((b) => {
                const materialCost = b.materials.reduce((sum, m) => sum + (parseInt(m.quantity) || 0) * (parseInt(m.unitPrice) || 0), 0);
                const totalCost = b.price + materialCost;
                return (
                  <div key={b.id} className="p-5 border-b border-stone-100 last:border-0 hover:bg-stone-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-stone-900">{b.task}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold uppercase tracking-wider ${
                            b.status === STATUS.DONE
                              ? 'bg-green-100 text-green-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {b.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-stone-600">
                          <span className="flex items-center gap-1"><Users className="w-4 h-4" />{b.customer}</span>
                          <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{b.date}</span>
                          <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{b.time}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleStatus(b.id)}
                        className="text-stone-500 hover:text-green-600 transition-colors"
                        title="Markér som færdig"
                      >
                        <CheckCircle2 className="w-6 h-6" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-4 pt-3 border-t border-stone-100 text-sm">
                      <div>
                        <p className="text-stone-500 mb-1">Arbejdsomkostning</p>
                        <p className="font-bold text-stone-900">{b.price.toLocaleString('da-DK')} kr</p>
                      </div>
                      <div>
                        <p className="text-stone-500 mb-1">Materialer</p>
                        <p className="font-bold text-stone-900">{materialCost.toLocaleString('da-DK')} kr</p>
                      </div>
                      <div>
                        <p className="text-stone-500 mb-1">I alt</p>
                        <p className="font-bold text-amber-600 text-lg">{totalCost.toLocaleString('da-DK')} kr</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="space-y-6">
            <PageHeader
              title="Kunder"
              subtitle={`${customers.length} kunder i alt`}
              buttonLabel="Ny kunde"
              onButtonClick={() => setShowNewCustomer(true)}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customers.map((c) => (
                <div key={c.id} className="bg-white p-5 rounded-lg border border-stone-200 hover:border-amber-300 transition-colors">
                  <h3 className="font-bold text-stone-900 text-lg mb-3">{c.name}</h3>
                  <div className="space-y-2 text-sm text-stone-600">
                    <InfoItem icon={Phone} text={c.phone} />
                    <InfoItem icon={Mail} text={c.email} />
                    <InfoItem icon={MapPin} text={c.address} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {showNewBooking && (
        <Modal title="Ny booking" onClose={() => setShowNewBooking(false)}>
          <div className="max-h-96 overflow-y-auto space-y-3">
            <select
              value={newBooking.customer}
              onChange={(e) => setNewBooking({ ...newBooking, customer: e.target.value })}
              className={inputClass}
            >
              <option value="">Vælg kunde</option>
              {customers.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Opgave (fx. Maling af stue)"
              value={newBooking.task}
              onChange={(e) => setNewBooking({ ...newBooking, task: e.target.value })}
              className={inputClass}
            />
            <input
              type="date"
              value={newBooking.date}
              onChange={(e) => setNewBooking({ ...newBooking, date: e.target.value })}
              className={inputClass}
            />
            <input
              type="time"
              value={newBooking.time}
              onChange={(e) => setNewBooking({ ...newBooking, time: e.target.value })}
              className={inputClass}
            />
            <input
              type="number"
              placeholder="Arbejdsomkostning (kr)"
              value={newBooking.price}
              onChange={(e) => setNewBooking({ ...newBooking, price: e.target.value })}
              className={inputClass}
            />

            <div className="border-t border-stone-200 pt-3">
              <p className="text-sm font-semibold text-stone-900 mb-2">Materialer</p>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Materiale navn (fx. Maling)"
                  value={newMaterial.name}
                  onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                  className={inputClass}
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Mængde"
                    value={newMaterial.quantity}
                    onChange={(e) => setNewMaterial({ ...newMaterial, quantity: e.target.value })}
                    className={`${inputClass} flex-1`}
                  />
                  <input
                    type="number"
                    placeholder="Pris pr. stk"
                    value={newMaterial.unitPrice}
                    onChange={(e) => setNewMaterial({ ...newMaterial, unitPrice: e.target.value })}
                    className={`${inputClass} flex-1`}
                  />
                </div>
                <button
                  onClick={handleAddMaterial}
                  className="w-full bg-stone-200 hover:bg-stone-300 text-stone-900 font-semibold py-2 rounded transition-colors text-sm"
                >
                  + Tilføj materiale
                </button>
              </div>

              {newBooking.materials.length > 0 && (
                <div className="mt-3 space-y-2">
                  {newBooking.materials.map((m, i) => (
                    <div key={i} className="flex justify-between items-center bg-stone-50 p-2 rounded border border-stone-200 text-sm">
                      <span className="text-stone-900">{m.name} ({m.quantity}x {m.unitPrice} kr)</span>
                      <button
                        onClick={() => handleRemoveMaterial(i)}
                        className="text-red-600 hover:text-red-800 font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handleAddBooking}
            className="w-full bg-amber-500 hover:bg-amber-600 text-stone-900 font-semibold py-3 rounded-lg transition-colors mt-3"
          >
            Opret booking
          </button>
        </Modal>
      )}

      {showNewCustomer && (
        <Modal title="Ny kunde" onClose={() => setShowNewCustomer(false)}>
          <input
            type="text"
            placeholder="Navn"
            value={newCustomer.name}
            onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
            className={inputClass}
          />
          <input
            type="tel"
            placeholder="Telefon"
            value={newCustomer.phone}
            onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
            className={inputClass}
          />
          <input
            type="email"
            placeholder="Email"
            value={newCustomer.email}
            onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
            className={inputClass}
          />
          <input
            type="text"
            placeholder="Adresse"
            value={newCustomer.address}
            onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
            className={inputClass}
          />
          <button
            onClick={handleAddCustomer}
            className="w-full bg-amber-500 hover:bg-amber-600 text-stone-900 font-semibold py-3 rounded-lg transition-colors"
          >
            Opret kunde
          </button>
        </Modal>
      )}
    </div>
  );
}

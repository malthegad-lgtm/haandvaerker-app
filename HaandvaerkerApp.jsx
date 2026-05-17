import React, { useState } from 'react';
import { Calendar, Users, FileText, Plus, Phone, Mail, MapPin, Clock, CheckCircle2, Wrench, TrendingUp, X } from 'lucide-react';

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
    { id: 1, customer: 'Lars Hansen', task: 'Reparation af tag', date: '2026-05-20', time: '09:00', price: 4500, status: 'planlagt' },
    { id: 2, customer: 'Mette Sørensen', task: 'Installation af køkken', date: '2026-05-22', time: '08:00', price: 18000, status: 'planlagt' },
    { id: 3, customer: 'Peter Nielsen', task: 'Maling af stue', date: '2026-05-18', time: '10:00', price: 6800, status: 'færdig' },
  ]);

  const [newBooking, setNewBooking] = useState({ customer: '', task: '', date: '', time: '', price: '' });
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '', address: '' });

  const totalRevenue = bookings.reduce((sum, b) => sum + b.price, 0);
  const completedJobs = bookings.filter(b => b.status === 'færdig').length;
  const upcomingJobs = bookings.filter(b => b.status === 'planlagt').length;

  const handleAddBooking = () => {
    if (newBooking.customer && newBooking.task && newBooking.date) {
      setBookings([...bookings, { ...newBooking, id: Date.now(), price: parseInt(newBooking.price) || 0, status: 'planlagt' }]);
      setNewBooking({ customer: '', task: '', date: '', time: '', price: '' });
      setShowNewBooking(false);
    }
  };

  const handleAddCustomer = () => {
    if (newCustomer.name && newCustomer.phone) {
      setCustomers([...customers, { ...newCustomer, id: Date.now() }]);
      setNewCustomer({ name: '', phone: '', email: '', address: '' });
      setShowNewCustomer(false);
    }
  };

  const toggleStatus = (id) => {
    setBookings(bookings.map(b => b.id === id ? { ...b, status: b.status === 'planlagt' ? 'færdig' : 'planlagt' } : b));
  };

  return (
    <div className="min-h-screen bg-stone-50" style={{ fontFamily: 'Georgia, serif' }}>
      {/* Header */}
      <header className="bg-stone-900 text-stone-100 border-b-4 border-amber-500">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wrench className="w-7 h-7 text-amber-500" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Håndværker<span className="text-amber-500">Pro</span></h1>
              <p className="text-xs text-stone-400 uppercase tracking-widest">Booking & Kundestyring</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-stone-400">Velkommen tilbage</p>
            <p className="font-semibold">Demo Bruger</p>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 flex gap-1">
          {[
            { id: 'dashboard', label: 'Oversigt', icon: TrendingUp },
            { id: 'bookings', label: 'Bookinger', icon: Calendar },
            { id: 'customers', label: 'Kunder', icon: Users },
          ].map(tab => (
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
        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-stone-900 mb-1">Din oversigt</h2>
              <p className="text-stone-500">Her er hvad der sker i din virksomhed</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white p-6 rounded-lg border border-stone-200 shadow-sm">
                <p className="text-sm uppercase tracking-wider text-stone-500 mb-2">Total omsætning</p>
                <p className="text-3xl font-bold text-stone-900">{totalRevenue.toLocaleString('da-DK')} kr</p>
                <p className="text-xs text-amber-600 mt-2">+12% denne måned</p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-stone-200 shadow-sm">
                <p className="text-sm uppercase tracking-wider text-stone-500 mb-2">Kommende opgaver</p>
                <p className="text-3xl font-bold text-stone-900">{upcomingJobs}</p>
                <p className="text-xs text-stone-500 mt-2">Planlagte denne uge</p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-stone-200 shadow-sm">
                <p className="text-sm uppercase tracking-wider text-stone-500 mb-2">Færdige opgaver</p>
                <p className="text-3xl font-bold text-stone-900">{completedJobs}</p>
                <p className="text-xs text-stone-500 mt-2">Total denne måned</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-stone-200">
              <h3 className="text-lg font-bold text-stone-900 mb-4">Næste opgaver</h3>
              <div className="space-y-3">
                {bookings.filter(b => b.status === 'planlagt').slice(0, 3).map(b => (
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

        {/* Bookings */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-stone-900 mb-1">Bookinger</h2>
                <p className="text-stone-500">Administrer dine opgaver</p>
              </div>
              <button
                onClick={() => setShowNewBooking(true)}
                className="bg-amber-500 hover:bg-amber-600 text-stone-900 font-semibold px-5 py-3 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Ny booking
              </button>
            </div>

            <div className="bg-white rounded-lg border border-stone-200 overflow-hidden">
              {bookings.map(b => (
                <div key={b.id} className="p-5 border-b border-stone-100 last:border-0 hover:bg-stone-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-stone-900">{b.task}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold uppercase tracking-wider ${
                          b.status === 'færdig' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
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
                    <div className="flex items-center gap-4">
                      <p className="text-xl font-bold text-stone-900">{b.price.toLocaleString('da-DK')} kr</p>
                      <button
                        onClick={() => toggleStatus(b.id)}
                        className="text-stone-500 hover:text-green-600 transition-colors"
                        title="Markér som færdig"
                      >
                        <CheckCircle2 className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Customers */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-stone-900 mb-1">Kunder</h2>
                <p className="text-stone-500">{customers.length} kunder i alt</p>
              </div>
              <button
                onClick={() => setShowNewCustomer(true)}
                className="bg-amber-500 hover:bg-amber-600 text-stone-900 font-semibold px-5 py-3 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Ny kunde
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customers.map(c => (
                <div key={c.id} className="bg-white p-5 rounded-lg border border-stone-200 hover:border-amber-300 transition-colors">
                  <h3 className="font-bold text-stone-900 text-lg mb-3">{c.name}</h3>
                  <div className="space-y-2 text-sm text-stone-600">
                    <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-amber-600" />{c.phone}</p>
                    <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-amber-600" />{c.email}</p>
                    <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-amber-600" />{c.address}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* New Booking Modal */}
      {showNewBooking && (
        <div className="fixed inset-0 bg-stone-900/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-stone-900">Ny booking</h3>
              <button onClick={() => setShowNewBooking(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <select
                value={newBooking.customer}
                onChange={(e) => setNewBooking({ ...newBooking, customer: e.target.value })}
                className="w-full p-3 border border-stone-300 rounded-lg"
              >
                <option value="">Vælg kunde</option>
                {customers.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
              <input
                type="text"
                placeholder="Opgave (fx. Maling af stue)"
                value={newBooking.task}
                onChange={(e) => setNewBooking({ ...newBooking, task: e.target.value })}
                className="w-full p-3 border border-stone-300 rounded-lg"
              />
              <input
                type="date"
                value={newBooking.date}
                onChange={(e) => setNewBooking({ ...newBooking, date: e.target.value })}
                className="w-full p-3 border border-stone-300 rounded-lg"
              />
              <input
                type="time"
                value={newBooking.time}
                onChange={(e) => setNewBooking({ ...newBooking, time: e.target.value })}
                className="w-full p-3 border border-stone-300 rounded-lg"
              />
              <input
                type="number"
                placeholder="Pris (kr)"
                value={newBooking.price}
                onChange={(e) => setNewBooking({ ...newBooking, price: e.target.value })}
                className="w-full p-3 border border-stone-300 rounded-lg"
              />
              <button
                onClick={handleAddBooking}
                className="w-full bg-amber-500 hover:bg-amber-600 text-stone-900 font-semibold py-3 rounded-lg"
              >
                Opret booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Customer Modal */}
      {showNewCustomer && (
        <div className="fixed inset-0 bg-stone-900/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-stone-900">Ny kunde</h3>
              <button onClick={() => setShowNewCustomer(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Navn"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                className="w-full p-3 border border-stone-300 rounded-lg"
              />
              <input
                type="tel"
                placeholder="Telefon"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                className="w-full p-3 border border-stone-300 rounded-lg"
              />
              <input
                type="email"
                placeholder="Email"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                className="w-full p-3 border border-stone-300 rounded-lg"
              />
              <input
                type="text"
                placeholder="Adresse"
                value={newCustomer.address}
                onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                className="w-full p-3 border border-stone-300 rounded-lg"
              />
              <button
                onClick={handleAddCustomer}
                className="w-full bg-amber-500 hover:bg-amber-600 text-stone-900 font-semibold py-3 rounded-lg"
              >
                Opret kunde
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

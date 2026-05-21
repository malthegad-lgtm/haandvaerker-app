import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Bell, Plus, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar, Dropdown } from '../ui';

const PAGE_TITLES = {
  '/': 'Oversigt',
  '/jobs': 'Jobs & Dispatch',
  '/customers': 'Kunder',
  '/employees': 'Medarbejdere',
  '/quotes': 'Tilbud',
  '/invoices': 'Fakturaer',
  '/calendar': 'Kalender',
  '/settings': 'Indstillinger',
};

export default function Header({ onMenuToggle }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, company, signOut } = useAuth();

  const title = PAGE_TITLES[location.pathname] || 'HåndværkerPro';

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const userMenuItems = [
    { label: profile?.full_name || 'Min konto', icon: null, onClick: () => navigate('/settings'), divider: false },
    { divider: true },
    { label: 'Log ud', icon: null, onClick: handleSignOut, danger: true },
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 gap-4 shrink-0">
      {/* Mobile menu toggle */}
      <button
        onClick={onMenuToggle}
        className="text-slate-500 hover:text-slate-700 transition-colors md:hidden"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Page title */}
      <div className="flex-1">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {company && <p className="text-xs text-slate-400 -mt-0.5">{company.name}</p>}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button className="hidden md:flex items-center gap-2 text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg text-sm transition-colors">
          <Search className="w-4 h-4" />
          <span className="text-slate-400">Søg...</span>
          <kbd className="ml-4 text-xs text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded">⌘K</kbd>
        </button>

        <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
        </button>

        <Dropdown
          trigger={
            <button className="flex items-center gap-2.5 hover:bg-slate-100 rounded-xl px-2 py-1.5 transition-colors">
              <Avatar name={profile?.full_name || profile?.email} size="sm" />
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-slate-900 leading-tight">
                  {profile?.full_name?.split(' ')[0] || 'Konto'}
                </p>
                <p className="text-xs text-slate-400 capitalize">{profile?.role || 'employee'}</p>
              </div>
            </button>
          }
          items={userMenuItems}
        />
      </div>
    </header>
  );
}

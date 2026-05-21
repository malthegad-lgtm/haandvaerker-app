import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Briefcase, Users, UserCheck, FileText,
  Receipt, Calendar, Settings, Wrench, LogOut, ChevronRight,
  Building2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui';

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Oversigt', exact: true },
  { to: '/jobs', icon: Briefcase, label: 'Jobs & Dispatch' },
  { to: '/customers', icon: Users, label: 'Kunder' },
  { to: '/employees', icon: UserCheck, label: 'Medarbejdere' },
  { to: '/quotes', icon: FileText, label: 'Tilbud' },
  { to: '/invoices', icon: Receipt, label: 'Fakturaer' },
  { to: '/calendar', icon: Calendar, label: 'Kalender' },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { profile, company, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <aside className={`bg-slate-900 flex flex-col h-full transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-800">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
          <Wrench className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="text-white font-bold text-lg leading-none">
              Håndværker<span className="text-blue-400">Pro</span>
            </div>
            <div className="text-slate-500 text-xs mt-0.5 truncate">Business Platform</div>
          </div>
        )}
      </div>

      {/* Company pill */}
      {!collapsed && company && (
        <div className="mx-3 mt-4 flex items-center gap-2.5 bg-slate-800 rounded-xl px-3 py-2.5">
          <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center shrink-0">
            <Building2 className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="overflow-hidden">
            <p className="text-white text-sm font-semibold truncate">{company.name}</p>
            <p className="text-slate-400 text-xs capitalize truncate">{profile?.role || 'employee'}</p>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group
              ${isActive
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && (
                  <span className="text-sm font-medium truncate">{label}</span>
                )}
                {!collapsed && isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-60" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom: Settings + User */}
      <div className="px-3 pb-4 pt-2 border-t border-slate-800 space-y-0.5">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
              isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`
          }
        >
          <Settings className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Indstillinger</span>}
        </NavLink>

        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-3 mt-1">
            <Avatar name={profile?.full_name || profile?.email} size="sm" />
            <div className="flex-1 overflow-hidden">
              <p className="text-white text-sm font-medium truncate">
                {profile?.full_name || 'Min konto'}
              </p>
              <p className="text-slate-500 text-xs truncate">{profile?.email || ''}</p>
            </div>
            <button
              onClick={handleSignOut}
              title="Log ud"
              className="text-slate-500 hover:text-red-400 transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

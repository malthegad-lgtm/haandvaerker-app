import { X, AlertCircle, CheckCircle, Info, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

// ─── Button ───────────────────────────────────────────────────────────────────
const buttonVariants = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm',
  secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-sm',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm',
  success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm',
};
const buttonSizes = {
  xs: 'px-2.5 py-1.5 text-xs rounded-md gap-1',
  sm: 'px-3 py-2 text-sm rounded-lg gap-1.5',
  md: 'px-4 py-2.5 text-sm rounded-lg gap-2',
  lg: 'px-5 py-3 text-base rounded-lg gap-2',
};

export function Button({ variant = 'primary', size = 'md', className = '', disabled, loading, children, icon: Icon, ...props }) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${buttonVariants[variant]} ${buttonSizes[size]} ${className}`}
    >
      {loading ? (
        <svg className="animate-spin w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      {children}
    </button>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
const badgeVariants = {
  gray: 'bg-slate-100 text-slate-700',
  blue: 'bg-blue-50 text-blue-700',
  indigo: 'bg-indigo-50 text-indigo-700',
  cyan: 'bg-cyan-50 text-cyan-700',
  yellow: 'bg-yellow-50 text-yellow-700',
  orange: 'bg-orange-50 text-orange-700',
  green: 'bg-emerald-50 text-emerald-700',
  purple: 'bg-purple-50 text-purple-700',
  red: 'bg-red-50 text-red-700',
  amber: 'bg-amber-50 text-amber-700',
};

const dotColors = {
  gray: 'bg-slate-400', blue: 'bg-blue-500', indigo: 'bg-indigo-500',
  cyan: 'bg-cyan-500', yellow: 'bg-yellow-500', orange: 'bg-orange-500',
  green: 'bg-emerald-500', purple: 'bg-purple-500', red: 'bg-red-500', amber: 'bg-amber-500',
};

export function Badge({ variant = 'gray', dot = false, children, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${badgeVariants[variant]} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant]}`} />}
      {children}
    </span>
  );
}

// ─── Job / Invoice status helpers ─────────────────────────────────────────────
const JOB_STATUS = {
  new: { label: 'Ny', color: 'gray' },
  scheduled: { label: 'Planlagt', color: 'blue' },
  assigned: { label: 'Tildelt', color: 'indigo' },
  en_route: { label: 'På vej', color: 'cyan' },
  in_progress: { label: 'I gang', color: 'yellow' },
  waiting: { label: 'Afventer', color: 'orange' },
  completed: { label: 'Færdig', color: 'green' },
  invoiced: { label: 'Faktureret', color: 'purple' },
};

const INVOICE_STATUS = {
  draft: { label: 'Kladde', color: 'gray' },
  sent: { label: 'Sendt', color: 'blue' },
  paid: { label: 'Betalt', color: 'green' },
  overdue: { label: 'Forfalden', color: 'red' },
  cancelled: { label: 'Annulleret', color: 'gray' },
};

const QUOTE_STATUS = {
  draft: { label: 'Kladde', color: 'gray' },
  sent: { label: 'Sendt', color: 'blue' },
  accepted: { label: 'Accepteret', color: 'green' },
  rejected: { label: 'Afvist', color: 'red' },
  expired: { label: 'Udløbet', color: 'orange' },
};

const AVAILABILITY_STATUS = {
  available: { label: 'Tilgængelig', color: 'green' },
  busy: { label: 'Optaget', color: 'yellow' },
  on_job: { label: 'På job', color: 'blue' },
  sick: { label: 'Syg', color: 'red' },
  vacation: { label: 'Ferie', color: 'purple' },
  offline: { label: 'Offline', color: 'gray' },
};

export function JobStatusBadge({ status }) {
  const s = JOB_STATUS[status] || { label: status, color: 'gray' };
  return <Badge variant={s.color} dot>{s.label}</Badge>;
}

export function InvoiceStatusBadge({ status }) {
  const s = INVOICE_STATUS[status] || { label: status, color: 'gray' };
  return <Badge variant={s.color} dot>{s.label}</Badge>;
}

export function QuoteStatusBadge({ status }) {
  const s = QUOTE_STATUS[status] || { label: status, color: 'gray' };
  return <Badge variant={s.color} dot>{s.label}</Badge>;
}

export function AvailabilityBadge({ status }) {
  const s = AVAILABILITY_STATUS[status] || { label: status, color: 'gray' };
  return <Badge variant={s.color} dot>{s.label}</Badge>;
}

export const JOB_STATUSES = Object.entries(JOB_STATUS).map(([k, v]) => ({ value: k, ...v }));
export const INVOICE_STATUSES = Object.entries(INVOICE_STATUS).map(([k, v]) => ({ value: k, ...v }));
export const QUOTE_STATUSES = Object.entries(QUOTE_STATUS).map(([k, v]) => ({ value: k, ...v }));
export const AVAILABILITY_STATUSES = Object.entries(AVAILABILITY_STATUS).map(([k, v]) => ({ value: k, ...v }));

// ─── Priority badge ───────────────────────────────────────────────────────────
const PRIORITY = {
  low: { label: 'Lav', color: 'gray' },
  normal: { label: 'Normal', color: 'blue' },
  high: { label: 'Høj', color: 'orange' },
  urgent: { label: 'Haster', color: 'red' },
};
export function PriorityBadge({ priority }) {
  const p = PRIORITY[priority] || { label: priority, color: 'gray' };
  return <Badge variant={p.color}>{p.label}</Badge>;
}
export const PRIORITIES = Object.entries(PRIORITY).map(([k, v]) => ({ value: k, ...v }));

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className = '', padding = true }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${padding ? 'p-6' : ''} ${className}`}>
      {children}
    </div>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
const fieldBase = 'w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-slate-50 disabled:cursor-not-allowed';

export function Input({ label, error, hint, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-slate-700">{label}</label>}
      <input className={`${fieldBase} ${error ? 'border-red-400 focus:ring-red-500' : ''} ${className}`} {...props} />
      {error && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function Select({ label, error, hint, children, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-slate-700">{label}</label>}
      <select className={`${fieldBase} ${error ? 'border-red-400 focus:ring-red-500' : ''} ${className}`} {...props}>
        {children}
      </select>
      {error && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function Textarea({ label, error, hint, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-slate-700">{label}</label>}
      <textarea className={`${fieldBase} resize-none ${error ? 'border-red-400 focus:ring-red-500' : ''} ${className}`} {...props} />
      {error && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, subtitle, children, size = 'md', footer }) {
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
        <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] flex flex-col`}>
          <div className="flex items-start justify-between p-6 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
              {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors ml-4 shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="overflow-y-auto flex-1 p-6 space-y-4">{children}</div>
          {footer && <div className="border-t border-slate-100 p-6 bg-slate-50/50 rounded-b-2xl">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
export function Skeleton({ className = '' }) {
  return <div className={`bg-slate-200 rounded-lg animate-pulse ${className}`} />;
}

export function SkeletonCard() {
  return (
    <Card>
      <Skeleton className="h-4 w-24 mb-3" />
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-3 w-20" />
    </Card>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 py-4 px-6 border-b border-slate-100 last:border-0">
      <Skeleton className="w-8 h-8 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && (
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-slate-400" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      {description && <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>}
      {action}
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
const avatarColors = [
  'bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-orange-500',
  'bg-rose-500', 'bg-cyan-500', 'bg-amber-500', 'bg-indigo-500',
];
function getColor(name) {
  if (!name) return avatarColors[0];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % avatarColors.length;
  return avatarColors[h];
}
export function Avatar({ name, size = 'md', className = '' }) {
  const sizes = { xs: 'w-6 h-6 text-xs', sm: 'w-8 h-8 text-sm', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base' };
  const initials = (name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  return (
    <div className={`${sizes[size]} ${getColor(name)} rounded-full flex items-center justify-center text-white font-semibold shrink-0 ${className}`}>
      {initials}
    </div>
  );
}

// ─── Alert ────────────────────────────────────────────────────────────────────
const alertStyles = {
  error: { bg: 'bg-red-50 border-red-200', text: 'text-red-800', icon: AlertCircle, iconColor: 'text-red-500' },
  success: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-800', icon: CheckCircle, iconColor: 'text-emerald-500' },
  info: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-800', icon: Info, iconColor: 'text-blue-500' },
};
export function Alert({ variant = 'info', children }) {
  const s = alertStyles[variant];
  const Icon = s.icon;
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${s.bg}`}>
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${s.iconColor}`} />
      <p className={`text-sm font-medium ${s.text}`}>{children}</p>
    </div>
  );
}

// ─── Stats card ───────────────────────────────────────────────────────────────
export function StatsCard({ label, value, change, changeLabel, icon: Icon, iconBg = 'bg-blue-50', iconColor = 'text-blue-600', loading }) {
  if (loading) return <SkeletonCard />;
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          {changeLabel && (
            <p className={`text-xs mt-1.5 font-medium ${change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {change >= 0 ? '↑' : '↓'} {changeLabel}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`w-11 h-11 ${iconBg} rounded-xl flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── Page header ──────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}

// ─── Tab bar ──────────────────────────────────────────────────────────────────
export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
      {tabs.map(tab => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            active === tab.value
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
              active === tab.value ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'
            }`}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────
export function Divider({ label }) {
  if (!label) return <hr className="border-slate-200 my-6" />;
  return (
    <div className="flex items-center gap-3 my-6">
      <div className="flex-1 border-t border-slate-200" />
      <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</span>
      <div className="flex-1 border-t border-slate-200" />
    </div>
  );
}

// ─── Dropdown ─────────────────────────────────────────────────────────────────
export function Dropdown({ trigger, items }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    function handle(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen(o => !o)}>{trigger}</div>
      {open && (
        <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl border border-slate-200 shadow-lg z-50 py-1 overflow-hidden">
          {items.map((item, i) =>
            item.divider ? (
              <hr key={i} className="border-slate-100 my-1" />
            ) : (
              <button
                key={i}
                onClick={() => { item.onClick(); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                  item.danger ? 'text-red-600 hover:bg-red-50' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {item.icon && <item.icon className="w-4 h-4 shrink-0" />}
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}

// ─── Currency formatter ───────────────────────────────────────────────────────
export function formatDKK(amount) {
  return `${(amount || 0).toLocaleString('da-DK')} kr`;
}

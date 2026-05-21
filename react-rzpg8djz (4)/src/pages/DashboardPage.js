import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { subMonths, startOfMonth, endOfMonth, format } from 'date-fns';
import { da } from 'date-fns/locale';
import {
  TrendingUp, Briefcase, Users, UserCheck, ArrowRight,
  Plus, Receipt, Calendar, Clock,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import {
  Card, StatsCard, PageHeader, Button, JobStatusBadge,
  Skeleton, SkeletonCard, EmptyState, formatDKK,
} from '../components/ui';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];

function buildRevenueChart(invoices) {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(now, 5 - i);
    const m = d.getMonth();
    const y = d.getFullYear();
    const revenue = invoices
      .filter(inv => {
        const dd = new Date(inv.created_at);
        return dd.getMonth() === m && dd.getFullYear() === y && inv.status === 'paid';
      })
      .reduce((sum, inv) => sum + (inv.total || 0), 0);
    return { month: MONTH_NAMES[m], revenue };
  });
}

const STATUS_ORDER = ['new', 'scheduled', 'in_progress', 'completed'];
const STATUS_LABELS = { new: 'Nye', scheduled: 'Planlagt', in_progress: 'I gang', completed: 'Færdige' };
const STATUS_COLORS = { new: '#94a3b8', scheduled: '#3b82f6', in_progress: '#f59e0b', completed: '#10b981' };

export default function DashboardPage() {
  const { company } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ revenue: 0, activeJobs: 0, customers: 0, employees: 0, outstanding: 0 });
  const [revenueChart, setRevenueChart] = useState([]);
  const [jobChart, setJobChart] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);

  useEffect(() => {
    if (!company?.id) return;
    async function load() {
      setLoading(true);
      const sixMonthsAgo = subMonths(new Date(), 6).toISOString();
      const monthStart = startOfMonth(new Date()).toISOString();
      const monthEnd = endOfMonth(new Date()).toISOString();

      const [
        { data: invoices },
        { data: jobs },
        { count: custCount },
        { count: empCount },
        { data: recentJobsData },
      ] = await Promise.all([
        supabase.from('invoices').select('total, status, created_at').eq('company_id', company.id).gte('created_at', sixMonthsAgo),
        supabase.from('jobs').select('status').eq('company_id', company.id),
        supabase.from('customers').select('*', { count: 'exact', head: true }).eq('company_id', company.id),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('company_id', company.id),
        supabase.from('jobs').select('*, customers(name)').eq('company_id', company.id).order('created_at', { ascending: false }).limit(5),
      ]);

      const allInvoices = invoices || [];
      const allJobs = jobs || [];

      const monthRevenue = allInvoices
        .filter(i => i.status === 'paid' && i.created_at >= monthStart && i.created_at <= monthEnd)
        .reduce((s, i) => s + (i.total || 0), 0);

      const outstanding = allInvoices
        .filter(i => ['sent', 'overdue'].includes(i.status))
        .reduce((s, i) => s + (i.total || 0), 0);

      const activeJobs = allJobs.filter(j => ['scheduled', 'assigned', 'en_route', 'in_progress'].includes(j.status)).length;

      setStats({ revenue: monthRevenue, activeJobs, customers: custCount || 0, employees: empCount || 0, outstanding });
      setRevenueChart(buildRevenueChart(allInvoices));
      setJobChart(STATUS_ORDER.map(s => ({
        status: STATUS_LABELS[s],
        count: allJobs.filter(j => j.status === s).length,
        color: STATUS_COLORS[s],
      })));
      setRecentJobs(recentJobsData || []);
      setLoading(false);
    }
    load();
  }, [company?.id]);

  const hasData = recentJobs.length > 0 || stats.customers > 0;

  return (
    <div className="space-y-8">
      <PageHeader title={`God dag 👋`} subtitle={`Her er et overblik over ${company?.name || 'din virksomhed'}`}>
        <Button icon={Plus} onClick={() => navigate('/jobs')}>Nyt job</Button>
      </PageHeader>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard loading={loading} label="Omsætning (måned)" value={formatDKK(stats.revenue)} icon={TrendingUp} iconBg="bg-blue-50" iconColor="text-blue-600" />
        <StatsCard loading={loading} label="Aktive jobs" value={stats.activeJobs} icon={Briefcase} iconBg="bg-amber-50" iconColor="text-amber-600" />
        <StatsCard loading={loading} label="Kunder" value={stats.customers} icon={Users} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
        <StatsCard loading={loading} label="Udestående" value={formatDKK(stats.outstanding)} icon={Receipt} iconBg="bg-rose-50" iconColor="text-rose-600" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <Card className="lg:col-span-2" padding={false}>
          <div className="p-6 pb-2">
            <h3 className="text-base font-semibold text-slate-900">Omsætning (seneste 6 måneder)</h3>
            <p className="text-sm text-slate-500">Betalte fakturaer</p>
          </div>
          <div className="h-56 px-2 pb-4">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <Skeleton className="w-full h-40" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChart} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => [formatDKK(v), 'Omsætning']} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} fill="url(#revenueGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Jobs by status */}
        <Card padding={false}>
          <div className="p-6 pb-2">
            <h3 className="text-base font-semibold text-slate-900">Jobs</h3>
            <p className="text-sm text-slate-500">Fordeling efter status</p>
          </div>
          <div className="h-56 px-2 pb-4">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1,2,3,4].map(i => <Skeleton key={i} className="h-8" />)}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={jobChart} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="status" type="category" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} width={60} />
                  <Tooltip formatter={(v) => [v, 'Jobs']} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {jobChart.map((entry, i) => (
                      <rect key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      {/* Recent jobs */}
      <Card padding={false}>
        <div className="flex items-center justify-between p-6 pb-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Seneste jobs</h3>
            <p className="text-sm text-slate-500">Dine senest oprettede opgaver</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/jobs')}>
            Se alle <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {loading ? (
          <div className="divide-y divide-slate-100">
            {[1,2,3].map(i => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <Skeleton className="w-9 h-9 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        ) : recentJobs.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="Ingen jobs endnu"
            description="Opret dit første job for at komme i gang"
            action={<Button icon={Plus} onClick={() => navigate('/jobs')}>Opret job</Button>}
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {recentJobs.map(job => (
              <div
                key={job.id}
                onClick={() => navigate('/jobs')}
                className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                  <Briefcase className="w-4.5 h-4.5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{job.title}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                    {job.customers?.name && <span>{job.customers.name}</span>}
                    {job.scheduled_date && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {job.scheduled_date}
                        </span>
                      </>
                    )}
                  </p>
                </div>
                <JobStatusBadge status={job.status} />
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Quick actions */}
      {!hasData && !loading && (
        <Card>
          <h3 className="text-base font-semibold text-slate-900 mb-4">Kom i gang</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Tilføj din første kunde', sub: 'Opret et kundekort', icon: Users, path: '/customers' },
              { label: 'Opret dit første job', sub: 'Book en opgave', icon: Briefcase, path: '/jobs' },
              { label: 'Send din første faktura', sub: 'Kom i gang med fakturering', icon: Receipt, path: '/invoices' },
            ].map(({ label, sub, icon: Icon, path }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="flex items-start gap-4 p-5 border-2 border-dashed border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 rounded-xl transition-all text-left group"
              >
                <div className="w-10 h-10 bg-slate-100 group-hover:bg-blue-100 rounded-xl flex items-center justify-center shrink-0 transition-colors">
                  <Icon className="w-5 h-5 text-slate-500 group-hover:text-blue-600 transition-colors" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

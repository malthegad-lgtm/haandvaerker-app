import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Briefcase } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Card, PageHeader, Button, JobStatusBadge } from '../components/ui';

const DAYS = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];
const MONTHS = ['Januar', 'Februar', 'Marts', 'April', 'Maj', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'December'];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year, month) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

export default function CalendarPage() {
  const { company } = useAuth();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedJobs, setSelectedJobs] = useState([]);

  const load = useCallback(async () => {
    if (!company?.id) return;
    setLoading(true);
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(getDaysInMonth(year, month)).padStart(2, '0')}`;
    const { data } = await supabase
      .from('jobs')
      .select('*, customers(name)')
      .eq('company_id', company.id)
      .gte('scheduled_date', startDate)
      .lte('scheduled_date', endDate);
    setJobs(data || []);
    setLoading(false);
  }, [company?.id, year, month]);

  useEffect(() => { load(); }, [load]);

  const prev = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
  };

  const next = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
  };

  const goToday = () => { setYear(today.getFullYear()); setMonth(today.getMonth()); setSelectedDay(today.getDate()); };

  const handleDayClick = (day) => {
    setSelectedDay(day);
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedJobs(jobs.filter(j => j.scheduled_date === dateStr));
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);
  const cells = Array.from({ length: firstDay }, () => null)
    .concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

  const getJobsForDay = (day) => {
    if (!day) return [];
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return jobs.filter(j => j.scheduled_date === dateStr);
  };

  const isToday = (day) =>
    day && today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;

  const totalJobsThisMonth = jobs.length;
  const completedThisMonth = jobs.filter(j => j.status === 'completed' || j.status === 'invoiced').length;

  return (
    <div className="space-y-6">
      <PageHeader title="Kalender" subtitle="Planlæg og se alle dine jobs">
        <Button variant="secondary" onClick={goToday}>I dag</Button>
      </PageHeader>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <p className="text-2xl font-bold text-slate-900">{totalJobsThisMonth}</p>
          <p className="text-xs text-slate-500 mt-0.5">Jobs denne måned</p>
        </Card>
        <Card>
          <p className="text-2xl font-bold text-emerald-600">{completedThisMonth}</p>
          <p className="text-xs text-slate-500 mt-0.5">Afsluttede</p>
        </Card>
        <Card>
          <p className="text-2xl font-bold text-blue-600">{totalJobsThisMonth - completedThisMonth}</p>
          <p className="text-xs text-slate-500 mt-0.5">Kommende</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar grid */}
        <Card className="lg:col-span-2" padding={false}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 pb-4">
            <h3 className="text-lg font-semibold text-slate-900">
              {MONTHS[month]} {year}
            </h3>
            <div className="flex items-center gap-2">
              <button onClick={prev} className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={next} className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 border-t border-slate-100">
            {DAYS.map(d => (
              <div key={d} className="py-2 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 border-t border-slate-100">
            {cells.map((day, i) => {
              const dayJobs = getJobsForDay(day);
              const selected = selectedDay === day && day !== null;
              return (
                <button
                  key={i}
                  onClick={() => day && handleDayClick(day)}
                  disabled={!day}
                  className={`min-h-16 p-1.5 border-b border-r border-slate-100 text-left transition-colors relative ${
                    !day ? 'bg-slate-50/50' : selected ? 'bg-blue-50' : 'hover:bg-slate-50'
                  } ${(i + 1) % 7 === 0 ? 'border-r-0' : ''}`}
                >
                  {day && (
                    <>
                      <span className={`text-xs font-medium flex w-6 h-6 items-center justify-center rounded-full mb-1 ${
                        isToday(day) ? 'bg-blue-600 text-white' :
                        selected ? 'text-blue-600' : 'text-slate-600'
                      }`}>
                        {day}
                      </span>
                      <div className="space-y-0.5">
                        {dayJobs.slice(0, 2).map(job => (
                          <div key={job.id} className="text-xs bg-blue-100 text-blue-700 rounded px-1 truncate">
                            {job.title}
                          </div>
                        ))}
                        {dayJobs.length > 2 && (
                          <div className="text-xs text-slate-400">+{dayJobs.length - 2} mere</div>
                        )}
                      </div>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Selected day detail */}
        <Card padding={false}>
          <div className="p-6 pb-4 border-b border-slate-100">
            <h3 className="text-base font-semibold text-slate-900">
              {selectedDay
                ? `${selectedDay}. ${MONTHS[month]}`
                : 'Vælg en dag'}
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">
              {selectedDay ? `${selectedJobs.length} jobs` : 'Klik på en dag i kalenderen'}
            </p>
          </div>
          <div className="overflow-y-auto max-h-96">
            {!selectedDay ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Calendar className="w-10 h-10 text-slate-300 mb-3" />
                <p className="text-sm text-slate-400 text-center">Klik på en dag for at se dagens jobs</p>
              </div>
            ) : selectedJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Briefcase className="w-10 h-10 text-slate-300 mb-3" />
                <p className="text-sm text-slate-400 text-center">Ingen jobs planlagt denne dag</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {selectedJobs.map(job => (
                  <div key={job.id} className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-sm font-semibold text-slate-900 leading-snug">{job.title}</p>
                      <JobStatusBadge status={job.status} />
                    </div>
                    {job.customers?.name && (
                      <p className="text-xs text-slate-500">{job.customers.name}</p>
                    )}
                    {job.scheduled_time && (
                      <p className="text-xs text-slate-400 mt-0.5">kl. {job.scheduled_time?.slice(0, 5)}</p>
                    )}
                    {job.address && (
                      <p className="text-xs text-slate-400 mt-0.5 truncate">{job.address}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

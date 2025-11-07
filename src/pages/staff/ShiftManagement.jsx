import React, { useMemo, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useShifts } from '@/hooks/useShifts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { Calendar, MapPin, Clock, RefreshCw, List, LayoutList } from 'lucide-react';

export default function ShiftManagement() {
  const { user } = useAuth();
  const staffId = user?.account_id || null;

  // Local pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [view, setView] = useState('list'); // 'list' | 'grouped'
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [stationFilter, setStationFilter] = useState('all');

  // Fetch shifts for the logged-in staff
  const { shifts, loading, error, pagination, fetchShifts } = useShifts({
    staff_id: staffId,
    page,
    pageSize,
    autoFetch: true,
  });

  const totalPages = pagination?.totalPages || 1;

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));
  const handlePageSizeChange = (value) => {
    const newSize = Number(value);
    setPageSize(newSize);
    setPage(1);
  };

  const formatDateTime = (iso) => {
    try {
      const d = new Date(iso);
      d.setHours(d.getHours() + 7); // Force +7h offset for display
      return d.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  const items = useMemo(() => Array.isArray(shifts) ? shifts : [], [shifts]);

  const uniqueStations = useMemo(() => {
    const map = new Map();
    for (const s of items) {
      const id = s.station_id;
      const name = s?.station?.station_name || `Trạm #${id}`;
      if (!map.has(id)) map.set(id, name);
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [items]);

  const isInDateRange = useCallback((isoStart, isoEnd) => {
    if (!dateRange?.from && !dateRange?.to) return true;
    const start = new Date(isoStart);
    const end = new Date(isoEnd);
    const from = dateRange?.from ? new Date(dateRange.from) : null;
    const to = dateRange?.to ? new Date(dateRange.to) : null;
    const dayStart = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
    const dayEnd = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
    const rangeStart = from ? dayStart(from) : null;
    const rangeEnd = to ? dayEnd(to) : null;
    if (rangeStart && end < rangeStart) return false;
    if (rangeEnd && start > rangeEnd) return false;
    return true;
  }, [dateRange]);

  const filtered = useMemo(() => {
    return items.filter((s) => {
      const byStation = stationFilter === 'all' || String(s.station_id) === String(stationFilter);
      const byDate = isInDateRange(s.start_time, s.end_time);
      return byStation && byDate;
    });
  }, [items, stationFilter, isInDateRange]);

  const groupByDay = useMemo(() => {
    const groups = {};
    for (const s of filtered) {
      const d = new Date(s.start_time);
      d.setHours(d.getHours() + 7); // align group date with +7h display
      const key = d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit', weekday: 'short' });
      if (!groups[key]) groups[key] = [];
      groups[key].push(s);
    }
    return Object.entries(groups)
      .map(([label, arr]) => ({ label, date: new Date(new Date(arr[0].start_time).getTime() + 7*3600*1000), items: arr.sort((a,b)=> new Date(a.start_time)-new Date(b.start_time)) }))
      .sort((a,b)=> a.date - b.date);
  }, [filtered]);

  const shiftStatus = (s) => {
    const now = Date.now();
    const st = new Date(s.start_time).getTime();
    const et = new Date(s.end_time).getTime();
    if (now < st) return { label: 'Upcoming', color: 'bg-amber-100 text-amber-800 border-amber-200' };
    if (now >= st && now <= et) return { label: 'Ongoing', color: 'bg-green-100 text-green-800 border-green-200' };
    return { label: 'Completed', color: 'bg-gray-100 text-gray-700 border-gray-200' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Shift Calendar</h1>
          <p className="text-sm text-muted-foreground">View all your scheduled shifts.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* View toggle */}
          {/* <div className="inline-flex rounded-md border p-1">
            <Button
              type="button"
              variant={view === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              className="px-3"
              onClick={() => setView('list')}
              title="List view"
            >
              <List className="mr-2 h-4 w-4" /> List
            </Button>
            <Button
              type="button"
              variant={view === 'grouped' ? 'secondary' : 'ghost'}
              size="sm"
              className="px-3"
              onClick={() => setView('grouped')}
              title="Group by day"
            >
              <LayoutList className="mr-2 h-4 w-4" /> By day
            </Button>
          </div> */}

          {/* Station filter */}
          <Select value={String(stationFilter)} onValueChange={(v) => { setStationFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Select station" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All stations</SelectItem>
              {uniqueStations.map((st) => (
                <SelectItem key={st.id} value={String(st.id)}>{st.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date range filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                {dateRange?.from && dateRange?.to
                  ? `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
                  : 'Date range'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-3">
                <CalendarPicker
                  mode="range"
                  date={dateRange}
                  onDateSelect={setDateRange}
                />
                <div className="mt-3 flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setDateRange({ from: null, to: null })}>Clear</Button>
                  <Button variant="secondary" size="sm">Done</Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Page size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 / page</SelectItem>
              <SelectItem value="20">20 / page</SelectItem>
              <SelectItem value="50">50 / page</SelectItem>
            </SelectContent>
          </Select> */}
          <Button variant="outline" onClick={() => fetchShifts()} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Content */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Shifts</CardTitle>
            <div className="text-sm text-muted-foreground">
              Showing {filtered.length} / {items.length} on this page
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="py-10 text-center text-sm text-muted-foreground">Loading shifts…</div>
          )}

          {error && !loading && (
            <div className="py-4 text-sm text-red-600">{error}</div>
          )}

          {!loading && !error && items.length === 0 && (
            <div className="py-10 text-center text-sm text-muted-foreground">No shifts.</div>
          )}

          {!loading && !error && filtered.length > 0 && view === 'list' && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filtered.map((shift) => {
                const status = shiftStatus(shift);
                return (
                  <div key={shift.shift_id} className="rounded-lg border p-4 hover:bg-accent/40 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {formatDateTime(shift.start_time)} — {formatDateTime(shift.end_time)}
                          </span>
                        </div>
                        <div className="mt-2 font-medium">
                          {shift?.station?.station_name || `Station #${shift.station_id}`}
                        </div>
                        {shift?.station?.address && (
                          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span className="line-clamp-1">{shift.station.address}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <div className={`inline-flex items-center gap-1 rounded border px-2 py-1 ${status.color}`}>
                          <Clock className="h-3.5 w-3.5" />
                          <span>{status.label}</span>
                        </div>
                        <div className="mt-2 text-[11px]">{Math.max(0, Math.round((new Date(shift.end_time) - new Date(shift.start_time)) / 36e5))} hours</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && !error && filtered.length > 0 && view === 'grouped' && (
            <div className="space-y-6">
              {groupByDay.map((group) => (
                <div key={group.label}>
                  <div className="mb-2 text-sm font-medium text-muted-foreground">{group.label}</div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {group.items.map((shift) => {
                      const status = shiftStatus(shift);
                      return (
                        <div key={shift.shift_id} className="rounded-lg border p-4 hover:bg-accent/40 transition-colors">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  {formatDateTime(shift.start_time)} — {formatDateTime(shift.end_time)}
                                </span>
                              </div>
                              <div className="mt-2 font-medium">
                                {shift?.station?.station_name || `Station #${shift.station_id}`}
                              </div>
                              {shift?.station?.address && (
                                <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                                  <MapPin className="h-4 w-4" />
                                  <span className="line-clamp-1">{shift.station.address}</span>
                                </div>
                              )}
                            </div>
                            <div className="text-right text-xs text-muted-foreground">
                              <div className={`inline-flex items-center gap-1 rounded border px-2 py-1 ${status.color}`}>
                                <Clock className="h-3.5 w-3.5" />
                                <span>{status.label}</span>
                              </div>
                              <div className="mt-2 text-[11px]">{Math.max(0, Math.round((new Date(shift.end_time) - new Date(shift.start_time)) / 36e5))} hours</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && pagination?.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between gap-3">
              <div className="text-sm text-muted-foreground">
                Page {pagination.page} / {pagination.totalPages} · Total {pagination.total}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handlePrev} disabled={page <= 1}>
                  Prev
                </Button>
                <Button variant="outline" onClick={handleNext} disabled={page >= totalPages}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

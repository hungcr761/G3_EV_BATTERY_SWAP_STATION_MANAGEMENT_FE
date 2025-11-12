import useBooking from '@/hooks/useBooking';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import React, { useState } from 'react';

function formatDateTime(dt) {
  try {
    const d = new Date(dt);
    const date = d.toLocaleDateString('en-GB');
    const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    return `${date} ${time}`;
  } catch {
    return dt || '-';
  }
}

const statusClass = (s) => {
  const m = {
    pending: 'bg-amber-100 text-amber-700',
    confirmed: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-slate-100 text-slate-700',
    completed: 'bg-emerald-100 text-emerald-700',
    expired: 'bg-rose-100 text-rose-700',
  };
  return m[String(s).toLowerCase()] || 'bg-slate-100 text-slate-700';
};

export default function BookingHistory() {
  const { bookings, loading, error, refetch } = useBooking();
  const [statusFilter, setStatusFilter] = useState('all');

  // derive filtered list according to statusFilter
  const filteredBookings = (bookings || []).filter(b => {
    if (!statusFilter || statusFilter === 'all') return true;
    return String(b?.status || '').toLowerCase() === String(statusFilter).toLowerCase();
  });

  return (
    <div className="container max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Bookings</h1>
          <p className="text-slate-600 text-sm">View your booking history and details</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-600">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 border rounded-md text-sm bg-white"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <Button variant="outline" onClick={refetch} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />} Refresh
          </Button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-slate-600"><Loader2 className="h-4 w-4 animate-spin"/> Loading…</div>
      )}
      {error && (
        <div className="text-red-600 text-sm mb-4">{error}</div>
      )}

      {!loading && !error && (!bookings || bookings.length === 0) && (
        <Card>
          <CardContent className="py-8 text-center text-slate-600">No bookings found.</CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {(filteredBookings || []).map((b) => (
          <Card key={b.booking_id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Booking #{b.booking_id}</CardTitle>
                <Badge className={`${statusClass(b.status)} rounded-full px-2.5 py-0.5 capitalize`}>{b.status}</Badge>
              </div>
              <div className="text-xs text-slate-500 mt-1">Created: {formatDateTime(b.create_time)} • Expires: {formatDateTime(b.expired_time)}</div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <div className="text-xs text-slate-500">Vehicle</div>
                  <div className="text-sm font-medium">{b?.vehicle?.model?.brand} {b?.vehicle?.model?.name}</div>
                  <div className="text-sm text-slate-700">Plate: <span className="font-mono">{b?.vehicle?.license_plate}</span></div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-slate-500">Station</div>
                  <div className="text-sm font-medium">{b?.station?.station_name || `#${b?.station_id}`}</div>
                  <div className="text-sm text-slate-700 truncate" title={b?.station?.address}>{b?.station?.address || '-'}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-slate-500">Batteries</div>
                  {(b?.batteries || []).length === 0 ? (
                    <div className="text-sm text-slate-600">—</div>
                  ) : (
                    <div className="text-sm text-slate-700 space-y-1">
                      {(b.batteries || []).map((bat) => (
                        <div key={bat.battery_id} className="flex items-center justify-between gap-3">
                          <span className="font-mono truncate" title={bat.battery_serial}>{bat.battery_serial}</span>
                          <span className="text-xs font-semibold text-emerald-700">SoC {Number(bat.current_soc ?? 0)}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


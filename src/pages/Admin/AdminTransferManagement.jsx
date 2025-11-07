import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { transferAPI, batteryAPI } from '@/lib/apiServices';
import { RefreshCcw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function AdminTransferManagement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [requests, setRequests] = useState([]);
  const [rejectingId, setRejectingId] = useState(null);
  const [approvingId, setApprovingId] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);

  // Basic client-side filters (optional UI placeholders)
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  // Approve modal state
  const [openApprove, setOpenApprove] = useState(false);
  const [approveTarget, setApproveTarget] = useState(null); // request being approved
  const [approveForm, setApproveForm] = useState({ source_station_id: '', parts: [ { transfer_quantity: '', source_station_id: '' } ] });
  const [stationSummary, setStationSummary] = useState(null); // summary for source station check
  // Remove summaryLoading (not used currently)
  const [approveError, setApproveError] = useState('');

  const fetchAllRequests = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await transferAPI.getByStation({ page, pageSize });
      const data = res?.data?.payload?.transfers || {};
      const items = data?.data || [];
      setRequests(Array.isArray(items) ? items : []);
      setTotal(Number(data?.total) || items.length || 0);
  // totalPages available as data?.totalPages when needed
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load transfer requests.');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchAllRequests();
  }, [fetchAllRequests]);

  const filtered = useMemo(() => {
    let list = requests;
    if (status !== 'all') {
      list = list.filter(r => String(r.status).toLowerCase() === String(status).toLowerCase());
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(r =>
        String(r.transfer_request_id).toLowerCase().includes(q) ||
        String(r.notes || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [requests, search, status]);

  const statusClass = (s) => {
    const m = {
      requested: 'bg-amber-100 text-amber-700',
      pending: 'bg-amber-100 text-amber-700',
      in_transit: 'bg-blue-100 text-blue-700',
      incompleted: 'bg-blue-100 text-blue-700',
      completed: 'bg-emerald-100 text-emerald-700',
      rejected: 'bg-rose-100 text-rose-700',
      cancelled: 'bg-slate-100 text-slate-700',
    };
    return m[String(s).toLowerCase()] || 'bg-slate-100 text-slate-700';
  };

  const formatDate = (iso) => {
    try { return new Date(iso).toLocaleDateString('en-GB'); } catch { return iso || '-'; }
  };
  const formatTime = (iso) => {
    try { return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); } catch { return iso || '-'; }
  };

  const handleReject = async (id) => {
    if (!id) return;
    setRejectingId(id);
    setFeedback({ type: '', text: '' });
    try {
      const res = await transferAPI.reject(id);
      const ok = res?.status === 200 || res?.data?.success === true;
      if (ok) {
        setFeedback({ type: 'success', text: 'Request rejected successfully.' });
        await fetchAllRequests();
      } else {
        setFeedback({ type: 'error', text: res?.data?.message || 'Reject failed.' });
      }
    } catch (e) {
      setFeedback({ type: 'error', text: e?.response?.data?.message || 'Reject failed.' });
    } finally {
      setRejectingId(null);
      setTimeout(() => setFeedback({ type: '', text: '' }), 3500);
    }
  };

  const openApproveModal = (request) => {
    setApproveError('');
    setApproveTarget(request);
    setApproveForm({
      source_station_id: '',
      parts: [ { transfer_quantity: '', source_station_id: '' } ]
    });
    setOpenApprove(true);
  };

  const fetchSourceSummary = async (stationId) => {
    if (!stationId) { setStationSummary(null); return; }
  // optionally show loading state here
    try {
      const res = await batteryAPI.getSummaryByStation(stationId);
      const data = res?.data?.data || res?.data?.payload || res?.data || {};
      setStationSummary({
        TotalBatteries: Number(data.TotalBatteries) || 0,
        AvailableForSwap: Number(data.AvailableForSwap) || 0,
        BatteryShortage: Number(data.BatteryShortage) || 0,
        message: data.message || ''
      });
    } catch {
      setStationSummary(null);
    } finally {
      // end loading
    }
  };

  const handleChangePartQty = (index, value) => {
    setApproveForm(f => {
      const parts = [...f.parts];
      parts[index] = { ...parts[index], transfer_quantity: value };
      return { ...f, parts };
    });
  };

  const handleChangePartSource = (index, value) => {
    setApproveForm(f => {
      const parts = [...f.parts];
      parts[index] = { ...parts[index], source_station_id: value };
      return { ...f, parts };
    });
  };

  const addSecondPartIfNeeded = () => {
    setApproveForm(f => {
      if (f.parts.length >= 2) return f;
      return { ...f, parts: [...f.parts, { transfer_quantity: '', source_station_id: '' }] };
    });
  };

  const totalRequested = (approveTarget?.request_quantity) ? Number(approveTarget.request_quantity) : 0;
  const sumPartsQty = approveForm.parts.reduce((s,p)=> s + (Number(p.transfer_quantity) || 0), 0);
  const remainingQty = Math.max(0, totalRequested - sumPartsQty);

  const validateApprove = () => {
    if (!approveTarget) return 'No request selected';
    if (sumPartsQty !== totalRequested) return 'Sum of transfer quantities must equal requested quantity.';
    for (const p of approveForm.parts) {
      if (!p.source_station_id) return 'Source station is required for each part.';
      if (!p.transfer_quantity || Number(p.transfer_quantity) <= 0) return 'Each part must have a positive quantity.';
    }
    // Check each part availability if summary fetched for that station (simplified: check only first part if selected)
    return '';
  };

  const handleApprove = async () => {
    setApproveError('');
    const err = validateApprove();
    if (err) { setApproveError(err); return; }
    if (!approveTarget) return;
    setApprovingId(approveTarget.transfer_request_id);
    try {
      const payload = {
        transfer_orders: approveForm.parts.map(p => ({
          source_station_id: Number(p.source_station_id),
          target_station_id: Number(approveTarget.station_id),
          transfer_quantity: Number(p.transfer_quantity)
        }))
      };
      const res = await transferAPI.approve(approveTarget.transfer_request_id, payload);
      const ok = res?.status === 200 || res?.data?.success === true;
      if (ok) {
        setFeedback({ type: 'success', text: 'Request approved successfully.' });
        setOpenApprove(false);
        await fetchAllRequests();
      } else {
        setApproveError(res?.data?.message || 'Approve failed.');
      }
    } catch (e) {
      setApproveError(e?.response?.data?.message || 'Approve failed.');
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transfer Requests Management</h1>
          <p className="text-sm text-slate-600">View and manage all battery transfer requests from stations.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchAllRequests} disabled={loading}>
            <RefreshCcw className="w-4 h-4 mr-2" /> Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-3">
          <div className="md:col-span-4 lg:col-span-6">
            <Input placeholder="Search by request ID or notes..." value={search} onChange={(e)=>setSearch(e.target.value)} />
          </div>
          <div className="md:col-span-2 lg:col-span-2">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="requested">Requested</SelectItem>
                <SelectItem value="in_transit">In transit</SelectItem>
                <SelectItem value="incompleted">Incompleted</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2 lg:col-span-2">
            <Select value={String(pageSize)} onValueChange={(v)=>{ setPageSize(parseInt(v,10)); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Page size" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 / page</SelectItem>
                <SelectItem value="20">20 / page</SelectItem>
                <SelectItem value="50">50 / page</SelectItem>
                <SelectItem value="100">100 / page</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center md:col-span-2 lg:col-span-2">
            <div className="text-sm text-slate-600">Total: <b>{total}</b> requests</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Transfer Requests</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {feedback.text && (
            <div className={`mb-3 text-sm px-3 py-2 rounded-md ${feedback.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{feedback.text}</div>
          )}
          {loading ? (
            <div className="p-6 text-slate-600">Loading...</div>
          ) : error ? (
            <div className="p-6 text-red-600">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-slate-600">No requests found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b bg-slate-50">
                <tr>
                  <th className="text-left py-2 px-3">#</th>
                  <th className="text-left py-2 px-3">Date</th>
                  <th className="text-left py-2 px-3">Time</th>
                  <th className="text-left py-2 px-3">Request ID</th>
                  <th className="text-left py-2 px-3">Station</th>
                  <th className="text-left py-2 px-3">Quantity</th>
                  <th className="text-left py-2 px-3">Notes</th>
                  <th className="text-left py-2 px-3">Status</th>
                  <th className="text-left py-2 px-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={r.transfer_request_id || i} className="border-b">
                    <td className="py-2 px-3">{(page - 1) * pageSize + i + 1}</td>
                    <td className="py-2 px-3">{formatDate(r.request_time)}</td>
                    <td className="py-2 px-3">{formatTime(r.request_time)}</td>
                    <td className="py-2 px-3 font-mono">{r.transfer_request_id}</td>
                    <td className="py-2 px-3">{r.station_id}</td>
                    <td className="py-2 px-3">{r.request_quantity}</td>
                    <td className="py-2 px-3 max-w-[260px] whitespace-nowrap overflow-hidden text-ellipsis" title={r.notes || ''}>{r.notes || '-'}</td>
                    <td className="py-2 px-3">
                      <Badge className={`${statusClass(r.status)} rounded-full px-2.5 py-0.5 capitalize`}>
                        {r.status}
                      </Badge>
                    </td>
                    <td className="py-2 px-3 space-x-2">
                      {String(r.status).toLowerCase() === 'requested' ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openApproveModal(r)}
                          >Approve</Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={rejectingId === r.transfer_request_id}
                            onClick={() => handleReject(r.transfer_request_id)}
                          >
                            {rejectingId === r.transfer_request_id ? 'Rejecting...' : 'Reject'}
                          </Button>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={openApprove} onOpenChange={setOpenApprove}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Approve Transfer Request</DialogTitle>
            <DialogDescription>
              {approveTarget ? (
                <div className="space-y-1 text-sm">
                  <div><strong>Request ID:</strong> {approveTarget.transfer_request_id}</div>
                  <div><strong>Target Station (requester):</strong> {approveTarget.station_id}</div>
                  <div><strong>Requested Quantity:</strong> {approveTarget.request_quantity}</div>
                </div>
              ) : 'No request selected'}
            </DialogDescription>
          </DialogHeader>
          {approveTarget && (
            <div className="space-y-6">
              <div className="space-y-3">
                {approveForm.parts.map((part, idx) => (
                  <div key={idx} className="border rounded-md p-3 space-y-3 bg-slate-50">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Source Station ID</label>
                        <Input
                          placeholder="e.g. 2"
                          value={part.source_station_id}
                          onChange={(e) => { handleChangePartSource(idx, e.target.value); fetchSourceSummary(e.target.value); }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Transfer Quantity</label>
                        <Input
                          type="number"
                          min={1}
                          value={part.transfer_quantity}
                          onChange={(e) => handleChangePartQty(idx, e.target.value)}
                          placeholder="Qty"
                        />
                      </div>
                      {idx === 0 && (
                        <div className="flex items-end">
                          {remainingQty > 0 && (
                            <Button type="button" variant="outline" size="sm" onClick={addSecondPartIfNeeded}>Add Part</Button>
                          )}
                        </div>
                      )}
                    </div>
                    {idx === 0 && stationSummary && (
                      <div className="text-xs text-slate-600 bg-white rounded p-2 border">
                        <div><strong>Source Summary:</strong> {stationSummary.message}</div>
                        <div>Available For Swap: <b>{stationSummary.AvailableForSwap}</b></div>
                        {Number(part.transfer_quantity) > stationSummary.AvailableForSwap && approveForm.parts.length === 1 && (
                          <div className="text-amber-600 mt-1">Quantity exceeds available. Consider splitting into another part.</div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                <div className="text-xs text-slate-500">Remaining to allocate: {remainingQty}</div>
              </div>
              {approveError && <div className="text-sm text-red-600">{approveError}</div>}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpenApprove(false)}>Cancel</Button>
                <Button onClick={handleApprove} disabled={approvingId === approveTarget.transfer_request_id}>
                  {approvingId === approveTarget.transfer_request_id ? 'Approving...' : 'Approve'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

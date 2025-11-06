import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { transferAPI } from '@/lib/apiServices';
import { RefreshCcw } from 'lucide-react';

export default function AdminTransferManagement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [requests, setRequests] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);

  // Basic client-side filters (optional UI placeholders)
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

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
      setError(e?.response?.data?.message || e?.message || 'Không thể tải danh sách yêu cầu điều phối.');
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
    try { return new Date(iso).toLocaleDateString('vi-VN'); } catch { return iso || '-'; }
  };
  const formatTime = (iso) => {
    try { return new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }); } catch { return iso || '-'; }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý yêu cầu điều phối (Admin)</h1>
          <p className="text-sm text-slate-600">Hiển thị tất cả yêu cầu điều phối từ các trạm.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchAllRequests} disabled={loading}>
            <RefreshCcw className="w-4 h-4 mr-2" /> Tải lại
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-3">
          <div className="md:col-span-4 lg:col-span-6">
            <Input placeholder="Tìm theo mã yêu cầu hoặc ghi chú..." value={search} onChange={(e)=>setSearch(e.target.value)} />
          </div>
          <div className="md:col-span-2 lg:col-span-2">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue placeholder="Trạng thái" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
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
                <SelectItem value="10">10 / trang</SelectItem>
                <SelectItem value="20">20 / trang</SelectItem>
                <SelectItem value="50">50 / trang</SelectItem>
                <SelectItem value="100">100 / trang</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center md:col-span-2 lg:col-span-2">
            <div className="text-sm text-slate-600">Tổng: <b>{total}</b> yêu cầu</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Danh sách yêu cầu</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-slate-600">Đang tải...</div>
          ) : error ? (
            <div className="p-6 text-red-600">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-slate-600">Không có yêu cầu nào.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b bg-slate-50">
                <tr>
                  <th className="text-left py-2 px-3">#</th>
                  <th className="text-left py-2 px-3">Ngày</th>
                  <th className="text-left py-2 px-3">Giờ</th>
                  <th className="text-left py-2 px-3">Mã yêu cầu</th>
                  <th className="text-left py-2 px-3">Trạm</th>
                  <th className="text-left py-2 px-3">Số lượng</th>
                  <th className="text-left py-2 px-3">Ghi chú</th>
                  <th className="text-left py-2 px-3">Trạng thái</th>
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
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import React, { useEffect, useMemo, useState } from 'react';
import { useShifts } from '@/hooks/useShifts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftRight, Plus, RefreshCcw, Search, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import useTransfer from '@/hooks/useTransfer';

export default function TransferManagement() {
    const { shift, loading: shiftLoading, error: shiftError } = useShifts();

    const fromStation = useMemo(() => {
        if (!shift) return null;
        return {
            id: shift?.station_id,
            name: shift?.station?.station_name || `Station #${shift?.station_id}`,
            address: shift?.station?.address || ''
        };
    }, [shift]);

    const {
        transfer: transfers,
        loading: listLoading,
        apiError,
        isSubmitting,
        fetchTransfers,
        handleAddTransfer,
        message,
    } = useTransfer();

    useEffect(() => { fetchTransfers(); }, [fetchTransfers]);

    // Format helpers
    const formatDate = (iso) => {
        try { return new Date(iso).toLocaleString('vi-VN'); } catch { return iso || '-'; }
    };
    const formatDateOnly = (iso) => {
        try { return new Date(iso).toLocaleDateString('vi-VN'); } catch { return iso || '-'; }
    };
    const formatTimeOnly = (iso) => {
        try { return new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }); } catch { return iso || '-'; }
    };
    const statusClass = (s) => {
        const m = {
            pending: 'bg-amber-100 text-amber-700',
            in_transit: 'bg-blue-100 text-blue-700',
            completed: 'bg-emerald-100 text-emerald-700',
            rejected: 'bg-rose-100 text-rose-700',
            cancelled: 'bg-slate-100 text-slate-700',
        };
        return m[s] || 'bg-slate-100 text-slate-700';
    };

    // Create dialog state (UI only for now)
    const [openCreate, setOpenCreate] = useState(false);
    const [createForm, setCreateForm] = useState({ reason: '', quantity: 1 });
    const [openDetail, setOpenDetail] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

    return (
        <div>
            {/* Header */}
            {shiftLoading ? (
                <div className="p-6">Đang tải ca làm...</div>
            ) : shiftError ? (
                <div className="p-6 text-red-600">{shiftError}</div>
            ) : (
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-50">
                            <ArrowLeftRight className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Transfer Management</h1>
                            <div className="text-sm text-slate-600">
                                {fromStation && (
                                    <>Trạm: <span className="font-medium">{fromStation.name}</span> — ID: {fromStation.id}</>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={fetchTransfers}>
                            <RefreshCcw className="w-4 h-4 mr-2" /> Tải lại
                        </Button>
                        <Button className="bg-blue-600 hover:bg-blue-700" disabled={!fromStation} onClick={() => setOpenCreate(true)}>
                            <Plus className="w-4 h-4 mr-2" /> Create Request
                        </Button>
                    </div>
                </div>
            )}

            {/* Alert Message (similar to VehicleManagement) */}
            {message?.text && (
                <div
                    className={`mb-4 p-4 rounded-xl flex items-start space-x-3 backdrop-blur-sm border shadow-md transition-all duration-300 ${String(message.type).toLowerCase() === 'success'
                        ? 'bg-emerald-50/90 text-emerald-900 border-emerald-200'
                        : 'bg-red-50/90 text-red-900 border-red-200'
                        }`}
                >
                    <div className={`p-2 rounded-lg ${String(message.type).toLowerCase() === 'success' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                        {String(message.type).toLowerCase() === 'success' ? (
                            <CheckCircle className="h-5 w-5" />
                        ) : (
                            <AlertCircle className="h-5 w-5" />
                        )}
                    </div>
                    <p className="font-medium">{message.text}</p>
                </div>
            )}

            {/* Filter */}

            <Card>
                <CardHeader className="pb-0">
                    <CardTitle className="text-sm font-semibold">Bộ lọc</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-3">
                    <div className="md:col-span-3 lg:col-span-5">
                        <Label className="text-xs text-slate-500">Tìm kiếm</Label>
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-2 top-2.5" />
                            <Input
                                className="pl-8"
                                placeholder="Mã yêu cầu, ghi chú..."
                            // value={filters.search}
                            // onChange={(e) => updateFilters({ search: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="md:col-span-2 lg:col-span-2">
                        <Label className="text-xs text-slate-500">Trạng thái</Label>
                        <Select>
                            <SelectTrigger><SelectValue placeholder="Tất cả" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả</SelectItem>
                                <SelectItem value="pending">Chờ duyệt</SelectItem>
                                <SelectItem value="in_transit">Đang điều phối</SelectItem>
                                <SelectItem value="completed">Hoàn tất</SelectItem>
                                <SelectItem value="rejected">Từ chối</SelectItem>
                                <SelectItem value="cancelled">Đã hủy</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="md:col-span-2 lg:col-span-2">
                        <Label className="text-xs text-slate-500">Thời gian</Label>
                        <Select>
                            <SelectTrigger><SelectValue placeholder="Tất cả" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả</SelectItem>
                                <SelectItem value="today">Hôm nay</SelectItem>
                                <SelectItem value="this_week">Tuần này</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="md:col-span-1 lg:col-span-1">
                        <Label className="text-xs text-slate-500">Số lượng từ</Label>
                        <Input type="number" min={0} placeholder="Min" />
                    </div>
                    <div className="md:col-span-1 lg:col-span-1">
                        <Label className="text-xs text-slate-500">Số lượng đến</Label>
                        <Input type="number" min={0} placeholder="Max" />
                    </div>
                    <div className="flex items-end md:col-span-1 lg:col-span-1">
                        <Button variant="outline" className="w-full">Xoá lọc</Button>
                    </div>
                </CardContent>
            </Card>

            {/* Transfer List */}
            <Card className="mt-4">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">Danh sách yêu cầu điều phối</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    {listLoading ? (
                        <div className="p-6 text-slate-600">Đang tải...</div>
                    ) : apiError ? (
                        <div className="p-6 text-red-600">{apiError}</div>
                    ) : transfers.length === 0 ? (
                        <div className="p-6 text-slate-500">Chưa có yêu cầu nào.</div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="border-b bg-slate-50 sticky top-0 z-[1]">
                                <tr>
                                    <th className="text-left py-2 px-3">STT</th>
                                    <th className="text-left py-2 px-3">Ngày</th>
                                    <th className="text-left py-2 px-3">Giờ</th>
                                    <th className="text-left py-2 px-3">Mã yêu cầu</th>
                                    <th className="text-left py-2 px-3">Số lượng</th>
                                    <th className="text-left py-2 px-3">Ghi chú</th>
                                    <th className="text-left py-2 px-3">Trạng thái</th>
                                    <th className="text-right py-2 px-3">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transfers.map((r, i) => {
                                    const hasOrders = Array.isArray(r.transferOrders) && r.transferOrders.length > 0;
                                    const qty = hasOrders
                                        ? r.transferOrders.reduce((s, it) => s + Number(it.transfer_quantity || 0), 0)
                                        : (r.request_quantity ?? '-');
                                    const stt = i + 1;
                                    return (
                                        <tr key={r.transfer_request_id || i} className="border-b">
                                            <td className="py-2 px-3 w-12">{stt}</td>
                                            <td className="py-2 px-3">{formatDateOnly(r.request_time)}</td>
                                            <td className="py-2 px-3">{formatTimeOnly(r.request_time)}</td>
                                            <td className="py-2 px-3 font-mono">{r.transfer_request_id}</td>
                                            <td className="py-2 px-3">{qty}</td>
                                            <td className="py-2 px-3 max-w-[260px] whitespace-nowrap overflow-hidden text-ellipsis" title={r.notes || ''}>{r.notes || '-'}</td>
                                            <td className="py-2 px-3">
                                                <Badge className={`${statusClass(r.status)} rounded-full px-2.5 py-0.5 capitalize`}>
                                                    {r.status || 'unknown'}
                                                </Badge>
                                            </td>
                                            <td className="py-2 px-3 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button size="sm" variant="ghost" onClick={() => { setSelectedRequest(r); setOpenDetail(true); }}>
                                                        Xem
                                                    </Button>
                                                    {/* actions (cancel/confirm) can be added later */}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </CardContent>
            </Card>

            {/* Detail Drawer */}
            <Sheet open={openDetail} onOpenChange={setOpenDetail}>
                <SheetContent className="w-full sm:max-w-lg">
                    <SheetHeader>
                        <SheetTitle>Chi tiết yêu cầu điều phối</SheetTitle>
                        <SheetDescription>Mã: {selectedRequest?.transfer_request_id}</SheetDescription>
                    </SheetHeader>
                    {selectedRequest && (
                        <div className="space-y-4 mt-4">
                            <div className="border rounded p-3">
                                <h4 className="font-semibold mb-2">Thông tin yêu cầu</h4>
                                <div className="space-y-1 text-sm">
                                    <div>Thời gian: {formatDate(selectedRequest.request_time)}</div>
                                    <div>Số lượng yêu cầu: {selectedRequest.request_quantity}</div>
                                    <div>Ghi chú: {selectedRequest.notes || 'N/A'}</div>
                                    <div>Trạng thái: <Badge className={statusClass(selectedRequest.status)}>{selectedRequest.status}</Badge></div>
                                </div>
                            </div>

                            {selectedRequest.transferOrders && selectedRequest.transferOrders.length > 0 ? (
                                <div className="border rounded p-3">
                                    <h4 className="font-semibold mb-2">Chi tiết điều phối (Approved)</h4>
                                    <div className="space-y-2">
                                        {selectedRequest.transferOrders.map((order, idx) => (
                                            <div key={order.transfer_order_id || idx} className="border-l-2 border-blue-200 pl-3">
                                                <div className="text-sm">
                                                    <div>Từ trạm: {order.source_station_id} → Đến trạm: {order.target_station_id}</div>
                                                    <div>Số lượng: {order.transfer_quantity}</div>
                                                    <div>Trạng thái: <Badge className={statusClass(order.status)}>{order.status}</Badge></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="border rounded p-3 bg-amber-50">
                                    <p className="text-amber-700 text-sm">Chưa được admin approve.</p>
                                </div>
                            )}

                            <div className="flex justify-between items-center">
                                {/* <div className="text-xs text-slate-500">Mã: {selectedRequest?.transfer_request_id}</div> */}
                                <div className="flex gap-2">
                                    {/* Future actions (cancel/confirm) can go here */}
                                    <Button variant="outline" onClick={() => setOpenDetail(false)}>Đóng</Button>
                                </div>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            {/* Create Transfer Request Dialog */}
            <Dialog open={openCreate} onOpenChange={setOpenCreate}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Tạo yêu cầu điều phối</DialogTitle>
                        <DialogDescription>
                            <div className="space-y-1">
                                <div>
                                    Trạm: <b>{fromStation?.name}</b> (ID: {fromStation?.id})
                                </div>
                                <div className="text-slate-600">
                                    Địa chỉ: {fromStation?.address || '-'}
                                </div>
                                <div className="text-slate-600">
                                    Thời gian hiện tại: {new Date().toLocaleString('vi-VN')}
                                </div>
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div>
                            <Label className="text-sm">Lý do điều phối</Label>
                            <Input value={createForm.reason} onChange={(e) => setCreateForm(f => ({ ...f, reason: e.target.value }))} placeholder="Nhập lý do..." />
                        </div>
                        <div>
                            <Label className="text-sm">Số lượng pin</Label>
                            <Input type="number" min={1} value={createForm.quantity} onChange={(e) => setCreateForm(f => ({ ...f, quantity: parseInt(e.target.value) || 1 }))} />
                        </div>
                        {apiError && (
                            <div className="text-sm text-red-600">{apiError}</div>
                        )}
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={() => setOpenCreate(false)}>Huỷ</Button>
                            <Button className="bg-blue-600 hover:bg-blue-700" onClick={async () => {
                                if (!fromStation?.id) return;
                                try {
                                    await handleAddTransfer(
                                        { request_quantity: createForm.quantity, notes: createForm.reason },
                                        () => {
                                            setOpenCreate(false);
                                            setCreateForm({ reason: '', quantity: 1 });
                                        }
                                    );
                                } catch (e) {
                                    console.error('Create transfer failed', e);
                                }
                            }} disabled={isSubmitting || (parseInt(createForm.quantity, 10) || 0) <= 0}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Đang tạo...
                                    </>
                                ) : (
                                    'Tạo yêu cầu'
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

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
        handleConfirmOrder,
        message,
        shortageWarning,
        maxRequestQuantity,
        canCreateRequest,
    } = useTransfer();

    // Error popup state: show dialog on apiError but don't hide list
    const [openError, setOpenError] = useState(false);
    useEffect(() => {
        if (apiError) setOpenError(true);
    }, [apiError]);

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
    // Confirm order states
    const [confirmingOrderId, setConfirmingOrderId] = useState(null);
    const [orderBatteries, setOrderBatteries] = useState({}); // { [orderId]: Battery[] }

    const requestCancelled = String(selectedRequest?.status || '').toLowerCase() === 'cancelled';

    return (
        <div>
            {/* Header */}
            {shiftLoading ? (
                <div className="p-6">Loading shift...</div>
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
                                    <>Station: <span className="font-medium">{fromStation.name}</span> — ID: {fromStation.id}</>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={fetchTransfers}>
                            <RefreshCcw className="w-4 h-4 mr-2" /> Refresh
                        </Button>
                        <Button className="bg-blue-600 hover:bg-blue-700" disabled={!fromStation || !canCreateRequest} onClick={() => setOpenCreate(true)}>
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
                    <CardTitle className="text-sm font-semibold">Filters</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-3">
                    <div className="md:col-span-3 lg:col-span-5">
                        <Label className="text-xs text-slate-500">Search</Label>
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-2 top-2.5" />
                            <Input
                                className="pl-8"
                                placeholder="Request ID, notes..."
                            // value={filters.search}
                            // onChange={(e) => updateFilters({ search: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="md:col-span-2 lg:col-span-2">
                        <Label className="text-xs text-slate-500">Status</Label>
                        <Select>
                            <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="in_transit">In transit</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="md:col-span-2 lg:col-span-2">
                        <Label className="text-xs text-slate-500">Time</Label>
                        <Select>
                            <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="this_week">This week</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="md:col-span-1 lg:col-span-1">
                        <Label className="text-xs text-slate-500">Quantity from</Label>
                        <Input type="number" min={0} placeholder="Min" />
                    </div>
                    <div className="md:col-span-1 lg:col-span-1">
                        <Label className="text-xs text-slate-500">Quantity to</Label>
                        <Input type="number" min={0} placeholder="Max" />
                    </div>
                    <div className="flex items-end md:col-span-1 lg:col-span-1">
                        <Button variant="outline" className="w-full">Clear</Button>
                    </div>
                </CardContent>
            </Card>

            {/* Shortage Banner */}
            {canCreateRequest && shortageWarning && (
                <div className="mt-4 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 mt-0.5" />
                    <div>
                        {shortageWarning} Please create a request not exceeding {maxRequestQuantity} batteries.
                    </div>
                </div>
            )}
            {!canCreateRequest && (
                <div className="mt-4 p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5" />
                    <div>The station is not short of batteries. You cannot create a new transfer request.</div>
                </div>
            )}

            {/* Transfer List */}
            <Card className="mt-4">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">Transfer requests</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    {listLoading ? (
                        <div className="p-6 text-slate-600">Loading...</div>
                    ) : transfers.length === 0 ? (
                        <div className="p-6 text-slate-500">No requests yet.</div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="border-b bg-slate-50 sticky top-0 z-[1]">
                                <tr>
                                    <th className="text-left py-2 px-3">#</th>
                                    <th className="text-left py-2 px-3">Date</th>
                                    <th className="text-left py-2 px-3">Time</th>
                                    <th className="text-left py-2 px-3">Request ID</th>
                                    <th className="text-left py-2 px-3">Quantity</th>
                                    <th className="text-left py-2 px-3">Notes</th>
                                    <th className="text-left py-2 px-3">Status</th>
                                    <th className="text-right py-2 px-3">Actions</th>
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
                                                        View
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
                        <SheetTitle>Transfer request detail</SheetTitle>
                        <SheetDescription>ID: {selectedRequest?.transfer_request_id}</SheetDescription>
                    </SheetHeader>
                    {selectedRequest && (
                        <div className="space-y-4 mt-4">
                            <div className="border rounded p-3">
                                <h4 className="font-semibold mb-2">Request info</h4>
                                <div className="space-y-1 text-sm">
                                    <div>Time: {formatDate(selectedRequest.request_time)}</div>
                                    <div>Requested quantity: {selectedRequest.request_quantity}</div>
                                    <div>Notes: {selectedRequest.notes || 'N/A'}</div>
                                    <div>Status: <Badge className={statusClass(selectedRequest.status)}>{selectedRequest.status}</Badge></div>
                                </div>
                            </div>

                            {requestCancelled ? (
                                <div className="border rounded p-3 bg-slate-50">
                                    <p className="text-slate-700 text-sm">This request was cancelled. No transfer orders to display.</p>
                                </div>
                            ) : selectedRequest.transferOrders && selectedRequest.transferOrders.length > 0 ? (
                                <div className="border rounded p-3">
                                    <h4 className="font-semibold mb-2">Transfer details (Approved)</h4>
                                    <div className="space-y-2">
                                        {selectedRequest.transferOrders.map((order, idx) => {
                                            const orderId = order.transfer_order_id || idx;
                                            const batteries = orderBatteries[orderId];
                                            const disabled = requestCancelled || ['completed', 'cancelled', 'rejected'].includes(String(order.status || '').toLowerCase());
                                            return (
                                                <div key={orderId} className="border-l-2 border-blue-200 pl-3 py-2">
                                                    <div className="text-sm flex items-start justify-between gap-2">
                                                        <div>
                                                            <div>From station: {order.source_station_id} → To station: {order.target_station_id}</div>
                                                            <div>Quantity: {order.transfer_quantity}</div>
                                                            <div className="flex items-center gap-2">
                                                                <span>Status: <Badge className={statusClass(order.status)}>{order.status}</Badge></span>
                                                                {!disabled && (
                                                                    <Button
                                                                        size="sm"
                                                                        className="h-7 px-3"
                                                                        disabled={confirmingOrderId === order.transfer_order_id}
                                                                        onClick={async () => {
                                                                            try {
                                                                                setConfirmingOrderId(order.transfer_order_id);
                                                                                const data = await handleConfirmOrder(order.transfer_order_id, { skipFetch: true });
                                                                                const list = data?.transferOrder?.batteries || data?.batteries || [];
                                                                                setOrderBatteries((prev) => ({ ...prev, [orderId]: Array.isArray(list) ? list : [] }));
                                                                                // Update selectedRequest locally with new order status
                                                                                const newStatus = data?.transferOrder?.status || data?.status || 'completed';
                                                                                setSelectedRequest((prev) => {
                                                                                    if (!prev) return prev;
                                                                                    const updatedOrders = (prev.transferOrders || []).map((o) =>
                                                                                        (o.transfer_order_id || '') === (order.transfer_order_id || '') ? { ...o, status: newStatus } : o
                                                                                    );
                                                                                    return { ...prev, transferOrders: updatedOrders };
                                                                                });
                                                                                // If all orders are now in terminal states, refresh list ONCE
                                                                                setTimeout(() => {
                                                                                    const req = selectedRequest ? { ...selectedRequest } : null;
                                                                                    const allTerminal = (req?.transferOrders || []).every((o) => ['completed', 'cancelled', 'rejected'].includes(String(o.status || '').toLowerCase()));
                                                                                    if (allTerminal) {
                                                                                        fetchTransfers();
                                                                                    }
                                                                                }, 0);
                                                                            } catch {
                                                                                /* error handled via apiError/message */
                                                                            } finally {
                                                                                setConfirmingOrderId(null);
                                                                            }
                                                                        }}
                                                                    >
                                                                        {confirmingOrderId === order.transfer_order_id ? (
                                                                            <>
                                                                                <Loader2 className="mr-1 h-4 w-4 animate-spin" /> Confirming
                                                                            </>
                                                                        ) : (
                                                                            'Confirm transfer'
                                                                        )}
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {Array.isArray(batteries) && batteries.length > 0 && (
                                                        <div className="mt-2 text-xs text-slate-600">
                                                            <div className="font-medium">Batteries:</div>
                                                            <ul className="list-disc ml-5">
                                                                {batteries.map((b, i) => (
                                                                    <li key={b?.battery_id || i}>Battery #{b?.battery_id || i + 1}{b?.serial_number ? ` — SN: ${b.serial_number}` : ''}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div className="border rounded p-3 bg-amber-50">
                                    <p className="text-amber-700 text-sm">Not approved by admin yet.</p>
                                </div>
                            )}

                            <div className="flex justify-between items-center">
                                {/* <div className="text-xs text-slate-500">Mã: {selectedRequest?.transfer_request_id}</div> */}
                                <div className="flex gap-2">
                                    {/* Future actions (cancel/confirm) can go here */}
                                    <Button variant="outline" onClick={() => setOpenDetail(false)}>Close</Button>
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
                        <DialogTitle>Create transfer request</DialogTitle>
                        <DialogDescription>
                            <div className="space-y-1">
                                <div>
                                    Station: <b>{fromStation?.name}</b> (ID: {fromStation?.id})
                                </div>
                                <div className="text-slate-600">
                                    Address: {fromStation?.address || '-'}
                                </div>
                                <div className="text-slate-600">
                                    Current time: {new Date().toLocaleString()}
                                </div>
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div>
                            <Label className="text-sm">Reason</Label>
                            <Input value={createForm.reason} onChange={(e) => setCreateForm(f => ({ ...f, reason: e.target.value }))} placeholder="Enter reason..." />
                        </div>
                        <div>
                            <Label className="text-sm">Battery quantity (max {maxRequestQuantity ?? 0})</Label>
                            <Input
                                type="number"
                                min={1}
                                max={maxRequestQuantity ?? 1}
                                value={createForm.quantity}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value, 10);
                                    setCreateForm(f => ({ ...f, quantity: isNaN(val) ? 1 : val }));
                                }}
                            />
                        </div>
                        {apiError && (
                            <div className="text-sm text-red-600">{apiError}</div>
                        )}
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={() => setOpenCreate(false)}>Cancel</Button>
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
                            }} disabled={isSubmitting || !canCreateRequest || (parseInt(createForm.quantity, 10) || 0) <= 0}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    'Create request'
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Error Popup: show errors without hiding the table */}
            <Dialog open={openError} onOpenChange={setOpenError}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-5 w-5" /> Notification
                        </DialogTitle>
                        <DialogDescription className="text-red-700">
                            {apiError}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end">
                        <Button variant="outline" onClick={() => setOpenError(false)}>Close</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

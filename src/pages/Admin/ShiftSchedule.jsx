import React, { useMemo, useState } from 'react';
import { CalendarDays, Plus, Filter, Clock, User2, MapPin, Trash2, Edit3, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from '../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useStation } from '../../hooks/useStation';
import { useUser } from '../../hooks/useUser';
import { useShifts } from '../../hooks/useShifts';

// Helper function to format ISO datetime to HH:MM
const formatTimeToHHMM = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
};

const ShiftSchedule = () => {
    const { stations = [], loading: stationsLoading } = useStation();
    const { users: staffList = [], loading: usersLoading } = useUser({ role: 'staff' });

    const [filters, setFilters] = useState({ stationId: 'all', staffId: 'all' });
    const [sortBy, setSortBy] = useState('staff_name'); // 'staff_name' or 'start_time'
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [form, setForm] = useState({ stationId: '', staffId: '', startTime: '', endTime: '', notes: '' });

    // Use useShifts hook with filters and pagination
    const { shifts: rawShifts = [], loading: shiftsLoading, error: shiftsError, pagination, fetchShifts } = useShifts({
        staff_id: filters.staffId !== 'all' ? filters.staffId : null,
        station_id: filters.stationId !== 'all' ? filters.stationId : null,
        page: page,
        pageSize: pageSize,
        autoFetch: true
    });

    // Sort shifts based on selected sort option
    const shifts = useMemo(() => {
        if (!rawShifts || rawShifts.length === 0) return [];

        const sortedShifts = [...rawShifts];

        if (sortBy === 'staff_name') {
            sortedShifts.sort((a, b) => {
                const nameA = (a.staff?.fullname || a.staff?.email || '').toLowerCase();
                const nameB = (b.staff?.fullname || b.staff?.email || '').toLowerCase();
                return nameA.localeCompare(nameB);
            });
        } else if (sortBy === 'start_time') {
            sortedShifts.sort((a, b) => {
                const timeA = new Date(a.start_time || 0).getTime();
                const timeB = new Date(b.start_time || 0).getTime();
                return timeA - timeB;
            });
        }

        return sortedShifts;
    }, [rawShifts, sortBy]);

    // Reset to page 1 when filters change
    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({ ...prev, [filterType]: value }));
        setPage(1);
    };

    // Handle page change
    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    // Handle page size change
    const handlePageSizeChange = (newPageSize) => {
        setPageSize(newPageSize);
        setPage(1);
    };

    const handleCreateShift = (e) => {
        e?.preventDefault?.();
        if (!form.stationId || !form.staffId || !form.startTime || !form.endTime) return;
        // TODO: Implement API call to create shift
        // For now, just close dialog and refresh
        setIsDialogOpen(false);
        setForm({ stationId: '', staffId: '', startTime: '', endTime: '', notes: '' });
        fetchShifts();
    };

    const handleDeleteShift = (id) => {
        // TODO: Implement API call to delete shift
        // For now, just refresh
        fetchShifts();
    };

    // For recurring daily shifts, no date grouping is needed

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Shift Scheduling</h1>
                    <p className="mt-2 text-gray-600">Assign staff to stations and manage schedules.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={() => setIsDialogOpen(true)}>
                        <Plus className="h-4 w-4" /> New Shift
                    </Button>
                </div>
            </div>

            <Card className="p-4">
                <div className="flex flex-wrap items-end gap-4">
                    <div className="w-full sm:w-56">
                        <Label>Station</Label>
                        <Select value={filters.stationId} onValueChange={(v) => handleFilterChange('stationId', v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="All stations" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                {(stations || []).map(st => (
                                    <SelectItem key={st.id} value={String(st.id)}>{st.name || `Station ${st.id}`}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-full sm:w-56">
                        <Label>Staff</Label>
                        <Select value={filters.staffId} onValueChange={(v) => handleFilterChange('staffId', v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="All staff" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                {staffList.map(s => (
                                    <SelectItem key={s.account_id} value={String(s.account_id)}>{s.fullname || s.email || `Staff ${s.account_id}`}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-full sm:w-48">
                        <Label>Page Size</Label>
                        <Select value={String(pageSize)} onValueChange={(v) => handlePageSizeChange(parseInt(v))}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10 per page</SelectItem>
                                <SelectItem value="25">25 per page</SelectItem>
                                <SelectItem value="50">50 per page</SelectItem>
                                <SelectItem value="100">100 per page</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-full sm:w-48">
                        <Label>Sort By</Label>
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="staff_name">Staff Name</SelectItem>
                                <SelectItem value="start_time">Start Time</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-4">
                    <Card className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            {(stationsLoading || usersLoading || shiftsLoading) && (
                                <Badge variant="outline">Loading data…</Badge>
                            )}
                            {shiftsError && (
                                <Badge variant="destructive">Error: {shiftsError}</Badge>
                            )}
                        </div>

                        {/* Simple flat list for recurring daily shifts */}
                        <div className="space-y-2">
                            {shiftsLoading && (
                                <p className="text-sm text-gray-500">Loading shifts...</p>
                            )}
                            {!shiftsLoading && shifts.length === 0 && (
                                <p className="text-sm text-gray-500">No shifts to display.</p>
                            )}
                            {!shiftsLoading && shifts.map(s => {
                                const startTime = formatTimeToHHMM(s.start_time);
                                const endTime = formatTimeToHHMM(s.end_time);
                                const timeRange = `${startTime} - ${endTime}`;
                                const staffName = s.staff?.fullname || s.staff?.email || '—';
                                const stationName = s.station?.station_name || 'Unknown station';
                                return (
                                    <div key={s.shift_id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                                        <div className="flex items-center gap-4">
                                            <Badge variant="outline" className="whitespace-nowrap">{timeRange}</Badge>
                                            <div>
                                                <div className="font-medium text-gray-900 flex items-center gap-2">
                                                    <User2 className="h-4 w-4 text-gray-500" /> {staffName}
                                                </div>
                                                <div className="text-sm text-gray-600 flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-gray-400" /> {stationName}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="sm"><Edit3 className="h-4 w-4" /></Button>
                                            <Button variant="destructive" size="sm" onClick={() => handleDeleteShift(s.shift_id)}><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {pagination && pagination.totalPages > 1 && (() => {
                            // Convert to numbers to avoid string concatenation issues
                            const currentPage = Number(pagination.page) || 1;
                            const totalPages = Number(pagination.totalPages) || 1;
                            const pageSize = Number(pagination.pageSize) || 10;
                            const total = Number(pagination.total) || 0;

                            const handlePrevious = () => {
                                if (currentPage === 1) {
                                    // Wrap to last page
                                    handlePageChange(totalPages);
                                } else {
                                    handlePageChange(currentPage - 1);
                                }
                            };

                            const handleNext = () => {
                                if (currentPage >= totalPages) {
                                    // Wrap to first page
                                    handlePageChange(1);
                                } else {
                                    handlePageChange(currentPage + 1);
                                }
                            };

                            return (
                                <div className="mt-6 pt-4 border-t border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-700">
                                            Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
                                            <span className="font-medium">
                                                {Math.min(currentPage * pageSize, total)}
                                            </span> of{' '}
                                            <span className="font-medium">{total}</span> results
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handlePrevious}
                                                disabled={shiftsLoading}
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                                Previous
                                            </Button>
                                            <div className="text-sm text-gray-700">
                                                Page <span className="font-medium">{currentPage}</span> of{' '}
                                                <span className="font-medium">{totalPages}</span>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleNext}
                                                disabled={shiftsLoading}
                                            >
                                                Next
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </Card>
                </div>

                <div className="space-y-4">

                    <Card className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Tips</h3>
                        <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                            <li>Use filters to focus by station or staff.</li>
                            <li>Click “New Shift” to add assignments.</li>
                            <li>Prevent overlaps and respect station capacity.</li>
                        </ul>
                    </Card>
                </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create shift</DialogTitle>
                        <DialogDescription>Assign a staff member to a station and time range.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateShift} className="space-y-4 p-6 pt-0">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label>Station</Label>
                                <Select value={form.stationId} onValueChange={(v) => setForm(prev => ({ ...prev, stationId: v }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select station" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(stations || []).map(st => (
                                            <SelectItem key={`dlg-st-${st.id}`} value={String(st.id)}>{st.name || `Station ${st.id}`}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Staff</Label>
                                <Select value={form.staffId} onValueChange={(v) => setForm(prev => ({ ...prev, staffId: v }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select staff" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {staffList.map(s => (
                                            <SelectItem key={`dlg-staff-${s.account_id}`} value={String(s.account_id)}>{s.fullname || s.email}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Start time</Label>
                                <Input type="time" value={form.startTime} onChange={(e) => setForm(prev => ({ ...prev, startTime: e.target.value }))} />
                            </div>
                            <div>
                                <Label>End time</Label>
                                <Input type="time" value={form.endTime} onChange={(e) => setForm(prev => ({ ...prev, endTime: e.target.value }))} />
                            </div>
                            <div className="sm:col-span-2">
                                <Label>Notes</Label>
                                <Input value={form.notes} onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))} placeholder="Optional" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit">Create</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ShiftSchedule;



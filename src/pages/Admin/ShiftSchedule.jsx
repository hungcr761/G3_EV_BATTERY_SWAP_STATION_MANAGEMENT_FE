import React, { useMemo, useState } from 'react';
import { CalendarDays, Plus, Filter, Clock, User2, MapPin, Trash2, Edit3 } from 'lucide-react';
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
import { useCrud } from '../../hooks/useApi';
import { userAPI } from '../../lib/apiServices';

const ShiftSchedule = () => {
    const { stations = [], loading: stationsLoading } = useStation();
    const { items: users = [], loading: usersLoading } = useCrud(userAPI);
    const staffList = []
    // const staffList = useMemo(() => (users || []).filter(u => (u.role || u.account_type || '').toString().toLowerCase() === 'staff'), [users]);

    const [view, setView] = useState('week'); // 'day' | 'week' | 'month'
    const [filters, setFilters] = useState({ stationId: 'all', staffId: 'all' });
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [form, setForm] = useState({ stationId: '', staffId: '', startTime: '', endTime: '', notes: '' });
    const [shifts, setShifts] = useState([
        // Mock initial data; replace with API later (daily recurring)
        { id: 's1', stationId: '1', staffId: '101', startTime: '07:00', endTime: '09:00', notes: 'Morning' },
    ]);

    const filteredShifts = useMemo(() => {
        return shifts.filter(s => (filters.stationId === 'all' || s.stationId === filters.stationId) && (filters.staffId === 'all' || s.staffId === filters.staffId));
    }, [shifts, filters]);

    const getStation = (id) => (stations || []).find(st => String(st.id) === String(id)) || {};
    const getStaff = (id) => (staffList || []).find(st => String(st.id || st.user_id) === String(id)) || {};

    const handleCreateShift = (e) => {
        e?.preventDefault?.();
        if (!form.stationId || !form.staffId || !form.startTime || !form.endTime) return;
        const newShift = { id: `tmp-${Date.now()}`, stationId: form.stationId, staffId: form.staffId, startTime: form.startTime, endTime: form.endTime, notes: form.notes || '' };
        setShifts(prev => [...prev, newShift]);
        setIsDialogOpen(false);
        setForm({ stationId: '', staffId: '', startTime: '', endTime: '', notes: '' });
    };

    const handleDeleteShift = (id) => setShifts(prev => prev.filter(s => s.id !== id));

    // For recurring daily shifts, no date grouping is needed

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Shift Scheduling</h1>
                    <p className="mt-2 text-gray-600">Assign staff to stations and manage schedules.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => setView('day')} className={view === 'day' ? 'border-blue-600 text-blue-700' : ''}>Day</Button>
                    <Button variant="outline" onClick={() => setView('week')} className={view === 'week' ? 'border-blue-600 text-blue-700' : ''}>Week</Button>
                    <Button variant="outline" onClick={() => setView('month')} className={view === 'month' ? 'border-blue-600 text-blue-700' : ''}>Month</Button>
                    <Button onClick={() => setIsDialogOpen(true)}>
                        <Plus className="h-4 w-4" /> New Shift
                    </Button>
                </div>
            </div>

            <Card className="p-4">
                <div className="flex flex-wrap items-end gap-4">
                    <div className="w-full sm:w-56">
                        <Label>Station</Label>
                        <Select value={filters.stationId} onValueChange={(v) => setFilters(prev => ({ ...prev, stationId: v }))}>
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
                        <Select value={filters.staffId} onValueChange={(v) => setFilters(prev => ({ ...prev, staffId: v }))}>
                            <SelectTrigger>
                                <SelectValue placeholder="All staff" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                {staffList.map(s => (
                                    <SelectItem key={s.id || s.user_id} value={String(s.id || s.user_id)}>{s.name || s.full_name || s.email || `Staff ${(s.id || s.user_id)}`}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="ml-auto flex items-center gap-2 text-gray-500">
                        <Filter className="h-4 w-4" />
                        <span className="text-sm">{filteredShifts.length} shift(s) shown</span>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-4">
                    <Card className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <CalendarDays className="h-5 w-5 text-blue-600" />
                                <h3 className="text-lg font-semibold text-gray-900">{view === 'week' ? 'This Week' : view === 'day' ? 'Today' : 'This Month'}</h3>
                            </div>
                            {(stationsLoading || usersLoading) && (
                                <Badge variant="outline">Loading data…</Badge>
                            )}
                        </div>

                        {/* Simple flat list for recurring daily shifts */}
                        <div className="space-y-2">
                            {filteredShifts.length === 0 && (
                                <p className="text-sm text-gray-500">No shifts to display.</p>
                            )}
                            {filteredShifts.map(s => {
                                const st = getStation(s.stationId);
                                const staff = getStaff(s.staffId);
                                const timeRange = `${s.startTime} - ${s.endTime}`;
                                return (
                                    <div key={s.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                                        <div className="flex items-center gap-4">
                                            <Badge variant="outline" className="whitespace-nowrap">{timeRange}</Badge>
                                            <div>
                                                <div className="font-medium text-gray-900 flex items-center gap-2">
                                                    <User2 className="h-4 w-4 text-gray-500" /> {staff.name || staff.full_name || staff.email || '—'}
                                                </div>
                                                <div className="text-sm text-gray-600 flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-gray-400" /> {st.name || 'Unknown station'}
                                                </div>
                                                {s.notes && <div className="text-xs text-gray-500 mt-1">{s.notes}</div>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="sm"><Edit3 className="h-4 w-4" /></Button>
                                            <Button variant="destructive" size="sm" onClick={() => handleDeleteShift(s.id)}><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </div>

                <div className="space-y-4">
                    <Card className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Daily overview</h3>
                        <div className="space-y-3">
                            {filteredShifts.map(s => {
                                const st = getStation(s.stationId);
                                const staff = getStaff(s.staffId);
                                return (
                                    <div key={`today-${s.id}`} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                        <Clock className="h-4 w-4 text-gray-500 mt-1" />
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{s.startTime} - {s.endTime}</div>
                                            <div className="text-sm text-gray-700">{staff.name || staff.full_name || staff.email}</div>
                                            <div className="text-xs text-gray-500">{st.name}</div>
                                        </div>
                                    </div>
                                );
                            })}
                            {filteredShifts.length === 0 && (
                                <p className="text-sm text-gray-500">No shifts configured.</p>
                            )}
                        </div>
                    </Card>

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
                                            <SelectItem key={`dlg-staff-${s.id || s.user_id}`} value={String(s.id || s.user_id)}>{s.name || s.full_name || s.email}</SelectItem>
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



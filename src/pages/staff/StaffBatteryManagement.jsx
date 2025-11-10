import React, { useEffect, useState, useMemo } from 'react';
import {
  Battery,
  RefreshCw,
  Search,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Box,
  Zap,
  Activity,
  MapPin
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useCabinets from '@/hooks/useCabinets';
import useTransfer from '@/hooks/useTransfer';

export default function StaffBatteryManagement() {
  const { cabinets, batteries, loading, error, inShift, shift, refetch } = useCabinets();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCabinet, setFilterCabinet] = useState('all');
  const {
    maxRequestQuantity
  } = useTransfer();
  useEffect(() => {
    if (!loading) {
      console.log('[StaffBatteryManagement] Cabinets:', cabinets);
    }
  }, [loading, shift, cabinets, batteries]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalCabinets = cabinets.length;
    const totalBatteries = batteries.length;
    const totalSlots = cabinets.reduce((sum, cab) => sum + (cab.battery_capacity || 0), 0);
    const occupiedSlots = totalBatteries;
    const emptySlots = totalSlots - occupiedSlots;

    return {
      totalCabinets,
      totalBatteries,
      totalSlots,
      occupiedSlots,
      emptySlots
    };
  }, [cabinets, batteries]);

  // Get unique cabinet codes for filter
  const cabinetCodes = useMemo(() => {
    return [...new Set(cabinets.map(cab => cab.cabinet_code || cab.cabinets_code).filter(Boolean))];
  }, [cabinets]);

  // Filter batteries
  const filteredBatteries = useMemo(() => {
    return batteries.filter(b => {
      const matchesSearch = !searchTerm ||
        (b.battery_serial?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (b.cabinet_code?.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCabinet = filterCabinet === 'all' || b.cabinet_code === filterCabinet;
      return matchesSearch && matchesCabinet;
    });
  }, [batteries, searchTerm, filterCabinet]);

  // Filter cabinets
  const filteredCabinets = useMemo(() => {
    if (filterCabinet === 'all') return cabinets;
    return cabinets.filter(cab => (cab.cabinet_code || cab.cabinets_code) === filterCabinet);
  }, [cabinets, filterCabinet]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'operational':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
      case 'offline':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSocColor = (soc) => {
    const value = Number(soc ?? 0);
    if (value >= 80) return 'text-green-600';
    if (value >= 60) return 'text-yellow-600';
    if (value >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getSohColor = (soh) => {
    const value = Number(soh ?? 0);
    if (value >= 90) return 'text-green-600';
    if (value >= 80) return 'text-yellow-600';
    if (value >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={refetch} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Station Battery Management</h1>
          <p className="mt-2 text-gray-600">View cabinets and battery slots at your current station</p>
          {inShift && (
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
              <MapPin className="h-4 w-4" />
              <span>
                Current shift at station: <span className="font-medium text-gray-700">{shift?.station?.station_name || `#${shift?.station_id}`}</span>
              </span>
            </div>
          )}
        </div>
        <Button variant="outline" onClick={refetch} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Warning if not in shift */}
      {!inShift && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              <p className="text-sm">You are not currently on shift — the list will be empty.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      {inShift && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Box className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total cabinets</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalCabinets}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-50 rounded-lg">
                <Battery className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total batteries</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalBatteries}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-50 rounded-lg">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Battery Shortage</p>
                <p className="text-2xl font-semibold text-gray-900">{maxRequestQuantity}</p>
              </div>
            </div>
          </Card>

          {/* <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-50 rounded-lg">
                <Activity className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Empty slots</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.emptySlots}</p>
              </div>
            </div>
          </Card> */}
        </div>
      )}

      {/* Search and Filters */}
      {inShift && (
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by battery serial or cabinet code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterCabinet}
                onChange={(e) => setFilterCabinet(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All cabinets</option>
                {cabinetCodes.map(code => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* Batteries Table */}
      {inShift && (
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">
              Batteries at station {shift?.station?.station_name || `#${shift?.station_id}`}
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {filteredBatteries.length === 0 ? (
              <div className="flex items-center justify-center p-12">
                <div className="text-center text-gray-500">
                  <Battery className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>{searchTerm || filterCabinet !== 'all' ? 'No matching batteries found' : 'No batteries in station cabinets yet'}</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Serial
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SoC
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SoH
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cabinet
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Slot
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Voltage (V)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current (A)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBatteries.map((b, idx) => (
                      <tr key={b.battery_id || `${b.cabinet_id}-${b.slot_number}-${idx}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{idx + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Battery className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-mono font-medium text-gray-900">{b.battery_serial}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-semibold ${getSocColor(b.current_soc)}`}>
                            {Number(b.current_soc ?? 0)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-semibold ${getSohColor(b.current_soh)}`}>
                            {Number(b.current_soh ?? 0)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{b.cabinet_code}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{b.slot_number}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{b.slot_voltage || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{b.slot_current || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Cabinets Grid */}
      {inShift && filteredCabinets.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Cabinet details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-8 gap-10">
            {filteredCabinets.map((cab) => {
              const occupiedCount = (cab.slots || []).filter(s => s?.battery).length;
              const totalSlots = cab.battery_capacity || 0;
              return (
                <Card key={cab.cabinet_id} className="overflow-hidden hover:shadow-lg transition-shadow xl:col-span-4">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Box className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-lg font-semibold">{cab.cabinet_code || cab.cabinets_code}</CardTitle>
                      </div>
                      <Badge className={getStatusColor(cab.status)}>
                        {cab.status || 'unknown'}
                      </Badge>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Battery className="h-4 w-4" />
                        <span>Capacity: {totalSlots}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="h-4 w-4" />
                        <span>{cab.power_capacity_kw} kW</span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Occupied: {occupiedCount}/{totalSlots}</span>
                        <span>{totalSlots > 0 ? Math.round((occupiedCount / totalSlots) * 100) : 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${totalSlots > 0 ? (occupiedCount / totalSlots) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Slots grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {(cab.slots || []).map((slot) => {
                        const occupied = Boolean(slot?.battery);
                        return (
                          <div
                            key={`${cab.cabinet_id}-${slot.slot_number}`}
                            className={`rounded-lg border p-3 text-xs transition-all min-w-0 ${occupied
                              ? 'bg-emerald-50 border-emerald-300 hover:bg-emerald-100'
                              : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                              }`}
                            title={occupied ? `${slot?.battery?.battery_serial} • SoC ${slot?.battery?.current_soc}% • SoH ${slot?.battery?.current_soh}%` : 'Empty slot'}
                          >
                            <div className="flex items-center justify-between mb-2 gap-1">
                              <span className="font-semibold text-gray-900 whitespace-nowrap">#{slot.slot_number}</span>
                            </div>
                            {occupied ? (
                              <div className="space-y-1.5 min-w-0">
                                <div className="break-words font-mono text-xs">
                                  <div className="font-medium text-gray-900 break-all mt-0.5">
                                    {slot?.battery?.battery_serial || 'N/A'}
                                  </div>
                                </div>
                                <div className="flex flex-col gap-1 pt-1 border-t border-gray-200">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-gray-500 text-xs whitespace-nowrap">SoC:</span>
                                    <span className={`font-semibold text-xs whitespace-nowrap ${getSocColor(slot?.battery?.current_soc)}`}>
                                      {Number(slot?.battery?.current_soc ?? 0).toFixed(1)}%
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-gray-500 text-xs whitespace-nowrap">SoH:</span>
                                    <span className={`font-semibold text-xs whitespace-nowrap ${getSohColor(slot?.battery?.current_soh)}`}>
                                      {Number(slot?.battery?.current_soh ?? 0).toFixed(1)}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="text-gray-400 text-xs pt-1 text-center">Empty slot</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state for cabinets */}
      {!loading && inShift && cabinets.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Box className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">No cabinet data.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


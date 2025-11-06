import { useCallback, useEffect, useState } from 'react';
import { swapAPI } from '@/lib/apiServices';

// Flattened record shape contract:
// {
//   swap_id, swap_time, station: { station_name, address }, vehicle: { license_plate, model_name },
//   soh_in, soh_out, returnedBattery: { battery_serial, chemistry }, retrievedBattery: { battery_serial, chemistry }
// }
export function useSwapHistory() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ search: '', dateRange: 'all' });
  const [filtered, setFiltered] = useState([]);

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
      if (!userData) throw new Error('User not found');
      const user = JSON.parse(userData);
      const res = await swapAPI.getSwapRecordsByDriver(user.account_id);
      const data = res?.data?.data || [];

      const flat = Array.isArray(data) ? data.map(r => ({
        swap_id: r.swap_id,
        swap_time: r.swap_time,
        station: {
          name: r.station?.station_name,
          address: r.station?.address,
          id: r.station?.station_id
        },
        vehicle: {
          license_plate: r.vehicle?.license_plate,
          model_name: r.vehicle?.model?.name
        },
        soh_in: r.soh_in,
        soh_out: r.soh_out,
        returnedBattery: {
          serial: r.returnedBattery?.battery_serial,
          chemistry: r.returnedBattery?.batteryType?.cell_chemistry,
          type_code: r.returnedBattery?.batteryType?.battery_type_code,
          current_soh: r.returnedBattery?.current_soh,
          current_soc: r.returnedBattery?.current_soc
        },
        retrievedBattery: {
          serial: r.retrievedBattery?.battery_serial,
          chemistry: r.retrievedBattery?.batteryType?.cell_chemistry,
          type_code: r.retrievedBattery?.batteryType?.battery_type_code,
          current_soh: r.retrievedBattery?.current_soh,
          current_soc: r.retrievedBattery?.current_soc
        }
      })) : [];

      // Sort newest first
      flat.sort((a,b) => new Date(b.swap_time) - new Date(a.swap_time));
      setRecords(flat);
    } catch (e) {
      console.error('Failed to fetch swap records', e);
      setError(e.message || 'Failed to load swap history');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  // Filtering
  useEffect(() => {
    let list = [...records];
    if (filters.dateRange !== 'all') {
      const monthsMap = { month: 1, '3months': 3, '6months': 6, year: 12 };
      const months = monthsMap[filters.dateRange];
      if (months) {
        const cutoff = new Date();
        cutoff.setMonth(cutoff.getMonth() - months);
        list = list.filter(r => new Date(r.swap_time) >= cutoff);
      }
    }
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      list = list.filter(r => (
        (r.vehicle.license_plate || '').toLowerCase().includes(q) ||
        (r.station.name || '').toLowerCase().includes(q) ||
        (r.station.address || '').toLowerCase().includes(q) ||
        (r.vehicle.model_name || '').toLowerCase().includes(q) ||
        (r.swap_id || '').toLowerCase().includes(q)
      ));
    }
    setFiltered(list);
  }, [records, filters]);

  const updateFilters = useCallback((patch) => {
    setFilters(prev => ({ ...prev, ...patch }));
  }, []);

  const formatDateTime = useCallback((dt) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(new Date(dt));
  }, []);

  return {
    records,
    filtered,
    loading,
    error,
    filters,
    updateFilters,
    formatDateTime,
    refetch: fetchRecords
  };
}

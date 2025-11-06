import { useCallback, useEffect, useMemo, useState } from 'react';
import { cabinetAPI } from '@/lib/apiServices';
import { useShifts } from './useShifts';

// Fetch station cabinets only when staff is on an active shift.
export default function useCabinets() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cabinets, setCabinets] = useState([]);

  const { shift, loading: shiftLoading, error: shiftError, fetchCurrentShift } = useShifts();
  
  const fetchCabinets = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Ensure we have shift info
      const current = shift || await fetchCurrentShift();
      const stationId = current?.station_id || current?.station?.station_id;
      // Debug logs (Vite: remove or comment out in production if needed)
      console.log('[useCabinets] current shift:', current);
      console.log('[useCabinets] stationId:', stationId);
      if (!stationId) {
        setCabinets([]);
        return [];
      }

      const res = await cabinetAPI.getByStation(stationId);
      const list = res?.data?.payload?.cabinets?.data || res?.data?.payload?.cabinets || [];
      console.log('[useCabinets] fetched cabinets:', list);
      setCabinets(Array.isArray(list) ? list : []);
      return list;
    } catch (e) {
      setCabinets([]);
      setError(e?.response?.data?.message || 'Không thể tải danh sách tủ pin.');
      return [];
    } finally {
      setLoading(false);
    }
  }, [shift, fetchCurrentShift]);

  useEffect(() => {
    fetchCabinets();
  }, [fetchCabinets]);

  const inShift = useMemo(() => Boolean(shift?.station_id || shift?.station?.station_id), [shift]);
  const batteries = useMemo(() => {
    try {
      return (cabinets || []).flatMap(cab =>
        (cab?.slots || [])
          .filter(s => s?.battery)
          .map(s => ({
            ...s.battery,
            cabinet_id: cab?.cabinet_id,
            cabinet_code: cab?.cabinets_code || cab?.cabinet_code,
            cabinet_status: cab?.status,
            station_id: cab?.station_id,
            slot_number: s?.slot_number,
            slot_voltage: s?.voltage,
            slot_current: s?.current,
          }))
      );
    } catch {
      return [];
    }
  }, [cabinets]);

  return {
    cabinets,
    batteries,
    loading: loading || shiftLoading,
    error: error || shiftError,
    inShift,
    shift,
    refetch: fetchCabinets,
    fetchCabinets,
  };
}

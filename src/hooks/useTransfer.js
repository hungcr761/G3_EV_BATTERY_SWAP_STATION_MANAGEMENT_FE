import { transferAPI, batteryAPI } from '@/lib/apiServices';
import React, { useCallback, useEffect, useState } from 'react'
import { useShifts } from './useShifts';

export default function useTransfer() {
  const { shift } = useShifts();
  const [transfer, setTransfer] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [shortage, setShortage] = useState({ TotalBatteries: 0, AvailableForSwap: 0, BatteryShortage: 0, message: '' });

  const fetchTransfers = useCallback(async () => {
    setLoading(true);
    const stationId = shift?.station_id;
    if (!stationId) {
      setTransfer([]);
      return;
    }

    try {
      const res = await transferAPI.getByStation();
      const listRequest = res?.data?.payload?.transfers?.data || res?.data?.payload?.transfers || [];
      const filtered = Array.isArray(listRequest) ? listRequest.filter((r) => Number(r?.station_id) === Number(stationId)) : [];
      setTransfer(filtered);
    } catch (e) {
      setApiError(e?.message || 'Failed to load transfers');
      setTransfer([]);
    } finally {
      setLoading(false);
    }
  }, [shift]);

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  // Fetch station shortage summary for the staff's current station
  const fetchShortage = useCallback(async () => {
    const stationId = shift?.station_id;
    if (!stationId) {
      setShortage({ TotalBatteries: 0, AvailableForSwap: 0, BatteryShortage: 0, message: '' });
      return;
    }
    try {
      const res = await batteryAPI.getSummaryByStation(stationId);
      const data = res?.data?.data || res?.data?.payload || res?.data || {};
      console.log(data);
      setShortage({
        TotalBatteries: Number(data.TotalBatteries) || 0,
        AvailableForSwap: Number(data.AvailableForSwap) || 0,
        BatteryShortage: Number(data.BatteryShortage) || 0,
        message: data.message || ''
      });
    } catch {
      // On error, reset shortage info but don't block other actions
      setShortage({ TotalBatteries: 0, AvailableForSwap: 0, BatteryShortage: 0, message: '' });
    }
  }, [shift]);

  useEffect(() => {
    fetchShortage();
  }, [fetchShortage]);

  const handleAddTransfer = async (data, onSuccess) => {
    setIsSubmitting(true);
    setApiError('');
    try {
      // Enforce station shortage rules
      const reqQty = Number(data.request_quantity);
      const maxQty = Number(shortage?.BatteryShortage) || 0;
      // If no shortage, block creating request
      if (maxQty <= 0) {
        setIsSubmitting(false);
  setApiError('The station is not short of batteries, cannot create a transfer request.');
        return;
      }
      if (maxQty > 0 && (isNaN(reqQty) || reqQty <= 0)) {
        setIsSubmitting(false);
        setApiError('Please enter a valid quantity greater than 0.');
        return;
      }
      if (maxQty > 0 && reqQty > maxQty) {
        setIsSubmitting(false);
        setApiError(`Requested quantity exceeds station shortage (${maxQty}).`);
        return;
      }

      const payload = {
        request_quantity: data.request_quantity,
        notes: data.notes
      };

      const res = await transferAPI.create(payload);
      const isSuccess = res?.data?.success === true ||
        res.status === 200 ||
        res.status === 201;

      if (isSuccess) {
        setMessage({
          type: 'Success',
          text: 'Transfer Request Created Successfully!'
        });
        await fetchTransfers();
        if (onSuccess) {
          onSuccess();
        }

        setTimeout(() => {
          setMessage({ type: '', text: '' });
        }, 4000);
      }
    } catch (e) {
      setApiError(e?.response?.data?.message || 'Error while saving data.');
      console.log(e?.response?.data?.message || 'Error while saving data.')
    } finally {
      setIsSubmitting(false);
    };
  };

  // Confirm a specific transfer order by its ID
  const handleConfirmOrder = async (orderId, options = {}) => {
    if (!orderId) return null;
    setApiError('');
    try {
      const res = await transferAPI.confirmOrder(orderId);
      const data = res?.data?.payload || res?.data?.data || res?.data || {};
      setMessage({ type: 'Success', text: 'Transfer confirmed successfully!' });
      if (!options?.skipFetch) {
        await fetchTransfers();
      }
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 4000);
      return data;
    } catch (e) {
  setApiError(e?.response?.data?.message || 'Confirmation failed.');
      throw e;
    }
  };

  return {
    transfer,
    loading,
    message,
    isSubmitting,
    apiError,
    shortage,
  shortageWarning: (shortage?.BatteryShortage || 0) > 0 ? `Station is short of ${shortage.BatteryShortage} batteries.` : '',
    maxRequestQuantity: (shortage?.BatteryShortage || 0) > 0 ? Number(shortage.BatteryShortage) : null,
    canCreateRequest: (shortage?.BatteryShortage || 0) > 0,
    fetchTransfers,
    fetchShortage,
    handleAddTransfer,
    handleConfirmOrder,
    setMessage,
    setApiError,
  }
}

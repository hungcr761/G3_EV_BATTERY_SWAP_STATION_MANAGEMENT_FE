import { transferAPI } from '@/lib/apiServices';
import React, { useCallback, useEffect, useState } from 'react'
import { useShifts } from './useShifts';

export default function useTransfer() {
  const { shift } = useShifts(); 
  const [transfer, setTransfer] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({type: '', text: ''});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(''); 

  const fetchTransfers = useCallback(async() => {
    setLoading(true);
    const stationId = shift?.station_id;
    if(!stationId){
      setTransfer([]);
      return;
    }

    try{
      const res = await transferAPI.getByStation();
      const listRequest = res?.data?.payload?.transfers?.data || res?.data?.payload?.transfers || [];
      const filtered = Array.isArray(listRequest) ? listRequest.filter((r) => Number(r?.station_id) === Number(stationId)) : [];
      setTransfer(filtered);
    }catch(e){
      setApiError(e?.message || 'Failed to load transfers');
      setTransfer([]);
    }finally{
      setLoading(false);
    }
  },[shift]);

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  const handleAddTransfer = async (data , onSuccess) => {
    setIsSubmitting(true);
    setApiError('');
    try{
      const payload = {
        request_quantity: data.request_quantity,
        notes: data.notes
      };

      const res = await transferAPI.create(payload);
      const isSuccess = res?.data?.success === true ||
      res.status === 200 ||
      res.status === 201;

      if(isSuccess){
        setMessage({
          type: 'Success',
          text: 'Transfer Request Created Successfully!'
        });
        await fetchTransfers();
        if(onSuccess){
          onSuccess();
        }

        setTimeout(() => {
          setMessage({type: '', text: ''});
        },4000);
      }
    }catch(e){
      setApiError(e?.response?.data?.message || 'Error while saving data.');
      console.log(e?.response?.data?.message || 'Error while saving data.')
    }finally{
      setIsSubmitting(false);
    };
  };

  return {
    transfer,
    loading,
    message,
    isSubmitting,
    apiError,
    fetchTransfers,
    handleAddTransfer,
    setMessage,
    setApiError,
  }
}

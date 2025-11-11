import { bookingAPI } from '@/lib/apiServices';
import { useCallback, useEffect, useState } from 'react'

export default function useBooking() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchBookings = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await bookingAPI.getMyBookings();
            const data =
                response?.data?.bookings ||
                response?.data?.payload?.bookings ||
                response?.data?.data?.bookings ||
                [];
            setBookings(Array.isArray(data) ? data : []);
        } catch (e) {
            setError(e?.response?.data?.message || e?.message || 'Failed to load bookings');
            setBookings([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    return {
        bookings,
        loading,
        error,
        refetch: fetchBookings,
    };
}

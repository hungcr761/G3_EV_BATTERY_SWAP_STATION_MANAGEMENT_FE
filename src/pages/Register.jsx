import React, { useEffect, useState } from 'react'

export default function Register() {
    const [booking, setBooking] = useState();
    const [loading, setLoading] = useState(false);
    const [error , setError] = useState(null);


    useEffect(() => {
        const fetchBookings = async () => {
            setLoading(true);
            try {
                const response = await getMyBookings();
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                setBooking(data);
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        }

        fetchBookings();
    },[]);

  return (
    <div>Register</div>
  )
}

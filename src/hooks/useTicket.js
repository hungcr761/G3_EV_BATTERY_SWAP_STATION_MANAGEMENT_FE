import { ticketAPI } from '@/lib/apiServices';
import React, { useCallback, useEffect, useState } from 'react'

export default function useTicket() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);


    //fetch tickets driver
    const fetchTickets = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const userInfor = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');

            if (!userInfor) {
                throw new Error('User not authenticated');
            }

            const user = JSON.parse(userInfor);
            const res = await ticketAPI.getByDriverId(user.account_id);
            const ticketsData = res.data?.payload?.tickets || [];
            setTickets(ticketsData);
        } catch (err) {
            console.error('Error fetching tickets: ', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);


    // create ticket 
    const createTicket = async (ticketsData) => {
        setIsSubmitting(true);
        try {
            const userInfor = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');

            if (!userInfor) {
                throw new Error('User not authenticated');
            }
            const user = JSON.parse(userInfor);

            const payload = {
                driver_id: user.account_id,
                subject: ticketsData.subject,
                description: ticketsData.description
            };

            const res = await ticketAPI.create(payload);

            if (res.status === 200 || res.status === 201) {
                setMessage({
                    type: 'success',
                    text: 'Ticket created successfully!'
                });

                await fetchTickets();

                setTimeout(() => setMessage({
                    type: '',
                    text: ''
                }), 3000);

                return true;
            }
        } catch (err) {
            console.error('Error creating ticket: ', err);
            setMessage({
                type: 'error',
                text: 'Failed to create ticket.'
            });

            setTimeout(() => setMessage({
                type: '',
                text: ''
            }), 3000);
        } finally {
            setIsSubmitting(false);
        }
    };
    return {
        tickets,
        loading,
        error,
        message,
        isSubmitting,

        fetchTickets,
        createTicket
    };
}

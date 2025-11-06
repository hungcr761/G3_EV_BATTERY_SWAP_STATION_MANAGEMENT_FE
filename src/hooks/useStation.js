import { useState, useEffect, useCallback } from 'react';
import { stationAPI } from '../lib/apiServices';

// Helper function to transform station data
const transformStation = (station) => ({
    id: station.station_id,
    name: station.station_name,
    address: station.address,
    latitude: station.latitude,
    longitude: station.longitude,
    status: station.status,
    current_battery_count: station.current_battery_count || 0,
    max_battery_capacity: station.max_battery_capacity || 20,
    staff_count: station.staff_count || 0
});

export const useStation = () => {
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch all stations
    const fetchStations = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await stationAPI.getAll();
            // Handle the API response structure: { success: true, payload: { stations: [...] } }
            const stationsData = response.data?.payload?.stations.sort((a, b) => a.station_id - b.station_id) || response.data?.stations.sort((a, b) => a.station_id - b.station_id) || [];

            // Transform the data to match our expected structure
            const transformedStations = stationsData.map(transformStation);
            setStations(transformedStations);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to fetch stations');
            setStations([]);
            console.error('Error fetching stations:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Create station
    const createStation = useCallback(async (stationData) => {
        try {
            setError(null);
            const response = await stationAPI.create(stationData);

            if (response.data?.success) {
                const newStation = response.data?.payload || response.data;
                const transformedStation = transformStation(newStation);

                // Update local state
                setStations(prev => [...prev, transformedStation]);
                // Refetch to ensure data consistency
                await fetchStations();
                return response.data;
            }
            throw new Error('Failed to create station');
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to create station';
            setError(errorMessage);
            throw err;
        }
    }, [fetchStations]);

    // Update station
    const updateStation = useCallback(async (id, stationData) => {
        try {
            setError(null);
            const response = await stationAPI.update(id, stationData);

            if (response.data?.success) {
                const updatedStation = response.data?.payload || response.data;
                const transformedStation = transformStation(updatedStation);

                // Update local state
                setStations(prev => prev.map(station =>
                    station.id === id ? transformedStation : station
                ));
                // Refetch to ensure data consistency
                await fetchStations();
                return response.data;
            }
            throw new Error('Failed to update station');
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to update station';
            setError(errorMessage);
            throw err;
        }
    }, [fetchStations]);

    // Update station status
    const updateStationStatus = useCallback(async (id, status) => {
        try {
            setError(null);
            const response = await stationAPI.updateStatus(id, status);

            if (response.data?.success) {
                // Update local state
                setStations(prev => prev.map(station =>
                    station.id === id ? { ...station, status } : station
                ));
                // Refetch to ensure data consistency
                await fetchStations();
                return response.data;
            }
            throw new Error('Failed to update station status');
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to update station status';
            setError(errorMessage);
            throw err;
        }
    }, [fetchStations]);

    // Delete station
    const deleteStation = useCallback(async (id) => {
        try {
            setError(null);
            const response = await stationAPI.delete(id);

            if (response.data?.success) {
                // Update local state
                setStations(prev => prev.filter(station => station.id !== id));
                // Refetch to ensure data consistency
                await fetchStations();
                return response.data;
            }
            throw new Error('Failed to delete station');
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to delete station';
            setError(errorMessage);
            throw err;
        }
    }, [fetchStations]);

    // Get station by ID
    const getStationById = useCallback(async (id) => {
        try {
            setError(null);
            const response = await stationAPI.getById(id);

            if (response.data?.success) {
                const station = response.data?.payload?.station || response.data?.payload || response.data;
                return transformStation(station);
            }
            throw new Error('Failed to fetch station');
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch station';
            setError(errorMessage);
            throw err;
        }
    }, []);

    // Fetch stations on mount
    useEffect(() => {
        fetchStations();
    }, [fetchStations]);

    return {
        stations,
        loading,
        error,
        fetchStations,
        createStation,
        updateStation,
        updateStationStatus,
        deleteStation,
        getStationById,
        refetch: fetchStations
    };
};

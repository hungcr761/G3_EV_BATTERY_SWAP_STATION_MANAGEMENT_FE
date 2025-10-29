import { useState, useEffect } from 'react';
import { stationAPI } from '../lib/apiServices';

export const useStation = () => {
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchStations = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await stationAPI.getAll();
            // Handle the API response structure: { success: true, payload: { stations: [...] } }
            const stationsData = response.data?.payload?.stations || response.data?.stations || [];

            // Transform the data to match our expected structure
            const transformedStations = stationsData.map(station => ({
                id: station.station_id,
                name: station.station_name,
                address: station.address,
                latitude: station.latitude,
                longitude: station.longitude,
                status: station.status,
                // Add default values for fields that might not be in the API response
                current_battery_count: station.current_battery_count || 0,
                max_battery_capacity: station.max_battery_capacity || 20,
                staff_count: station.staff_count || 0
            }));

            setStations(transformedStations);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch stations');
            console.error('Error fetching stations:', err);
        } finally {
            setLoading(false);
        }
    };

    const createStation = async (stationData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await stationAPI.create(stationData);
            const newStation = response.data?.payload || response.data;

            // Transform the response to match our structure
            const transformedStation = {
                id: newStation.station_id,
                name: newStation.station_name,
                address: newStation.address,
                latitude: newStation.latitude,
                longitude: newStation.longitude,
                status: newStation.status,
                current_battery_count: newStation.current_battery_count || 0,
                max_battery_capacity: newStation.max_battery_capacity || 20,
                staff_count: newStation.staff_count || 0
            };

            setStations(prev => [...prev, transformedStation]);
            return transformedStation;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create station');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateStation = async (id, stationData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await stationAPI.update(id, stationData);
            const updatedStation = response.data?.payload || response.data;

            // Transform the response to match our structure
            const transformedStation = {
                id: updatedStation.station_id,
                name: updatedStation.station_name,
                address: updatedStation.address,
                latitude: updatedStation.latitude,
                longitude: updatedStation.longitude,
                status: updatedStation.status,
                current_battery_count: updatedStation.current_battery_count || 0,
                max_battery_capacity: updatedStation.max_battery_capacity || 20,
                staff_count: updatedStation.staff_count || 0
            };

            setStations(prev => prev.map(station =>
                station.id === id ? transformedStation : station
            ));
            return transformedStation;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update station');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteStation = async (id) => {
        setLoading(true);
        setError(null);
        try {
            await stationAPI.delete(id);
            setStations(prev => prev.filter(station => station.id !== id));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete station');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const getStationById = async (id) => {
        try {
            const response = await stationAPI.getById(id);
            const station = response.data?.payload || response.data;

            // Transform the response to match our structure
            return {
                id: station.station_id,
                name: station.station_name,
                address: station.address,
                latitude: station.latitude,
                longitude: station.longitude,
                status: station.status,
                current_battery_count: station.current_battery_count || 0,
                max_battery_capacity: station.max_battery_capacity || 20,
                staff_count: station.staff_count || 0
            };
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch station');
            throw err;
        }
    };

    useEffect(() => {
        fetchStations();
    }, []);

    return {
        stations,
        loading,
        error,
        fetchStations,
        createStation,
        updateStation,
        deleteStation,
        getStationById
    };
};

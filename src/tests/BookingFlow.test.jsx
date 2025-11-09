import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BookingFlow from '../components/Booking/BookingFlow';
import { jest, describe, beforeEach, it, expect } from '@jest/globals';

const mockCheckAvailability = jest.fn();
const mockCreateBooking = jest.fn();
const mockCancelBooking = jest.fn();
const mockToCanvas = jest.fn(() => Promise.resolve());

jest.mock('../lib/apiServices', () => ({
    bookingAPI: {
        checkAvailability: (...args) => mockCheckAvailability(...args),
        create: (...args) => mockCreateBooking(...args),
        cancel: (...args) => mockCancelBooking(...args),
    },
}));

jest.mock('qrcode', () => ({
    __esModule: true,
    default: {
        toCanvas: (...args) => mockToCanvas(...args),
    },
    toCanvas: (...args) => mockToCanvas(...args),
}));

const baseStation = {
    id: 'station-1',
    name: 'Central Station',
    address: '123 Main St',
    status: 'available',
};

const singleSlotVehicle = {
    vehicle_id: 'vehicle-1',
    modelName: 'EcoRider',
    vin: 'VIN-123',
    license_plate: 'ABC-123',
    batteryType: 'BT-1',
    model: {
        name: 'EcoRider',
        battery_slot: 1,
        batteryType: { battery_type_code: 'BT-1' },
    },
};

const multiSlotVehicle = {
    vehicle_id: 'vehicle-2',
    modelName: 'PowerDuo',
    vin: 'VIN-456',
    license_plate: 'XYZ-789',
    batteryType: 'BT-2',
    model: {
        name: 'PowerDuo',
        battery_slot: 2,
        batteryType: { battery_type_code: 'BT-2' },
    },
};

const buildBookingResponse = () => ({
    data: {
        booking: {
            booking_id: 'booking-123',
            status: 'pending',
            scheduled_time: '2025-01-01T10:00:00Z',
            vehicle: {
                model: {
                    name: 'EcoRider',
                    batteryType: { battery_type_code: 'BT-1' },
                    battery_slot: 1,
                },
                vin: 'VIN-123',
                license_plate: 'ABC-123',
            },
            station: {
                station_name: 'Central Station',
                address: '123 Main St',
                status: 'operational',
            },
            driver: {
                name: 'Driver One',
            },
            batteries: [
                {
                    battery_id: 'bat-1',
                    battery_serial: 'SERIAL-001',
                    current_soc: 90,
                    current_soh: 95,
                },
            ],
            create_time: '2025-01-01T09:30:00Z',
            expired_time: '2025-01-01T10:00:00Z',
        },
    },
});

describe('BookingFlow', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders initial confirmation UI for single-slot vehicles (UI rendering)', async () => {
        mockCheckAvailability.mockResolvedValueOnce({ data: { available: true } });

        render(
            <BookingFlow
                selectedStation={baseStation}
                selectedVehicle={singleSlotVehicle}
            />
        );

        expect(await screen.findByText(/Schedule Battery Swap/i)).toBeInTheDocument();
        expect(
            await screen.findByRole('heading', { name: /Confirm Booking/i })
        ).toBeInTheDocument();
        expect(screen.getByText(/Step 1\/2: Confirm Booking/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(mockCheckAvailability).toHaveBeenCalledWith(
                baseStation.id,
                singleSlotVehicle.vehicle_id
            );
        });
    });

    it('moves from battery selection to confirmation for multi-slot vehicles (state transition)', async () => {
        mockCheckAvailability.mockResolvedValueOnce({ data: { available: true } });
        const user = userEvent.setup();

        render(
            <BookingFlow
                selectedStation={baseStation}
                selectedVehicle={multiSlotVehicle}
            />
        );

        expect(
            await screen.findByRole('heading', { name: /Select the number of batteries/i })
        ).toBeInTheDocument();

        await user.click(
            screen.getByRole('button', { name: /Continue/i })
        );

        expect(
            await screen.findByRole('heading', { name: /Confirm Booking/i })
        ).toBeInTheDocument();
        expect(screen.getByText(/Step 2\/3: Confirm Booking/i)).toBeInTheDocument();
    });

    it('submits booking and renders success state (event handling & API call)', async () => {
        const onBookingSuccess = jest.fn();
        const onClose = jest.fn();
        const mockResponse = buildBookingResponse();

        mockCheckAvailability.mockResolvedValueOnce({ data: { available: true } });
        mockCreateBooking.mockResolvedValueOnce(mockResponse);

        const user = userEvent.setup();

        render(
            <BookingFlow
                selectedStation={baseStation}
                selectedVehicle={singleSlotVehicle}
                onBookingSuccess={onBookingSuccess}
                onClose={onClose}
            />
        );

        await screen.findByRole('heading', { name: /Confirm Booking/i });

        await user.click(
            screen.getByRole('button', { name: /Confirm Booking/i })
        );

        await waitFor(() => {
            expect(mockCreateBooking).toHaveBeenCalledWith({
                station_id: baseStation.id,
                vehicle_id: singleSlotVehicle.vehicle_id,
                battery_quantity: 1,
            });
        });

        await waitFor(() => {
            expect(onBookingSuccess).toHaveBeenCalledWith(mockResponse.data);
        });

        expect(await screen.findByText(/Booking Successful!/i)).toBeInTheDocument();
        await waitFor(() => {
            expect(mockToCanvas).toHaveBeenCalled();
        });
    });

    it('displays error when availability API marks station unavailable (API error handling)', async () => {
        mockCheckAvailability.mockResolvedValueOnce({ data: { available: false } });

        render(
            <BookingFlow
                selectedStation={baseStation}
                selectedVehicle={singleSlotVehicle}
            />
        );

        expect(
            await screen.findByText(/Station does not have this battery type/i)
        ).toBeInTheDocument();
    });
});


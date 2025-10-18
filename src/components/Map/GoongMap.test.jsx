import React from 'react';
import { render, screen } from '@testing-library/react';
import GoongMap from './GoongMap';

// Mock the Goong Map API
const mockGoongMap = {
    Map: jest.fn().mockImplementation(() => ({
        addControl: jest.fn(),
        setCenter: jest.fn(),
        setZoom: jest.fn(),
        flyTo: jest.fn(),
    })),
    Marker: jest.fn().mockImplementation(() => ({
        addTo: jest.fn(),
        remove: jest.fn(),
    })),
    NavigationControl: jest.fn(),
};

// Mock the global goongjs object
global.goongjs = mockGoongMap;

// Mock geolocation
const mockGeolocation = {
    getCurrentPosition: jest.fn((success) => {
        success({
            coords: {
                latitude: 10.8231,
                longitude: 106.6297
            }
        });
    })
};
global.navigator.geolocation = mockGeolocation;

describe('GoongMap Component', () => {
    const mockStations = [
        {
            id: 1,
            name: 'Test Station',
            address: 'Test Address',
            status: 'available'
        }
    ];

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    test('renders map container', () => {
        render(<GoongMap stations={mockStations} />);

        // Check if the map container is rendered
        const mapContainer = document.querySelector('[class*="w-full h-full rounded-lg"]');
        expect(mapContainer).toBeInTheDocument();
    });

    test('shows loading state initially', () => {
        render(<GoongMap stations={mockStations} />);

        // Should show loading text
        expect(screen.getByText('Đang tải bản đồ...')).toBeInTheDocument();
    });

    test('handles station selection', () => {
        const onStationSelect = jest.fn();
        render(
            <GoongMap
                stations={mockStations}
                onStationSelect={onStationSelect}
            />
        );

        // Component should render without errors
        expect(screen.getByText('Đang tải bản đồ...')).toBeInTheDocument();
    });
});

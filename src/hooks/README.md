# Custom Hooks

This directory contains custom React hooks for managing application state and API interactions.

## useStation.js

A custom hook for managing station data and operations.

### Features
- **Fetch all stations** from `/station` API endpoint
- **CRUD operations** for station management
- **Loading states** and error handling
- **Automatic data refresh** on component mount

### Usage

```jsx
import { useStation } from '../hooks/useStation';

const MyComponent = () => {
  const { 
    stations, 
    loading, 
    error, 
    fetchStations, 
    createStation, 
    updateStation, 
    deleteStation 
  } = useStation();

  // Use the data and functions
  return (
    <div>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {stations.map(station => (
        <div key={station.id}>{station.name}</div>
      ))}
    </div>
  );
};
```

### API Integration

The hook integrates with the following API endpoints:
- `GET /station` - Fetch all stations
- `GET /station/:id` - Fetch station by ID
- `POST /station` - Create new station
- `PUT /station/:id` - Update station
- `DELETE /station/:id` - Delete station

### Data Structure

Expected station data structure from API:
```javascript
{
  id: number,
  name: string,
  address: string,
  status: 'operational' | 'maintenance' | 'low_stock',
  current_battery_count: number,
  max_battery_capacity: number,
  staff_count: number,
  // ... other fields
}
```

### Error Handling

The hook provides comprehensive error handling:
- Network errors
- API response errors
- Authentication errors (handled by API interceptors)
- Loading states for better UX

### Used By

- `AdminDashboard.jsx` - For displaying station count and status
- `StationManagement.jsx` - For full station management interface

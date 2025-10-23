# Kiosk Screen System

## Overview
The kiosk screen system provides an on-site battery swapping interface for customers who arrive at a G3 Battery Swap Station. This is designed for large touchscreen displays mounted at physical stations.

## Access
- **URL Pattern**: `/kiosk/:stationId` (e.g., `/kiosk/1`, `/kiosk/2`, etc.)
- **Station-Specific**: Each kiosk is configured to open at its specific station URL
- **Direct Access Only**: These routes are not linked in the main navigation and can only be accessed via direct URL
- **No Authentication Required**: Kiosk screens operate independently of user accounts

## URL-Based Station Configuration

Each physical kiosk device simply points its browser to its own station URL:
- **Station 1 kiosk** → `https://yourapp.com/kiosk/1`
- **Station 2 kiosk** → `https://yourapp.com/kiosk/2`
- **Station 10 kiosk** → `https://yourapp.com/kiosk/10`

**Advantages:**
- ✅ Single deployment serves all stations
- ✅ No per-device builds or environment configurations
- ✅ Easy to test any station from development environment
- ✅ Simple browser setup (just set homepage URL)

## User Flow

### 1. Welcome Screen (`/kiosk/:stationId`)
- Displays current station information (name, address)
- Large, touch-friendly welcome interface
- QR code scanner for booking verification
- Manual booking ID entry option
- Clear instructions for customers
- Help information with hotline number
- **Booking Validation**: Verifies booking belongs to this station

### 2. Swap Status (`/kiosk/:stationId/swap/:bookingId`)
- Real-time progress tracking of battery swap
- Display booking and customer information
- 5-step automated swap process:
  1. Booking verification
  2. Parking position preparation
  3. Old battery removal
  4. New battery installation
  5. Final checks and completion
- Safety notices and emergency stop button
- Visual progress indicators with estimated time
- Emergency stop redirects back to station home

### 3. Swap Complete (`/kiosk/:stationId/complete/:bookingId`)
- Success confirmation screen
- Swap summary (duration, battery levels, cost)
- Next service date reminder
- Service rating option
- Auto-redirect to home screen after 30 seconds
- Options to email or print invoice
- Returns to station-specific home page

## Key Features

### Touch-Optimized Design
- Large text (text-xl to text-6xl)
- Large buttons (py-6 to py-12)
- High contrast colors
- Generous spacing between elements

### Auto-Idle Timeout
- 2-minute inactivity detection
- Auto-reset to station's home screen (except during active swap)
- Prevents screen abandonment
- Maintains station context throughout session

### Booking Validation
- **Station Verification**: Checks if booking is for the correct station
- **Time Validation**: Ensures booking hasn't expired
- **Status Check**: Verifies booking hasn't been used or cancelled
- **Clear Error Messages**: Shows specific reasons for validation failures

### Fullscreen Layout
- Custom `KioskLayout` component
- Minimal navigation (Home button only)
- Fixed header and footer
- No authentication header

### Simulated Hardware
Since this is a software-only project:
- **QR Scanner**: Simulated with "Start Scan" button that generates a random booking ID
- **Swap Robot**: Progress simulation with realistic timing (3-8 seconds per step)
- **Manual Entry**: Keyboard input as backup option

## Component Structure

```
src/
├── components/
│   ├── Layout/
│   │   └── KioskLayout.jsx          # Kiosk-specific layout
│   └── Kiosk/
│       ├── QRScanner.jsx             # QR code scanning interface
│       └── SwapProgress.jsx          # Step-by-step progress display
└── pages/kiosk/
    ├── KioskHome.jsx                 # Welcome/check-in screen
    ├── SwapStatus.jsx                # Active swap progress
    └── SwapComplete.jsx              # Completion screen
```

## Integration Points

### Future API Integrations
When connecting to a real backend, implement these API calls:

1. **Booking Verification**
   ```javascript
   await bookingAPI.getById(bookingId);
   ```

2. **Start Swap Session**
   ```javascript
   await swapAPI.start(bookingId);
   ```

3. **Swap Progress Updates**
   ```javascript
   await swapAPI.getStatus(swapSessionId);
   ```

4. **Complete Swap**
   ```javascript
   await swapAPI.complete(swapSessionId);
   ```

### Shared Services
The kiosk uses the same API services from `src/lib/apiServices.js`:
- `bookingAPI` - Booking verification
- `stationAPI` - Station information
- `vehicleAPI` - Vehicle details

## Customization

### Timing Adjustments
In `SwapStatus.jsx`, modify the `stepDurations` array:
```javascript
const stepDurations = [3000, 4000, 8000, 8000, 3000]; // in milliseconds
```

### Idle Timeout
In `KioskLayout.jsx`, change the timeout:
```javascript
const IDLE_TIMEOUT = 120000; // 2 minutes (in milliseconds)
```

### Auto-redirect Timing
In `SwapComplete.jsx`, adjust countdown:
```javascript
const [countdown, setCountdown] = useState(30); // seconds
```

## Testing

### Local Development
1. Start the dev server: `npm run dev`
2. Navigate to a station: `http://localhost:5173/kiosk/1`
3. Click "Quét mã QR" to start the flow
4. Use the simulated scanner or manual entry

### Testing Different Stations
Test multiple stations by changing the station ID in the URL:
```
http://localhost:5173/kiosk/1  # Station 1
http://localhost:5173/kiosk/2  # Station 2
http://localhost:5173/kiosk/10 # Station 10
```

### Testing Scenarios
- **Happy Path**: Complete full swap from QR scan to completion
- **Manual Entry**: Use keyboard to enter booking ID
- **Wrong Station**: Try using a booking from station 2 at station 1 kiosk
- **Expired Booking**: Test with booking past its end time
- **Emergency Stop**: Test emergency stop button during swap
- **Idle Timeout**: Leave kiosk inactive for 2+ minutes
- **Auto-redirect**: Wait 30 seconds on completion screen
- **Station Switching**: Navigate between different station URLs

## Production Deployment

### Hardware Requirements (Recommended)
- 32" - 42" touchscreen display
- 1920x1080 minimum resolution
- Industrial-grade PC (for 24/7 operation)
- Reliable internet connection

### Browser Settings

**Example for Chrome Kiosk Mode:**
```bash
# Windows
chrome.exe --kiosk --app=https://yourapp.com/kiosk/1

# Linux
chromium-browser --kiosk --app=https://yourapp.com/kiosk/1

# macOS
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --kiosk --app=https://yourapp.com/kiosk/1
```

**Additional Settings:**
- Launch in fullscreen/kiosk mode
- Disable browser navigation (F11 or kiosk mode flags)
- Auto-launch on startup
- Disable context menus and right-click
- Set appropriate station URL as homepage

**Setup for 10 Stations:**
Each station's PC/tablet just needs:
1. Set browser homepage to its station URL
2. Enable kiosk mode
3. No other configuration needed!

### Security Considerations
- No personal data persistence
- Session data cleared on completion
- Public network isolation
- Regular security updates

## Future Enhancements

### Planned Features
- [ ] Real QR code camera integration
- [ ] Multi-language support (English, Vietnamese, etc.)
- [ ] Accessibility features (voice guidance, high contrast)
- [ ] Video instructions during swap
- [ ] Live camera feed of swap process
- [ ] Payment processing at kiosk
- [ ] Loyalty program integration
- [ ] SMS/email receipt sending

### Hardware Integration
- [ ] Camera for QR scanning
- [ ] Receipt printer
- [ ] Emergency call button
- [ ] Card reader for payment
- [ ] Vehicle position sensors
- [ ] Battery status sensors

## Support

For technical issues or questions:
- Internal: Contact development team
- On-site: Call hotline 1900-XXXX
- Emergency: Use emergency stop button

---

**Last Updated**: October 2025  
**Version**: 1.0.0  
**Status**: Development/Demo


# Booking System Components

Hệ thống đặt lịch đổi pin được thiết kế với 4 bước chính:

## 1. VehicleSelection.jsx
- **Mục đích**: Cho phép người dùng chọn xe để đặt lịch
- **Tính năng**: 
  - Hiển thị danh sách xe của người dùng
  - Xác định loại pin dựa trên mẫu xe (Type 1 hoặc Type 2)
  - Hiển thị thông tin chi tiết về xe (VIN, biển số, tình trạng pin)

## 2. TimeSelection.jsx
- **Mục đích**: Cho phép người dùng chọn thời gian đến trạm
- **Tính năng**:
  - Chỉ cho phép chọn trong ngày hôm đó
  - Hiển thị các khung giờ 30 phút từ 6:00 - 22:00
  - Cảnh báo về thời gian active 15 phút
  - Hiển thị trạng thái khung giờ (sắp tới, gần đây, có sẵn)

## 3. BookingConfirmation.jsx
- **Mục đích**: Xác nhận thông tin đặt lịch trước khi tạo
- **Tính năng**:
  - Hiển thị countdown timer
  - Tóm tắt thông tin xe, trạm và thời gian
  - Cảnh báo về quy tắc 15 phút
  - Xác nhận cuối cùng

## 4. BookingSuccess.jsx
- **Mục đích**: Hiển thị kết quả đặt lịch thành công
- **Tính năng**:
  - Hiển thị mã đặt lịch
  - Thông tin chi tiết về xe, trạm và thời gian
  - Hướng dẫn và lưu ý quan trọng

## 5. BookingFlow.jsx
- **Mục đích**: Component chính quản lý toàn bộ quy trình đặt lịch
- **Tính năng**:
  - Quản lý 4 bước đặt lịch
  - Tích hợp API check availability
  - Xử lý timer 15 phút
  - Tự động hủy booking sau 15 phút

## API Integration

### Check Availability
```javascript
POST /booking/check-availability
{
  "station_id": "station-123",
  "battery_type": "type1",
  "scheduled_time": "2024-01-15T09:30:00Z"
}
```

### Create Booking
```javascript
POST /booking
{
  "station_id": "station-123",
  "vehicle_id": "vehicle-456",
  "battery_type": "type1",
  "scheduled_time": "2024-01-15T09:30:00Z",
  "status": "pending"
}
```

### Auto Delete Booking
```javascript
DELETE /booking/{id}
```

## Quy tắc 15 phút

1. **Khi user chọn thời gian**: Lệnh đặt sẽ active từ thời điểm đó + 15 phút
2. **Ví dụ**: Chọn 9:30 → Active từ 9:30 - 9:45
3. **Sau 15 phút**: Tự động gọi API delete booking
4. **Countdown timer**: Hiển thị thời gian còn lại để xác nhận

## Usage

```jsx
import BookingFlow from './components/Booking/BookingFlow';

<BookingFlow
  selectedStation={station}
  onBookingSuccess={(data) => console.log('Success:', data)}
  onClose={() => setShowBooking(false)}
/>
```

## Integration với Stations Page

- Nút "Đặt lịch" trên mỗi trạm
- Modal hiển thị BookingFlow
- Tích hợp với thông tin trạm đã chọn

## Integration với Booking Page

- Nút "Đặt lịch mới" để bắt đầu quy trình
- Sử dụng trạm demo hoặc cho phép chọn trạm

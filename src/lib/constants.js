// Vehicle Management Constants

export const VEHICLE_MESSAGES = {
    // Success messages
    CREATE_SUCCESS: 'Thêm xe thành công!',
    UPDATE_SUCCESS: 'Cập nhật xe thành công!',
    DELETE_SUCCESS: (modelName, licensePlate) => 
        `Đã xóa xe ${modelName} (${licensePlate}) thành công!`,
    
    // Error messages
    CREATE_ERROR: 'Có lỗi xảy ra khi lưu thông tin',
    UPDATE_ERROR: 'Có lỗi xảy ra khi cập nhật thông tin',
    DELETE_ERROR: 'Không thể xóa xe. Vui lòng thử lại!',
    FETCH_ERROR: 'Không thể tải danh sách xe',
    INVALID_MODEL: 'Vui lòng chọn mẫu xe hợp lệ',
    
    // Info messages
    NO_VEHICLES: 'Chưa có xe nào',
    NO_VEHICLES_DESC: 'Thêm xe điện của bạn để bắt đầu sử dụng dịch vụ',
    LOADING: 'Đang tải...',
};

export const VEHICLE_FORM = {
    TITLE_ADD: 'Thêm xe mới',
    TITLE_EDIT: 'Chỉnh sửa xe',
    DESC_ADD: 'Nhập thông tin xe điện của bạn',
    DESC_EDIT: 'Cập nhật thông tin xe của bạn',
    
    LABELS: {
        VIN: 'Số VIN',
        MODEL: 'Mẫu xe',
        LICENSE_PLATE: 'Biển số xe',
    },
    
    PLACEHOLDERS: {
        VIN: 'Nhập số VIN (17 ký tự)',
        MODEL: 'Chọn mẫu xe',
        LICENSE_PLATE: 'VD: 29A-12345, 30B-123.45',
    },
    
    BUTTONS: {
        ADD: 'Thêm xe',
        UPDATE: 'Cập nhật',
        CANCEL: 'Hủy',
        ADDING: 'Đang thêm...',
        UPDATING: 'Đang cập nhật...',
    },
};

export const MESSAGE_TIMEOUT = {
    SUCCESS: 3000, // 3 seconds
    ERROR: 5000,   // 5 seconds
};

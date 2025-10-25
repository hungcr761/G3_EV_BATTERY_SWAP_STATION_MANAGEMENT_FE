import { z } from 'zod';

// Authentication schemas
export const loginSchema = z.object({
    email: z.string()
        .min(1, 'Email là bắt buộc')
        .email('Email không hợp lệ')
        .max(100, 'Email không được quá 100 ký tự')
        .regex(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            'Email không đúng định dạng'),
    password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
});

export const forgotPasswordSchema = z.object({
    email: z.string()
        .min(1, 'Email là bắt buộc')
        .email('Email không hợp lệ')
        .max(100, 'Email không được quá 100 ký tự')
        .regex(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            'Email không đúng định dạng'),
});

export const resetPasswordSchema = z.object({
    newPassword: z.string()
        .min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự')
        .max(50, 'Mật khẩu mới không được quá 50 ký tự'),
    confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
});

export const registerSchema = z.object({
    password: z.string()
        .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
        .max(50, 'Mật khẩu không được quá 50 ký tự'),
    confirmPassword: z.string(),
    fullname: z.string()
        .min(2, 'Họ tên phải có ít nhất 2 ký tự')
        .max(50, 'Họ tên không được quá 50 ký tự')
        .regex(/^[a-zA-ZÀ-ỹĂĐĨŨƠàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệđìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ\s]+$/,
            'Họ tên chỉ được chứa chữ cái và khoảng trắng')
        .refine((val) => val.trim().length >= 2, {
            message: 'Họ tên không được chỉ chứa khoảng trắng'
        })
        .refine((val) => !/\s{2,}/.test(val), {
            message: 'Họ tên không được chứa nhiều khoảng trắng liên tiếp'
        }),
    email: z.string()
        .min(1, 'Email là bắt buộc')
        .email('Email không hợp lệ')
        .max(100, 'Email không được quá 100 ký tự')
        .regex(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            'Email không đúng định dạng'),
    phone_number: z.string()
        .regex(/^[0-9]{10,11}$/, 'Số điện thoại phải có 10-11 chữ số'),
    citizen_id: z.string()
        .min(1, 'Căn cước công dân là bắt buộc')
        .regex(/^[0-9]{12}$/, 'Căn cước công dân phải có đúng 12 chữ số')
        .refine((val) => {
            // Kiểm tra mã tỉnh trong CCCD (2 chữ số đầu)
            const provinceCode = parseInt(val.substring(0, 2));
            return provinceCode >= 1 && provinceCode <= 96;
        }, {
            message: 'Mã tỉnh trong căn cước công dân không hợp lệ'
        }),
    driving_license: z.string()
        .min(1, 'Bằng lái xe là bắt buộc')
        .regex(/^[0-9]{12}$/, 'Bằng lái xe phải có đúng 12 chữ số')
        .refine((val) => {
            // Kiểm tra mã tỉnh trong bằng lái xe (2 chữ số đầu)
            const provinceCode = parseInt(val.substring(0, 2));
            return provinceCode >= 1 && provinceCode <= 96;
        }, {
            message: 'Mã tỉnh trong bằng lái xe không hợp lệ'
        })
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
});

// Vehicle schemas
export const vehicleSchema = z.object({
    vin: z.string()
        .min(1, 'VIN is required')
        .length(17, 'VIN must be exactly 17 characters')
        .regex(/^[A-HJ-NPR-Z0-9]{17}$/, 'VIN is invalid (only uppercase letters and numbers, no I, O, Q)')
        .transform(val => val.toUpperCase()),
    model: z.string()
        .min(1, 'Please select a vehicle model')
        .max(100, 'Model name cannot exceed 100 characters'),
    license_plate: z.string()
        .min(8, 'License plate is required')
        .max(9, 'License plate cannot exceed 9 characters')
        .regex(
            /^[0-9]{2}[A-Z]-[0-9]{4,5}$/,
            'License plate format is invalid (e.g., 20A-1234 or 20A-12345)'
        )
        .transform(val => val.toUpperCase())
        .refine((val) => {
            const provinceCode = parseInt(val.substring(0, 2));
            const excludeCode = [42, 44, 45, 46, 87, 91, 96];
            const hasInvalidProvince =
                provinceCode < 11 || provinceCode > 99 || excludeCode.includes(provinceCode);

            return !hasInvalidProvince;
        }, {
            message:
                'Invalid license plate: province code must be between 11–99 and not one of 42, 44, 45, 46, 87, 91, 96.'
        })
});

// Service package schemas
export const servicePackageSchema = z.object({
    packageType: z.enum(['basic', 'premium', 'unlimited'], {
        errorMap: () => ({ message: 'Vui lòng chọn loại gói dịch vụ' }),
    }),
    batteryType: z.enum(['type1', 'type2'], {
        errorMap: () => ({ message: 'Vui lòng chọn loại pin' }),
    }),
    duration: z.enum(['monthly', 'quarterly', 'yearly'], {
        errorMap: () => ({ message: 'Vui lòng chọn thời hạn gói' }),
    }),
});

// Profile update schema
export const profileUpdateSchema = z.object({
    fullname: z.string()
        .min(2, 'Họ tên phải có ít nhất 2 ký tự')
        .max(50, 'Họ tên không được quá 50 ký tự')
        .regex(/^[a-zA-ZÀ-ỹĂĐĨŨƠàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệđìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ\s]+$/,
            'Họ tên chỉ được chứa chữ cái và khoảng trắng')
        .refine((val) => val.trim().length >= 2, {
            message: 'Họ tên không được chỉ chứa khoảng trắng'
        })
        .refine((val) => !/\s{2,}/.test(val), {
            message: 'Họ tên không được chứa nhiều khoảng trắng liên tiếp'
        }),
    email: z.string()
        .min(1, 'Email là bắt buộc')
        .email('Email không hợp lệ')
        .max(100, 'Email không được quá 100 ký tự')
        .regex(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            'Email không đúng định dạng')
        .refine((val) => !val.includes('..'), {
            message: 'Email không được chứa hai dấu chấm liên tiếp'
        })
        .refine((val) => {
            const localPart = val.split('@')[0];
            return localPart && localPart.length <= 64;
        }, {
            message: 'Phần trước @ không được quá 64 ký tự'
        }),
    phone: z.string()
        .regex(/^[0-9]{10,11}$/, 'Số điện thoại phải có 10-11 chữ số')
        .min(10, 'Số điện thoại phải có ít nhất 10 chữ số'),
    citizen_id: z.string()
        .min(1, 'Căn cước công dân là bắt buộc')
        .regex(/^[0-9]{12}$/, 'Căn cước công dân phải có đúng 12 chữ số')
        .refine((val) => {
            // Kiểm tra mã tỉnh trong CCCD (2 chữ số đầu)
            const provinceCode = parseInt(val.substring(0, 2));
            return provinceCode >= 1 && provinceCode <= 96;
        }, {
            message: 'Mã tỉnh trong căn cước công dân không hợp lệ'
        }),
    driving_license: z.string()
        .min(1, 'Bằng lái xe là bắt buộc')
        .regex(/^[0-9]{12}$/, 'Bằng lái xe phải có đúng 12 chữ số')
        .refine((val) => {
            // Kiểm tra mã tỉnh trong bằng lái xe (2 chữ số đầu)
            const provinceCode = parseInt(val.substring(0, 2));
            return provinceCode >= 1 && provinceCode <= 96;
        }, {
            message: 'Mã tỉnh trong bằng lái xe không hợp lệ'
        })
});

// Password change schema
export const passwordChangeSchema = z.object({
    currentPassword: z.string().min(1, 'Mật khẩu hiện tại là bắt buộc'),
    newPassword: z.string()
        .min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự')
        .max(100, 'Mật khẩu mới không được quá 100 ký tự'),
    confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmNewPassword'],
});

// Station search schema
export const stationSearchSchema = z.object({
    location: z.string().min(1, 'Vị trí là bắt buộc'),
    batteryType: z.enum(['type1', 'type2', 'all']).optional(),
    radius: z.number().min(1).max(50).optional(),
});

// Booking schema
export const bookingSchema = z.object({
    stationId: z.string().min(1, 'Vui lòng chọn trạm'),
    batteryType: z.enum(['type1', 'type2'], {
        errorMap: () => ({ message: 'Vui lòng chọn loại pin' }),
    }),
    scheduledTime: z.string().min(1, 'Vui lòng chọn thời gian'),
    vehicleId: z.string().min(1, 'Vui lòng chọn xe'),
});

export default {
    loginSchema,
    registerSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    vehicleSchema,
    servicePackageSchema,
    profileUpdateSchema,
    passwordChangeSchema,
    stationSearchSchema,
    bookingSchema,
};

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
        .regex(/^[0-9]{10,11}$/, 'Số điện thoại phải có 10-11 chữ số')
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
});

// Vehicle schemas
export const vehicleSchema = z.object({
    vin: z.string()
        .min(1, 'Số VIN là bắt buộc')
        .length(17, 'VIN phải có đúng 17 ký tự')
        .regex(/^[A-HJ-NPR-Z0-9]{17}$/, 'VIN không hợp lệ (chỉ chứa chữ in hoa và số, không có I, O, Q)')
        .transform(val => val.toUpperCase()),
    model: z.string()
        .min(1, 'Mẫu xe là bắt buộc')
        .max(100, 'Mẫu xe không được quá 100 ký tự')
        .refine((val) => {
            const validModels = [
                'VinFast Ludo',
                'VinFast Impes',
                'VinFast Klara S',
                'VinFast Theon',
                'VinFast Vento',
                'VinFast Theon S',
                'VinFast Vento S',
                'VinFast Feliz S',
                'VinFast Evo200',
            ];
            return validModels.includes(val);
        }, {
            message: 'Vui lòng chọn mẫu xe từ danh sách'
        }),
    license_plate: z.string()
        .min(1, 'Biển số xe là bắt buộc')
        .max(15, 'Biển số xe không được quá 15 ký tự')
        .regex(
            /^[0-9]{2}[A-Z]{1,2}-[0-9]{3,5}(\.[0-9]{2})?$/,
            'Biển số xe không đúng định dạng (VD: 29A-12345, 30B-123.45)'
        )
        .transform(val => val.toUpperCase())
        .refine((val) => {
            // Kiểm tra mã tỉnh hợp lệ (11-99)
            const provinceCode = parseInt(val.substring(0, 2));
            return provinceCode >= 11 && provinceCode <= 99;
        }, {
            message: 'Mã tỉnh không hợp lệ (phải từ 11-99)'
        })
        .refine((val) => !val.includes('..'), {
            message: 'Biển số xe không được chứa hai dấu chấm liên tiếp'
        })
        .refine((val) => {
            // Không cho phép khoảng trắng
            return !val.includes(' ');
        }, {
            message: 'Biển số xe không được chứa khoảng trắng'
        }),
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

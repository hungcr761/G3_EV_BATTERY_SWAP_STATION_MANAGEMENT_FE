import { z } from 'zod';

// Authentication schemas
export const loginSchema = z.object({
    email: z.string()
        .min(1, 'Email is required')
        .email('Invalid email format')
        .max(100, 'Email cannot exceed 100 characters')
        .regex(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            'Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const forgotPasswordSchema = z.object({
    email: z.string()
        .min(1, 'Email is required')
        .email('Invalid email format')
        .max(100, 'Email cannot exceed 100 characters')
        .regex(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            'Invalid email format'),
});

export const resetPasswordSchema = z.object({
    newPassword: z.string()
        .min(8, 'New password must be at least 8 characters')
        .max(50, 'New password cannot exceed 50 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Password confirmation does not match',
    path: ['confirmPassword'],
});

export const registerSchema = z.object({
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .max(50, 'Password cannot exceed 50 characters'),
    confirmPassword: z.string(),
    fullname: z.string()
        .min(2, 'Full name must be at least 2 characters')
        .max(50, 'Full name cannot exceed 50 characters')
        .regex(/^[a-zA-ZÀ-ỹĂĐĨŨƠàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệđìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ\s]+$/,
            'Full name can only contain letters and spaces')
        .refine((val) => val.trim().length >= 2, {
            message: 'Full name cannot contain only spaces'
        })
        .refine((val) => !/\s{2,}/.test(val), {
            message: 'Full name cannot contain consecutive spaces'
        }),
    email: z.string()
        .min(1, 'Email is required')
        .email('Invalid email format')
        .max(100, 'Email cannot exceed 100 characters')
        .regex(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            'Invalid email format'),
    phone_number: z.string()
        .regex(/^[0-9]{10,11}$/, 'Phone number must have 10-11 digits'),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Password confirmation does not match',
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
        errorMap: () => ({ message: 'Please select a service package type' }),
    }),
    batteryType: z.enum(['type1', 'type2'], {
        errorMap: () => ({ message: 'Please select a battery type' }),
    }),
    duration: z.enum(['monthly', 'quarterly', 'yearly'], {
        errorMap: () => ({ message: 'Please select package duration' }),
    }),
});

// Profile update schema
export const profileUpdateSchema = z.object({
    fullname: z.string()
        .min(2, 'Full name must be at least 2 characters')
        .max(50, 'Full name cannot exceed 50 characters')
        .regex(/^[a-zA-ZÀ-ỹĂĐĨŨƠàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệđìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ\s]+$/,
            'Full name can only contain letters and spaces')
        .refine((val) => val.trim().length >= 2, {
            message: 'Full name cannot contain only spaces'
        })
        .refine((val) => !/\s{2,}/.test(val), {
            message: 'Full name cannot contain consecutive spaces'
        }),
    email: z.string()
        .min(1, 'Email is required')
        .email('Invalid email format')
        .max(100, 'Email cannot exceed 100 characters')
        .regex(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            'Invalid email format')
        .refine((val) => !val.includes('..'), {
            message: 'Email cannot contain consecutive dots'
        })
        .refine((val) => {
            const localPart = val.split('@')[0];
            return localPart && localPart.length <= 64;
        }, {
            message: 'Part before @ cannot exceed 64 characters'
        }),
    phone: z.string()
        .regex(/^[0-9]{10,11}$/, 'Phone number must have 10-11 digits')
        .min(10, 'Phone number must have at least 10 digits'),
    citizen_id: z.string()
        .min(1, 'Citizen ID is required')
        .regex(/^[0-9]{12}$/, 'Citizen ID must have exactly 12 digits')
        .refine((val) => {
            // Check province code in citizen ID (first 2 digits)
            const provinceCode = parseInt(val.substring(0, 2));
            return provinceCode >= 1 && provinceCode <= 96;
        }, {
            message: 'Invalid province code in citizen ID'
        }),
    driving_license: z.string()
        .min(1, 'Driving license is required')
        .regex(/^[0-9]{12}$/, 'Driving license must have exactly 12 digits')
        .refine((val) => {
            // Check province code in driving license (first 2 digits)
            const provinceCode = parseInt(val.substring(0, 2));
            return provinceCode >= 1 && provinceCode <= 96;
        }, {
            message: 'Invalid province code in driving license'
        })
});

// Password change schema
export const passwordChangeSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string()
        .min(6, 'New password must be at least 6 characters')
        .max(100, 'New password cannot exceed 100 characters'),
    confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Password confirmation does not match',
    path: ['confirmNewPassword'],
});

// Station search schema
export const stationSearchSchema = z.object({
    location: z.string().min(1, 'Location is required'),
    batteryType: z.enum(['type1', 'type2', 'all']).optional(),
    radius: z.number().min(1).max(50).optional(),
});

// Booking schema
export const bookingSchema = z.object({
    stationId: z.string().min(1, 'Please select a station'),
    batteryType: z.enum(['type1', 'type2'], {
        errorMap: () => ({ message: 'Please select a battery type' }),
    }),
    scheduledTime: z.string().min(1, 'Please select a time'),
    vehicleId: z.string().min(1, 'Please select a vehicle'),
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

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
        .optional()
        .refine((val) => {
            // Allow blank/empty
            if (!val || val.trim() === '') {
                return true;
            }
            // Must contain only digits
            if (!/^\d+$/.test(val)) {
                return false;
            }
            // Must be 9-10 digits
            if (val.length < 9 || val.length > 10) {
                return false;
            }
            // Normalize: if 9 digits, assume missing leading 0
            const normalized = val.length === 9 ? '0' + val : val;
            // Must start with valid Vietnam phone provider prefix
            // Viettel: 032-039, 086, 096-098
            // Vinaphone: 081-085, 088, 091, 094
            // Mobifone: 070, 076-079, 089, 090, 093
            // Vietnamobile: 052, 056, 058, 092
            // Gmobile: 059, 099
            const validPrefixes = /^0(3[2-9]|5[2689]|7[06789]|8[1-689]|9[0-46-9])\d{7}$/;
            return validPrefixes.test(normalized);
        }, {
            message: 'Phone number must be 9-10 digits and start with a valid Vietnam provider prefix (Vinaphone, Viettel, Mobifone, etc.)'
        }),
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
        .optional()
        .refine((val) => {
            // Allow blank/empty
            if (!val || val.trim() === '') {
                return true;
            }
            // Must contain only digits
            if (!/^\d+$/.test(val)) {
                return false;
            }
            // Must be 9-10 digits
            if (val.length < 9 || val.length > 10) {
                return false;
            }
            // Normalize: if 9 digits, assume missing leading 0
            const normalized = val.length === 9 ? '0' + val : val;
            // Must start with valid Vietnam phone provider prefix
            // Viettel: 032-039, 086, 096-098
            // Vinaphone: 081-085, 088, 091, 094
            // Mobifone: 070, 076-079, 089, 090, 093
            // Vietnamobile: 052, 056, 058, 092
            // Gmobile: 059, 099
            const validPrefixes = /^0(3[2-9]|5[2689]|7[06789]|8[1-689]|9[0-46-9])\d{7}$/;
            return validPrefixes.test(normalized);
        }, {
            message: 'Phone number must be 9-10 digits and start with a valid Vietnam provider prefix (Vinaphone, Viettel, Mobifone, etc.)'
        }),
    citizen_id: z.string()
        .min(1, 'Citizen ID is required')
        .regex(/^[0-9]{12}$/, 'Citizen ID must have exactly 12 digits')
        .refine((val) => {
            // Format: AAA B CC DDDDDD
            // AAA: Province/city code (001-096)
            const provinceCode = parseInt(val.substring(0, 3));
            if (provinceCode < 1 || provinceCode > 96) {
                return false;
            }
            // Exclude reserved/invalid province codes
            const excludedCodes = [42, 44, 45, 46, 87, 91, 96];
            if (excludedCodes.includes(provinceCode)) {
                return false;
            }
            return true;
        }, {
            message: 'Invalid province code in citizen ID (must be 001-096, excluding 042, 044, 045, 046, 087, 091, 096)'
        })
        .refine((val) => {
            // B: Century and gender code (4th digit, 0-9)
            const centuryGenderCode = parseInt(val[3]);
            if (centuryGenderCode < 0 || centuryGenderCode > 9) {
                return false;
            }
            return true;
        }, {
            message: 'Invalid century/gender code in citizen ID (4th digit must be 0-9)'
        })
        .refine((val) => {
            // CC: Last two digits of birth year (5th-6th digits, 00-99)
            const birthYearLastTwo = parseInt(val.substring(4, 6));
            if (birthYearLastTwo < 0 || birthYearLastTwo > 99) {
                return false;
            }
            return true;
        }, {
            message: 'Invalid birth year in citizen ID (5th-6th digits must be 00-99)'
        })
        .refine((val) => {
            // DDDDDD: Unique personal identifier (last 6 digits, 000000-999999)
            const personalId = parseInt(val.substring(6, 12));
            if (personalId < 0 || personalId > 999999) {
                return false;
            }
            return true;
        }, {
            message: 'Invalid personal identifier in citizen ID (last 6 digits must be 000000-999999)'
        }),
    driving_license: z.string()
        .min(1, 'Driving license is required')
        .regex(/^[0-9]{12}$/, 'Driving license must have exactly 12 digits')
        .refine((val) => {
            // Format: XX YY MM DD NNNN
            // XX: Province code (first 2 digits, 01-96)
            const provinceCode = parseInt(val.substring(0, 2));
            if (provinceCode < 1 || provinceCode > 96) {
                return false;
            }
            // Exclude reserved/invalid province codes
            const excludedCodes = [42, 44, 45, 46, 87, 91, 96];
            if (excludedCodes.includes(provinceCode)) {
                return false;
            }
            return true;
        }, {
            message: 'Invalid province code in driving license (must be 01-96, excluding 42, 44, 45, 46, 87, 91, 96)'
        })
        .refine((val) => {
            // YY: Year of issue (3rd-4th digits, last 2 digits of year)
            const issueYear = parseInt(val.substring(2, 4));
            // Valid years: 00-99 (representing 1900-2099, but typically 70-99 for 1970-2099)
            // We'll accept 00-99 but warn if it's before 70 (might be old license)
            if (issueYear < 0 || issueYear > 99) {
                return false;
            }
            return true;
        }, {
            message: 'Invalid issue year in driving license (3rd-4th digits must be 00-99)'
        })
        .refine((val) => {
            // MM: Month of issue (5th-6th digits, 01-12)
            const issueMonth = parseInt(val.substring(4, 6));
            if (issueMonth < 1 || issueMonth > 12) {
                return false;
            }
            return true;
        }, {
            message: 'Invalid issue month in driving license (5th-6th digits must be 01-12)'
        })
        .refine((val) => {
            // DD: Day of issue (7th-8th digits, 01-31)
            const issueDay = parseInt(val.substring(6, 8));
            if (issueDay < 1 || issueDay > 31) {
                return false;
            }
            const issueMonth = parseInt(val.substring(4, 6));
            // Validate day based on month
            const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            if (issueDay > daysInMonth[issueMonth - 1]) {
                return false;
            }
            // Check for February (month 2) - day 29 is only valid in leap years
            // We'll allow day 29 for February as it could be a leap year
            if (issueMonth === 2 && issueDay > 29) {
                return false;
            }
            return true;
        }, {
            message: 'Invalid issue day in driving license (7th-8th digits must be valid day for the given month, 01-31)'
        })
        .refine((val) => {
            // NNNN: Sequential number (last 4 digits, 0001-9999)
            const sequentialNumber = parseInt(val.substring(8, 12));
            if (sequentialNumber < 1 || sequentialNumber > 9999) {
                return false;
            }
            return true;
        }, {
            message: 'Invalid sequential number in driving license (last 4 digits must be 0001-9999)'
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

// Staff creation schema
export const createStaffSchema = z.object({
    email: z.string()
        .min(1, 'Email is required')
        .email('Invalid email format')
        .max(100, 'Email cannot exceed 100 characters')
        .regex(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            'Invalid email format'),
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
    phone_number: z.string()
        .optional()
        .refine((val) => {
            // Allow blank/empty
            if (!val || val.trim() === '') {
                return true;
            }
            // Must contain only digits
            if (!/^\d+$/.test(val)) {
                return false;
            }
            // Must be 9-10 digits
            if (val.length < 9 || val.length > 10) {
                return false;
            }
            // Normalize: if 9 digits, assume missing leading 0
            const normalized = val.length === 9 ? '0' + val : val;
            // Must start with valid Vietnam phone provider prefix
            const validPrefixes = /^0(3[2-9]|5[2689]|7[06789]|8[1-689]|9[0-46-9])\d{7}$/;
            return validPrefixes.test(normalized);
        }, {
            message: 'Phone number must be 9-10 digits and start with a valid Vietnam provider prefix (Vinaphone, Viettel, Mobifone, etc.)'
        }),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Password confirmation does not match',
    path: ['confirmPassword'],
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
    createStaffSchema,
};
